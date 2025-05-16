// src/modules/reservations/dao/reservations.mongo.js
import { ReservationMongo } from "../reservations.mongo.model.js";
import { RestaurantMongo } from "../../restaurants/restaurants.mongo.model.js";
import { toObjectId } from "../../../utils/mongoId.js";
import { indexDocumentInElastic } from "../../../utils/indexers.js";

export const mongoReservationDAO = {
  async create(data) {
    const doc = new ReservationMongo(data);
    const saved = await doc.save();
    await indexDocumentInElastic({
      name: `Reserva ${saved._id.toString()}`,
      category: "Reservation",
      description: `Mesa para ${saved.numberOfPeople} el ${saved.date}`,
    });
    return saved;
  },
  async findById(id) {
    const _id = toObjectId(id);
    if (!_id) return null;
    return ReservationMongo.findById(_id).lean();
  },
  async cancel(id) {
    const _id = toObjectId(id);
    if (!_id) return null;
    return ReservationMongo.findByIdAndUpdate(
      _id,
      { status: "CANCELLED" },
      { new: true, lean: true }
    );
  },
  async getRestaurantById(id) {
    const _id = toObjectId(id);
    if (!_id) return null;
    return RestaurantMongo.findById(_id).lean();
  },
};
