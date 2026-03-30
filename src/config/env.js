const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  PORT: Number(process.env.PORT || 4000),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-me',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:4200',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
