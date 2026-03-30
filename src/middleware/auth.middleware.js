const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { HttpError } = require('../utils/http-error');

function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Authentication required.'));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: Number(payload.sub),
      email: payload.email,
      role: payload.role
    };
    next();
  } catch (_error) {
    next(new HttpError(401, 'Your session is invalid or has expired.'));
  }
}

module.exports = { requireAuth };
