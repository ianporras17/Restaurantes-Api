import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

let sequelize;

if (process.env.NODE_ENV === "test") {
  // En modo test: SQLite en memoria (no necesita Docker ni host externo)
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
  });
} else {
  // En dev/prod: Postgres según tu .env
  sequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    logging: false,
  });
}

export const initDB = () => sequelize.authenticate();
export { sequelize };
