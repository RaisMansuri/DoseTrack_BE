const express = require('express');
const { asyncHandler } = require('../utils/async-handler');
const { requireAuth } = require('../middleware/auth.middleware');
const { listMedicines, createMedicine } = require('../controllers/medicine.controller');

const router = express.Router();

router.use(requireAuth);
router.get('/', asyncHandler(listMedicines));
router.post('/', asyncHandler(createMedicine));

module.exports = router;
