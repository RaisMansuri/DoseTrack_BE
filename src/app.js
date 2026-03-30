const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRoutes = require('./routes');
const { CLIENT_URL } = require('./config/env');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: false
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    message: 'MedTracker API is running.',
    health: '/health',
    apiBase: '/api'
  });
});

app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'medtracker-api'
  });
});

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = { app };
