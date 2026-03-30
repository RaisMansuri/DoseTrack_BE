const { query } = require('../config/db');

async function getDashboardSummary(req, res) {
  const today = new Date().toISOString().slice(0, 10);

  const [members, medicines, todayDoseStats, lowStock] = await Promise.all([
    query('SELECT COUNT(*)::int AS count FROM family_members WHERE user_id = $1', [req.user.id]),
    query(
      `SELECT COUNT(*)::int AS count
       FROM medicines m
       INNER JOIN family_members fm ON fm.id = m.member_id
       WHERE fm.user_id = $1`,
      [req.user.id]
    ),
    query(
      `SELECT
          COUNT(*) FILTER (WHERE dt.status = 'taken')::int AS taken,
          COUNT(*) FILTER (WHERE dt.status = 'missed')::int AS missed,
          COUNT(*)::int AS tracked
       FROM dose_tracking dt
       INNER JOIN schedules s ON s.id = dt.schedule_id
       INNER JOIN medicines m ON m.id = s.medicine_id
       INNER JOIN family_members fm ON fm.id = m.member_id
       WHERE fm.user_id = $1
         AND dt.dose_date = $2::date`,
      [req.user.id, today]
    ),
    query(
      `SELECT COUNT(*)::int AS count
       FROM medicines m
       INNER JOIN family_members fm ON fm.id = m.member_id
       WHERE fm.user_id = $1
         AND m.stock_quantity <= m.low_stock_threshold`,
      [req.user.id]
    )
  ]);

  res.json({
    familyMembers: members.rows[0].count,
    medicines: medicines.rows[0].count,
    dosesTakenToday: todayDoseStats.rows[0].taken,
    dosesMissedToday: todayDoseStats.rows[0].missed,
    trackedToday: todayDoseStats.rows[0].tracked,
    lowStockCount: lowStock.rows[0].count
  });
}

module.exports = {
  getDashboardSummary
};
