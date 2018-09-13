const config = require('../config').common.database;

module.exports = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  url: process.env.DATABASE_URL,
  dialect: 'postgres'
};
