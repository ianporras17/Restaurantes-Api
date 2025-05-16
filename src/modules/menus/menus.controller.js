// src/modules/menus/menus.controller.js
import { menuDAO } from "./dao/index.js";

export const registerMenu = async (req, res) => {
  try {
    const { title, isActive, restaurantId } = req.body;
    if (!title || !restaurantId) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const restaurante = await menuDAO.getRestaurantById(restaurantId);
    if (!restaurante) {
      return res.status(404).json({ error: "Restaurante no existe" });
    }

    const nuevo = await menuDAO.create({ title, isActive, restaurantId });
    return res.status(201).json({ message: "Menú creado", menu: nuevo });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error en servidor" });
  }
};

export const buscarMenu = async (req, res) => {
  try {
    const menu = await menuDAO.findById(req.params.id);
    if (!menu) return res.status(404).json({ error: "No existe" });
    return res.status(200).json(menu);
  } catch {
    return res.status(500).json({ error: "Error en servidor" });
  }
};

export const actualizarMenu = async (req, res) => {
  try {
    const menu = await menuDAO.update(req.params.id, req.body);
    if (!menu) return res.status(404).json({ error: "No existe" });
    return res.status(200).json({ msg: "Actualizado", menu });
  } catch {
    return res.status(500).json({ error: "Error en servidor" });
  }
};

export const deleteMenu = async (req, res) => {
  try {
    const menu = await menuDAO.delete(req.params.id);
    if (!menu) return res.status(404).json({ error: "No existe" });
    return res.status(200).json({ msg: "Eliminado" });
  } catch {
    return res.status(500).json({ error: "Error en servidor" });
  }
};
