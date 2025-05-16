import { reservationDAO } from "./dao/index.js";

export const newReservation = async (req, res) => {
  const { date, time, guests, status, restaurantId } = req.body;

  if (!date || !time || !guests || !restaurantId) {
    return res.status(400).json({ error: "Faltan datos necesarios" });
  }

  try {
    const restaurant = await reservationDAO.getRestaurantById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurante no existente" });
    }

    const reservation = await reservationDAO.create({
      date,
      time,
      guests,
      status,
      restaurantId,
      userId: req.user.id,
    });

    return res.status(201).json({
      msg: "Reservación creada correctamente",
      reservation,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al conectar con la BD" });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const reservation = await reservationDAO.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: "No existe la reservación" });
    }

    const isOwner = String(reservation.userId) === String(req.user.id);
    const isAdmin = req.user.role === "Admin";

    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ error: "Sin permisos para cancelar esta reserva" });
    }

    const updated = await reservationDAO.cancel(req.params.id);
    return res
      .status(200)
      .json({ msg: "Reservación cancelada", reservation: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Error al conectar con la BD" });
  }
};