const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['email'] }))

router.get('/google/callback', passport.authenticate('google', { successRedirect: '/login-succes.html', failureRedirect: '/login-erro.html' }))

module.exports = router;