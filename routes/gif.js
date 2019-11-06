const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PostController = require('../controllers/PostController');
const multer = require('../middleware/multer');

const postController = new PostController();


router.post('/', auth, multer,  postController.createGIf);

module.exports = router;