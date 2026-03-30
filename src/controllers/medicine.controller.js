const { z } = require('zod');
const { query } = require('../config/db');
const { HttpError } = require('../utils/http-error');

const medicineSchema = z.object({
  member_id: z.coerce.number().int().positive(),
  medicine_name: z.string().trim().min(2).max(120),
  dosage: z.string().trim().min(1).max(60),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  low_stock_threshold: z.coerce.number().int().min(0).default(5),
  instructions: z.string().trim().max(240).optional().or(z.literal(''))
});

async function listMedicines(req, res) {
  const memberId = Number(req.query.memberId);

  const values = [req.user.id];
  let whereClause = 'fm.user_id = $1';

  if (memberId) {
    values.push(memberId);
    whereClause += ` AND fm.id = $${values.length}`;
  }

  const result = await query(
    `SELECT m.id, m.member_id, fm.member_name, m.medicine_name, m.dosage,
            m.stock_quantity, m.low_stock_threshold, m.instructions, m.created_at
     FROM medicines m
     INNER JOIN family_members fm ON fm.id = m.member_id
     WHERE ${whereClause}
     ORDER BY m.created_at DESC`,
    values
  );

  res.json(result.rows);
}

async function createMedicine(req, res) {
  const data = medicineSchema.parse(req.body);

  const memberResult = await query(
    'SELECT id FROM family_members WHERE id = $1 AND user_id = $2',
    [data.member_id, req.user.id]
  );

  if (memberResult.rowCount === 0) {
    throw new HttpError(404, 'Family member not found.');
  }

  const result = await query(
    `INSERT INTO medicines (member_id, medicine_name, dosage, stock_quantity, low_stock_threshold, instructions)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, member_id, medicine_name, dosage, stock_quantity, low_stock_threshold, instructions, created_at`,
    [
      data.member_id,
      data.medicine_name,
      data.dosage,
      data.stock_quantity,
      data.low_stock_threshold,
      data.instructions || null
    ]
  );

  res.status(201).json(result.rows[0]);
}

module.exports = {
  listMedicines,
  createMedicine
};
