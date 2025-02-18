const Sequelize = require("sequelize");
require("dotenv").config();

// Force local development mode unless explicitly set
const isProduction = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(
  process.env.LOCAL_DB_NAME || "fitness",  // Default to "fitness_db" if env variable is missing
  process.env.LOCAL_DB_USER || "postgres",   // Default to "postgres"
  process.env.LOCAL_DB_PASSWORD || "kali", // Default password (change if necessary)
  {
    host: process.env.LOCAL_DB_HOST || "localhost", // Default to localhost
    dialect: "postgres",
    logging: console.log, // ✅ Enable logging for debugging in development
    pool: {
      max: 5, // Keep reasonable pool settings
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Debugging: Log connection success or failure
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to local PostgreSQL database successfully!");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
})();

module.exports = sequelize;