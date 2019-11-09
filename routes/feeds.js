const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PostController = require('../controllers/PostController');

const postController = new PostController();


router.get('/', auth, postController.feeds);

module.exports = router;