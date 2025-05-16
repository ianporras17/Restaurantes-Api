import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";
import { Restaurant } from "../restaurants/restaurants.model.js";

export let Menu;
if (process.env.DB_ENGINE === "postgres") {
  Menu = sequelize.define("Menu", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Restaurants", key: "id" },
      onDelete: "CASCADE",
    },
  });
  Restaurant.hasMany(Menu, { foreignKey: "restaurantId", as: "menus" });
  Menu.belongsTo(Restaurant, { foreignKey: "restaurantId" });
}
