// src/modules/restaurants/dao/restaurants.mongo.js
import { RestaurantMongo } from "../restaurants.mongo.model.js";
import { toObjectId } from "../../../utils/mongoId.js";
import { indexDocumentInElastic } from "../../../utils/indexers.js";

export const mongoRestaurantDAO = {
  async create(data) {
    const doc = new RestaurantMongo(data);
    const saved = await doc.save();
    await indexDocumentInElastic({
      name: saved.name,
      category: "Restaurant",
      description: saved.address,
    });
    return saved;
  },
  async findAllRestaurant() {
    return RestaurantMongo.find().lean();
  },
  async findById(id) {
    const _id = toObjectId(id);
    if (!_id) return null;
    return RestaurantMongo.findById(_id).lean();
  },
};
