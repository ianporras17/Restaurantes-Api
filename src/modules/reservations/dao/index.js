import { pgReservationDAO }    from "./reservations.pg.js";
import { mongoReservationDAO } from "./reservations.mongo.js";

export const reservationDAO =
  process.env.DB_ENGINE === "mongo"
    ? mongoReservationDAO
    : pgReservationDAO;
