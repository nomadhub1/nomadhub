const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.loginPage);
router.post('/login', authController.loginHandler);
router.post('/logout', authController.logoutHandler);

module.exports = router;
