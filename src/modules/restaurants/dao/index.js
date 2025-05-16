import { pgRestaurantDAO }    from "./restaurants.pg.js";
import { mongoRestaurantDAO } from "./restaurants.mongo.js";

export const restaurantDAO =
  process.env.DB_ENGINE === "mongo"
    ? mongoRestaurantDAO
    : pgRestaurantDAO;
