const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_HOST_PORT,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_USER_PASSWORD,
      database: process.env.DATABASE_NAME,
      timezone: "UTC",
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: parseInt(process.env.DATABASE_POOL_MIN), max: parseInt(process.env.DATABASE_POOL_MAX) },
    acquireConnectionTimeout: 10000,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};
