require("dotenv").config();
const knex = require("knex");

const db = knex({
  client: "pg",
  connection: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_HOST_PORT,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_USER_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  searchPath: ["public"],
  pool: { min: 0, max: 10 },
  acquireConnectionTimeout: 10000,
});

module.exports = db;