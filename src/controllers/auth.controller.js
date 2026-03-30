const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { query } = require('../config/db');
const { HttpError } = require('../utils/http-error');
const { signToken } = require('../utils/jwt');
const { saveOtp, readOtp, clearOtp } = require('../utils/otp-store');
const { NODE_ENV } = require('../config/env');

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(64),
  role: z.enum(['owner', 'caregiver']).optional()
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(64)
});

const otpRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email()
});

const otpVerifySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  otp: z.string().trim().regex(/^\d{6}$/)
});

async function register(req, res) {
  const data = registerSchema.parse(req.body);

  const existingUser = await query('SELECT id FROM users WHERE email = $1', [data.email]);
  if (existingUser.rowCount > 0) {
    throw new HttpError(409, 'An account with that email already exists.');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const result = await query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [data.name, data.email, passwordHash, data.role || 'owner']
  );

  const user = result.rows[0];
  res.status(201).json({
    token: signToken(user),
    user
  });
}

async function login(req, res) {
  const data = loginSchema.parse(req.body);

  const result = await query(
    'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1',
    [data.email]
  );

  if (result.rowCount === 0) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  const user = result.rows[0];
  const isValidPassword = await bcrypt.compare(data.password, user.password_hash);

  if (!isValidPassword) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  res.json({
    token: signToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    }
  });
}

async function requestOtp(req, res) {
  const data = otpRequestSchema.parse(req.body);

  const result = await query(
    'SELECT id, name, email, role, created_at FROM users WHERE email = $1',
    [data.email]
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, 'No account found for this email address.');
  }

  const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
  saveOtp(data.email, otp);

  res.json({
    message: 'OTP generated successfully.',
    debugOtp: NODE_ENV === 'production' ? undefined : otp
  });
}

async function verifyOtp(req, res) {
  const data = otpVerifySchema.parse(req.body);
  const otpRecord = readOtp(data.email);

  if (!otpRecord) {
    throw new HttpError(400, 'OTP expired or not requested yet.');
  }

  if (otpRecord.otp !== data.otp) {
    throw new HttpError(401, 'Invalid OTP.');
  }

  clearOtp(data.email);

  const result = await query(
    'SELECT id, name, email, role, created_at FROM users WHERE email = $1',
    [data.email]
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, 'User not found.');
  }

  const user = result.rows[0];
  res.json({
    token: signToken(user),
    user
  });
}

async function getCurrentUser(req, res) {
  const result = await query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [req.user.id]
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, 'User not found.');
  }

  res.json(result.rows[0]);
}

module.exports = {
  register,
  login,
  requestOtp,
  verifyOtp,
  getCurrentUser
};
