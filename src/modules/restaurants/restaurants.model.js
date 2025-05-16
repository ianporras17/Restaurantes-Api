import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";

export let Restaurant;
if (process.env.DB_ENGINE === "postgres") {
  Restaurant = sequelize.define("Restaurant", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
    },
  });
}
