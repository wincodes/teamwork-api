const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const admin = require('../middleware/admin');

const authController = new AuthController();


router.post('/create-user', admin, authController.registerUser);

router.post('/signin', authController.login);

module.exports = router;