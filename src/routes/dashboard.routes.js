const express = require('express');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth.middleware');
const { getDashboardSummary } = require('../controllers/dashboard.controller');

const router = express.Router();

router.use(requireAuth);
router.get('/summary', asyncHandler(getDashboardSummary));

module.exports = router;
