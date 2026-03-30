const express = require('express');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth.middleware');
const { listMembers, createMember } = require('../controllers/member.controller');

const router = express.Router();

router.use(requireAuth);
router.get('/', asyncHandler(listMembers));
router.post('/', asyncHandler(createMember));

module.exports = router;
