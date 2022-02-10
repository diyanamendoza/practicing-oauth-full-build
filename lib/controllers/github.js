const { Router } = require('express');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const UserService = require('../services/UserService');

module.exports = Router()
  .get('/login', async (req, res) => {
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${process.env.GH_CLIENT_ID}&redirect_uri=${process.env.GH_REDIRECT_URI}&scope=user`
    );
  })

  .get('/login/callback', async (req, res, next) => {
    try {
      const user = await UserService.create(req.query.code);
      //  * create jwt
      const userJwt = jwt.sign({ ...user }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });
      //  * set cookie and redirect
      res
        .cookie('session', userJwt, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24,
        })
        .redirect('/api/v1/posts');
    } catch (error) {
      next(error);
    }
  })

  .delete('/', (req, res) => {
    res
      .clearCookie(process.env.COOKIE_NAME)
      .json({ success: true, message: 'Signed out successfully!' });
  });
