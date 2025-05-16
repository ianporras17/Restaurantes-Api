import { DataTypes } from "sequelize";
import { sequelize } from "../../db/index.js";
import { User }       from "../users/users.model.js";
import { Restaurant } from "../restaurants/restaurants.model.js";
import { Menu }       from "../menus/menus.model.js";

export let Order;
if (process.env.DB_ENGINE === "postgres") {
  Order = sequelize.define("Order", {
    menuId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Menus", key: "id" },
      onDelete: "CASCADE",
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "READY", "PICKED_UP", "CANCELLED"),
      defaultValue: "PENDING",
    },
    restaurantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Restaurants", key: "id" },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Users", key: "id" },
      onDelete: "CASCADE",
    },
  }, {
    paranoid: true,
  });

  Restaurant.hasMany(Order, { foreignKey: "restaurantId", as: "orders" });
  User.hasMany(Order,       { foreignKey: "userId",       as: "orders" });
  Menu.hasMany(Order,       { foreignKey: "menuId",       as: "orders" });
  Order.belongsTo(Restaurant, { foreignKey: "restaurantId" });
  Order.belongsTo(User,       { foreignKey: "userId" });
  Order.belongsTo(Menu,       { foreignKey: "menuId" });
}
