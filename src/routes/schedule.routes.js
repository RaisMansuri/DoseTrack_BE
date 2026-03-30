const express = require('express');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth.middleware');
const { createSchedule, getTodaySchedule } = require('../controllers/schedule.controller');

const router = express.Router();

router.use(requireAuth);
router.post('/', asyncHandler(createSchedule));
router.get('/today', asyncHandler(getTodaySchedule));

module.exports = router;
