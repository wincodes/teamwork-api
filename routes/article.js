const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PostController = require('../controllers/PostController');

const postController = new PostController();


router.post('/', auth, postController.createArticle);
router.patch('/:articleId', auth, postController.editArticle);
router.delete('/:articleId', auth, postController.deleteArticle);

module.exports = router;