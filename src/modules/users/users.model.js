import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

export let User;
if (process.env.DB_ENGINE === "postgres") {
  User = sequelize.define("User", {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Cliente",
    },
  });
}
