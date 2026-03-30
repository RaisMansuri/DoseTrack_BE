const express = require('express');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth.middleware');
const { createCaregiverInvite } = require('../controllers/invite.controller');

const router = express.Router();

router.use(requireAuth);
router.post('/caregiver', asyncHandler(createCaregiverInvite));

module.exports = router;
