const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      protocol: "postgres",
      dialectOptions: {
        ssl: {
          require: true, // Ensure SSL is required
          rejectUnauthorized: false, // For self-signed certificates (like Render's PostgreSQL)
        },
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000, // Increase timeout here (default is 10000ms)
        idle: 10000,
      },
    })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
      host: "localhost",
      dialect: "postgres",
    });
module.exports = sequelize;
