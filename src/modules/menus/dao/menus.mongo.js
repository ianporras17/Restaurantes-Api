// src/modules/menus/dao/menus.mongo.js
import { MenuMongo } from "../menus.mongo.model.js";
import { RestaurantMongo } from "../../restaurants/restaurants.mongo.model.js";
import { toObjectId } from "../../../utils/mongoId.js";
import { indexDocumentInElastic } from "../../../utils/indexers.js";
import { getFromCache, setToCache } from "../../../utils/cache.js";

export const mongoMenuDAO = {
  async create(data) {
    const doc = new MenuMongo(data);
    const saved = await doc.save();
    const restaurante = await RestaurantMongo.findById(data.restaurantId);

    await indexDocumentInElastic({
      name: saved.title,
      category: "Menu",
      description: `Menú de ${restaurante?.name || "Restaurante"}`,
    });

    return saved;
  },
  async findById(id) {
    const cached = await getFromCache(`menu:${id}`);
    if (cached) return cached;

    const menu = await MenuMongo.findById(id)
      .populate("restaurantId", "name address")
      .lean();
    if (menu) await setToCache(`menu:${id}`, menu, 60);
    return menu;
  },
  async update(id, updates) {
    const _id = toObjectId(id);
    if (!_id) return null;
    return MenuMongo.findByIdAndUpdate(_id, updates, { new: true, lean: true });
  },
  async delete(id) {
    const _id = toObjectId(id);
    if (!_id) return null;
    return MenuMongo.findByIdAndDelete(_id).lean();
  },
  async getRestaurantById(id) {
    const _id = toObjectId(id);
    if (!_id) return null;
    return RestaurantMongo.findById(_id).lean();
  },
};
