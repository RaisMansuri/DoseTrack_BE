const crypto = require('crypto');
const { z } = require('zod');
const { query } = require('../config/db');

const inviteSchema = z.object({
  caregiver_email: z.string().trim().toLowerCase().email()
});

async function createCaregiverInvite(req, res) {
  const data = inviteSchema.parse(req.body);
  const inviteToken = crypto.randomBytes(16).toString('hex');

  const result = await query(
    `INSERT INTO shared_access (owner_user_id, caregiver_email, status, invite_token)
     VALUES ($1, $2, 'pending', $3)
     RETURNING id, owner_user_id, caregiver_email, status, invite_token, created_at`,
    [req.user.id, data.caregiver_email, inviteToken]
  );

  res.status(201).json({
    ...result.rows[0],
    message: 'Invite stored successfully. Add your email provider next to deliver this token by email.'
  });
}

module.exports = {
  createCaregiverInvite
};
