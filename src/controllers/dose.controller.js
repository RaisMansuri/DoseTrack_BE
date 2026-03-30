const { z } = require('zod');
const { query } = require('../config/db');
const { HttpError } = require('../utils/http-error');

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const markDoseSchema = z.object({
  schedule_id: z.coerce.number().int().positive(),
  dose_date: isoDateSchema,
  status: z.enum(['taken', 'missed', 'skipped']),
  notes: z.string().trim().max(240).optional().or(z.literal(''))
});

async function markDose(req, res) {
  const data = markDoseSchema.parse(req.body);

  const scheduleResult = await query(
    `SELECT s.id
     FROM schedules s
     INNER JOIN medicines m ON m.id = s.medicine_id
     INNER JOIN family_members fm ON fm.id = m.member_id
     WHERE s.id = $1 AND fm.user_id = $2`,
    [data.schedule_id, req.user.id]
  );

  if (scheduleResult.rowCount === 0) {
    throw new HttpError(404, 'Schedule not found.');
  }

  const result = await query(
    `INSERT INTO dose_tracking (schedule_id, dose_date, status, notes, taken_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (schedule_id, dose_date)
     DO UPDATE SET status = EXCLUDED.status,
                   notes = EXCLUDED.notes,
                   taken_at = NOW()
     RETURNING id, schedule_id, dose_date, status, notes, taken_at`,
    [data.schedule_id, data.dose_date, data.status, data.notes || null]
  );

  res.status(201).json(result.rows[0]);
}

async function getHistory(req, res) {
  const dateFrom = req.query.dateFrom || new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString().slice(0, 10);
  const dateTo = req.query.dateTo || new Date().toISOString().slice(0, 10);

  const result = await query(
    `SELECT dt.id, dt.schedule_id, dt.dose_date, dt.status, dt.notes, dt.taken_at,
            s.time_slot, s.scheduled_time, m.medicine_name, m.dosage, fm.member_name
     FROM dose_tracking dt
     INNER JOIN schedules s ON s.id = dt.schedule_id
     INNER JOIN medicines m ON m.id = s.medicine_id
     INNER JOIN family_members fm ON fm.id = m.member_id
     WHERE fm.user_id = $1
       AND dt.dose_date BETWEEN $2::date AND $3::date
     ORDER BY dt.dose_date DESC, s.scheduled_time ASC`,
    [req.user.id, dateFrom, dateTo]
  );

  res.json(result.rows);
}

module.exports = {
  markDose,
  getHistory
};
