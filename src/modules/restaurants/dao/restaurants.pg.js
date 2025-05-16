// src/modules/restaurants/dao/restaurants.pg.js
import { Restaurant } from "../restaurants.model.js";
import { indexDocumentInElastic } from "../../../utils/indexers.js";

export const pgRestaurantDAO = {
  async create(data) {
    const resto = await Restaurant.create(data);
    await indexDocumentInElastic({
      name: resto.name,
      category: "Restaurant",
      description: resto.address,
    });
    return resto;
  },
  async findAllRestaurant() {
    return Restaurant.findAll();
  },
};
