const express = require('express');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth.middleware');
const { markDose, getHistory } = require('../controllers/dose.controller');

const router = express.Router();

router.use(requireAuth);
router.post('/mark-taken', asyncHandler(markDose));
router.get('/history', asyncHandler(getHistory));

module.exports = router;
