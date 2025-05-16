// src/modules/reservations/dao/reservations.pg.js
import { Reservation } from "../reservations.model.js";
import { Restaurant } from "../../restaurants/restaurants.model.js";
import { indexDocumentInElastic } from "../../../utils/indexers.js";

export const pgReservationDAO = {
  async create(data) {
    const resv = await Reservation.create(data);
    await indexDocumentInElastic({
      name: `Reserva ${resv.id}`,
      category: "Reservation",
      description: `Mesa para ${resv.numberOfPeople} el ${resv.date}`,
    });
    return resv;
  },
  async findById(id) {
    return Reservation.findByPk(id);
  },
  async cancel(id) {
    const reservation = await Reservation.findByPk(id);
    if (!reservation) return null;
    reservation.status = "CANCELLED";
    await reservation.save();
    return reservation;
  },
  async getRestaurantById(id) {
    return Restaurant.findByPk(id);
  },
};
