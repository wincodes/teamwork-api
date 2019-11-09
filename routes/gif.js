const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PostController = require('../controllers/PostController');
const multer = require('../middleware/multer');
const CommentController = require('../controllers/CommentController');

const postController = new PostController();
const commentController = new CommentController();


router.post('/', auth, multer,  postController.createGIf);
router.delete('/:gifId', auth, postController.deleteGif);
router.post('/:gifId/comment', auth, commentController.createGifComment);
router.get('/:articleId', auth, postController.getGif);

module.exports = router;