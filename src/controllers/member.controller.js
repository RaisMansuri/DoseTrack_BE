const { z } = require('zod');
const { query } = require('../config/db');

const memberSchema = z.object({
  member_name: z.string().trim().min(2).max(80),
  age: z.coerce.number().int().min(0).max(120).nullable().optional(),
  relation: z.string().trim().min(2).max(40)
});

async function listMembers(req, res) {
  const result = await query(
    `SELECT id, user_id, member_name, age, relation, created_at
     FROM family_members
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [req.user.id]
  );

  res.json(result.rows);
}

async function createMember(req, res) {
  const data = memberSchema.parse(req.body);

  const result = await query(
    `INSERT INTO family_members (user_id, member_name, age, relation)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, member_name, age, relation, created_at`,
    [req.user.id, data.member_name, data.age ?? null, data.relation]
  );

  res.status(201).json(result.rows[0]);
}

module.exports = {
  listMembers,
  createMember
};
