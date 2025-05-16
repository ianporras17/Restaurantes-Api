// src/modules/orders/dao/orders.pg.js
import { Order } from "../orders.model.js";
import { Restaurant } from "../../restaurants/restaurants.model.js";
import { Menu } from "../../menus/menus.model.js";
import { indexDocumentInElastic } from "../../../utils/indexers.js";
import { getFromCache, setToCache } from "../../../utils/cache.js";

export const pgOrderDAO = {
  async create(data) {
    const order = await Order.create(data);
    await indexDocumentInElastic({
      name: `Pedido ${order.id}`,
      category: "Order",
      description: `Pedido para restaurante ${order.restaurantId}`,
    });
    await setToCache(`order:${order.id}`, order, 60);
    return order;
  },

  async findById(id) {
    const cached = await getFromCache(`order:${id}`);
    if (cached) return cached;

    const order = await Order.findByPk(id, {
      include: [
        { model: Restaurant, attributes: ["id", "name", "address"] },
        { model: Menu, attributes: ["id", "title"] },
      ],
    });
    if (order) await setToCache(`order:${id}`, order, 60);
    return order;
  },

  async getMenuById(id) {
    return Menu.findByPk(id);
  },

  async getRestaurantById(id) {
    return Restaurant.findByPk(id);
  },
};
