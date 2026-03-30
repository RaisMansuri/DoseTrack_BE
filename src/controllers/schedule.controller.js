const { z } = require('zod');
const { query } = require('../config/db');
const { HttpError } = require('../utils/http-error');

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const scheduleSchema = z.object({
  medicine_id: z.coerce.number().int().positive(),
  time_slot: z.enum(['morning', 'afternoon', 'night', 'custom']).default('custom'),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/),
  start_date: isoDateSchema,
  end_date: isoDateSchema.optional().or(z.literal('')),
  frequency: z.enum(['daily', 'weekdays', 'alternate-days']).default('daily')
});

async function createSchedule(req, res) {
  const data = scheduleSchema.parse(req.body);

  const medicineResult = await query(
    `SELECT m.id
     FROM medicines m
     INNER JOIN family_members fm ON fm.id = m.member_id
     WHERE m.id = $1 AND fm.user_id = $2`,
    [data.medicine_id, req.user.id]
  );

  if (medicineResult.rowCount === 0) {
    throw new HttpError(404, 'Medicine not found.');
  }

  const result = await query(
    `INSERT INTO schedules (medicine_id, time_slot, scheduled_time, start_date, end_date, frequency)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, medicine_id, time_slot, scheduled_time, start_date, end_date, frequency, created_at`,
    [
      data.medicine_id,
      data.time_slot,
      data.scheduled_time,
      data.start_date,
      data.end_date || null,
      data.frequency
    ]
  );

  res.status(201).json(result.rows[0]);
}

async function getTodaySchedule(req, res) {
  const date = req.query.date || new Date().toISOString().slice(0, 10);

  const result = await query(
    `SELECT s.id, s.medicine_id, s.time_slot, s.scheduled_time, s.start_date, s.end_date, s.frequency,
            m.medicine_name, m.dosage, fm.member_name,
            dt.status AS today_status, dt.notes, dt.taken_at
     FROM schedules s
     INNER JOIN medicines m ON m.id = s.medicine_id
     INNER JOIN family_members fm ON fm.id = m.member_id
     LEFT JOIN dose_tracking dt ON dt.schedule_id = s.id AND dt.dose_date = $1
     WHERE fm.user_id = $2
       AND s.start_date <= $1::date
       AND (s.end_date IS NULL OR s.end_date >= $1::date)
       AND (
         s.frequency = 'daily'
         OR (s.frequency = 'weekdays' AND EXTRACT(ISODOW FROM $1::date) BETWEEN 1 AND 5)
         OR (s.frequency = 'alternate-days' AND MOD(($1::date - s.start_date), 2) = 0)
       )
     ORDER BY s.scheduled_time ASC`,
    [date, req.user.id]
  );

  res.json(result.rows);
}

module.exports = {
  createSchedule,
  getTodaySchedule
};
