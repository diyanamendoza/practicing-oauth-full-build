const { Router } = require('express');
const Post = require('../models/Post');
const authenticate = require('../middleware/authenticate');

module.exports = Router()
  .get('/', authenticate, async (req, res) => {
    const posts = await Post.getAll();
    res.send(posts);
  })

  .post('/', authenticate, async (req, res, next) => {
    try {
      const newPost = await Post.insert({
        post: req.body.post,
        username: req.user.username,
      });
      res.send(newPost);
    } catch (error) {
      next(error);
    }
  });
