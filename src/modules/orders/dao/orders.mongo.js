// src/modules/orders/dao/orders.mongo.js
import { OrderMongo } from "../orders.mongo.model.js";
import { MenuMongo } from "../../menus/menus.mongo.model.js";
import { RestaurantMongo } from "../../restaurants/restaurants.mongo.model.js";
import { toObjectId } from "../../../utils/mongoId.js";
import { indexDocumentInElastic } from "../../../utils/indexers.js";
import { getFromCache, setToCache } from "../../../utils/cache.js";

export const mongoOrderDAO = {
  async create(data) {
    const doc   = new OrderMongo(data);
    const saved = await doc.save();
    await indexDocumentInElastic({
      name: `Pedido ${saved._id.toString()}`,
      category: "Order",
      description: `Pedido para restaurante ${saved.restaurantId}`,
    });
    await setToCache(`order:${saved._id}`, saved.toObject(), 60);
    return saved;
  },

  async findById(id) {
    const cached = await getFromCache(`order:${id}`);
    if (cached) return cached;

    const _id = toObjectId(id);
    if (!_id) return null;

    const order = await OrderMongo.findById(_id)
      .populate("restaurantId", "name address")
      .populate("menuId", "title")
      .lean();

    if (order) await setToCache(`order:${id}`, order, 60);
    return order;
  },

  async getMenuById(id) {
    const _id = toObjectId(id);
    if (!_id) return null;
    return MenuMongo.findById(_id).lean();
  },

  async getRestaurantById(id) {
    const _id = toObjectId(id);
    if (!_id) return null;
    return RestaurantMongo.findById(_id).lean();
  },
};
