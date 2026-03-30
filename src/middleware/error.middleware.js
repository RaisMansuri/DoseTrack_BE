const { HttpError } = require('../utils/http-error');

function notFound(_req, _res, next) {
  next(new HttpError(404, 'Route not found.'));
}

function errorHandler(error, _req, res, _next) {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation failed.',
      issues: error.issues
    });
  }

  if (error.code === '23505') {
    return res.status(409).json({ message: 'That record already exists.' });
  }

  console.error(error);

  return res.status(500).json({
    message: 'Something went wrong on the server.'
  });
}

module.exports = {
  notFound,
  errorHandler
};
