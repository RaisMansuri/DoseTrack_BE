const express = require('express');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth.middleware');
const { register, login, requestOtp, verifyOtp, getCurrentUser } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/otp/request', asyncHandler(requestOtp));
router.post('/otp/verify', asyncHandler(verifyOtp));
router.get('/me', requireAuth, asyncHandler(getCurrentUser));

module.exports = router;
