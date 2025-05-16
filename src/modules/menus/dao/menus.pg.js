// src/modules/menus/dao/menus.pg.js
import { Menu } from "../menus.model.js";
import { Restaurant } from "../../restaurants/restaurants.model.js";
import { indexDocumentInElastic } from "../../../utils/indexers.js";
import { getFromCache, setToCache } from "../../../utils/cache.js";

export const pgMenuDAO = {
  async create(data) {
    const nuevo = await Menu.create(data);
    const restaurante = await Restaurant.findByPk(data.restaurantId);

    await indexDocumentInElastic({
      name: nuevo.title,
      category: "Menu",
      description: `Menú de ${restaurante?.name || "Restaurante"}`,
    });

    return nuevo;
  },
  async findById(id) {
    const cached = await getFromCache(`menu:${id}`);
    if (cached) return cached;

    const menu = await Menu.findByPk(id, {
    include: {
      model: Restaurant,
      attributes: ["id", "name", "address"]
      }
    });
    if (menu) await setToCache(`menu:${id}`, menu, 60);
    return menu;
  },
  async update(id, updates) {
    const menu = await Menu.findByPk(id);
    if (!menu) return null;
    Object.assign(menu, updates);
    await menu.save();
    return menu;
  },
  async delete(id) {
    const menu = await Menu.findByPk(id);
    if (!menu) return null;
    await menu.destroy();
    return menu;
  },
  async getRestaurantById(id) {
    return Restaurant.findByPk(id);
  },
};
