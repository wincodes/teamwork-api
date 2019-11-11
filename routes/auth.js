const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

const authController = new AuthController();


router.post('/create-user', authController.registerUser);

router.post('/signin', authController.login);

module.exports = router;