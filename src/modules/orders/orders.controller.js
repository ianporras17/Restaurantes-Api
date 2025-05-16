import { orderDAO } from "./dao/index.js";

export const createOrder = async (req, res) => {
  const { menuId, total, restaurantId } = req.body;

  if (!menuId || !total || !restaurantId) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  try {
    const menu = await orderDAO.getMenuById(menuId);
    if (!menu) return res.status(404).json({ error: "Menú no encontrado" });

    const restaurant = await orderDAO.getRestaurantById(restaurantId);
    if (!restaurant) return res.status(404).json({ error: "Restaurante no encontrado" });

    if (String(menu.restaurantId) !== String(restaurantId)) {
      return res
        .status(400)
        .json({ error: "El menú no pertenece a ese restaurante" });
    }

    const order = await orderDAO.create({
      menuId,
      total,
      restaurantId,
      userId: req.user.id,
    });

    return res.status(201).json({ msg: "Orden creada correctamente", order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al conectar con la base de datos" });
  }
};

export const obtenerOrden = async (req, res) => {
  try {
    const order = await orderDAO.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "La orden no existe" });

    const isOwner = String(order.userId) === String(req.user.id);
    const isAdmin = req.user.role === "Admin";

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Sin permisos para ver esta orden" });
    }

    return res.status(200).json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al conectar con la base de datos" });
  }
};
