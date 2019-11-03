const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const admin = require('../middleware/admin');


router.post('/create-user', admin, AuthController.registerUser);

router.post('/signin', AuthController.login);

module.exports = router;