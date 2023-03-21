// implement your posts router here
const express = require('express');
const Post = require('./posts-model');

const router = express.Router();

// 1 GET from /api/posts - return array of all post objects in db
router.get('/', (req, res) => {
    Post.find()
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => {
            res.status(500).json({
                message: "The posts information could not be retrieved"
            })
        });
})

// 2 GET from /api/posts/:id - post object with specified id
router.get('/:id', (req, res) => {
    const { id } = req.params;
    Post.findById(id)
        .then(post => {
            if(!post) {
                res.status(404).json({message: "The post with the specified ID does not exist"})
            } else {
                res.status(200).json(post);
            }
        })
        .catch(err => {
            res.status(500).json({message: "The post information could not be retrieved"})
        })
})

// 3 POST to /api/posts - creates post with info sent in request body, returns newly created post objwect
router.post('/', (req, res) => {
    const { title, contents } = req.body;
    if(!title || !contents) {
        res.status(400).json({message: "Please provide title and contents for the post"});
    } else {
        const newPost = {
            title: title,
            contents: contents
        }
        Post.insert(req.body)
            .then(post => {
                newPost.id = post.id;
                res.status(201).json(newPost);
            })
            .catch(err => {
                res.status(500).json({message: "There was an error while saving the post to the database"});
            });
    }
})


// 4 PUT to /api/posts/:id - Updates the post with the specified id using data from the request body and returns the modified document, not the original
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, contents } = req.body;

    if(!title || !contents) {
        res.status(400).json({message: "Please provide title and contents for the post"});
    } else {
        const updatedPost = {
            id: Number(id), 
            title: title,
            contents: contents
        }
        Post.update(id, updatedPost)
            .then(count => {
                if(count > 0) {
                    res.status(200).json(updatedPost);
                } else {
                    res.status(404).json({ message: "The post with the specified ID does not exist"})
                }
            })
            .catch(err => {
                res.status(500).json({ message: "The post information could not be modified" })
            });
    }

    
})

// 5 DELETE /api/posts/:id - Removes the post with the specified id and returns the deleted post object
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await Post.findById(id);
        if(!deletedUser) {
            res.status(404).json({message: "The post with the specified ID does not exist"})
        } else {
            const count = await Post.remove(id);
            if(count > 0) {
                res.status(200).json(deletedUser);
            } else {
                res.status(500).json({message: "The post could not be removed"})
            }
        }
    } catch {
        res.status(500).json({message: "The post could not be removed"})
    }
})


// 6 GET from /api/posts/:id/comments = Returns an array of all the comment objects associated with the post with the specified id
router.get('/:id/comments', async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(id);
    if(!post) {
        res.status(404).json({message: "The post with the specified ID does not exist"})
    } else {
        Post.findPostComments(id)
        .then(comments => {
            console.log("comments: ", comments);
            res.status(200).json(comments);
        })
        .catch(err => {
            res.status(500).json({message: "The comments information could not be retrieved"})
        });
    }
})


module.exports = router;