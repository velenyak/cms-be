const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// router.post('/login/facebook', authController.facebookLogin);
router.post('/login/google', authController.googleLogin);
router.post('/login/local', authController.localLogin);
router.post('/register', authController.register);
router.get('/refreshToken', authController.refreshToken);

module.exports = router;
