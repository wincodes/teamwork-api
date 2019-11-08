const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PostController = require('../controllers/PostController');
const CommentController = require('../controllers/CommentController');

const postController = new PostController();
const commentController = new CommentController();


router.post('/', auth, postController.createArticle);
router.patch('/:articleId', auth, postController.editArticle);
router.delete('/:articleId', auth, postController.deleteArticle);
router.post('/:articleId/comment', auth, commentController.createArticleComment);

module.exports = router;