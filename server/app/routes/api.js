const router              = require('express').Router();
const AuthController      = require('../controllers/authController');
const PostController      = require('../controllers/postController');
const MessageController   = require('../controllers/messageController');

const APIRoutes = function(passport) {

  const auth = (req, res, next) => {
    return passport.authenticate('jwt', function(err, user){
      if (err) {
        return res.status(500).json({ message : 'Ошибка на сервере', code : 500 });
      }
      if (!user) {
        return res.status(401).json({ message : 'Ошибка авторизации', code : 401 });
      }
      req.user = user;
      next();
    })(req, res, next)
  }

  router.post('/signup', AuthController.signup);
  router.post('/signin', AuthController.signin);
  router.post('/signin/new_token', AuthController.newToken);
  router.get('/info', function(req, res, next) { auth(req, res, next) }, AuthController.info);
  router.get('/logout', function(req, res, next) { auth(req, res, next) }, AuthController.logout);

  router.post('/posts', function(req, res, next) { auth(req, res, next) }, PostController.addPost);
  router.get('/posts', function(req, res, next) { auth(req, res, next) }, PostController.getPosts);
  router.get('/posts/:id', function(req, res, next) { auth(req, res, next) }, PostController.getPost);
  router.put('/posts/:id', function(req, res, next) { auth(req, res, next) }, PostController.updatePost);
  router.delete('/posts/:id', function(req, res, next) { auth(req, res, next) }, PostController.deletePost);

  router.post('/posts/:id/messages', function(req, res, next) { auth(req, res, next) }, MessageController.addMessage);

  return router;
};

module.exports = APIRoutes;