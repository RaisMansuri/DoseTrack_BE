const express = require('express');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth.middleware');
const { register, login, getCurrentUser } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', requireAuth, asyncHandler(getCurrentUser));

module.exports = router;
