const express = require('express');
const authRoutes = require('./auth.routes');
const memberRoutes = require('./member.routes');
const medicineRoutes = require('./medicine.routes');
const scheduleRoutes = require('./schedule.routes');
const doseRoutes = require('./dose.routes');
const dashboardRoutes = require('./dashboard.routes');
const inviteRoutes = require('./invite.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/medicines', medicineRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/doses', doseRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/invites', inviteRoutes);

module.exports = router;
