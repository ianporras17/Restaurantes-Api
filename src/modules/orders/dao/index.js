import { pgOrderDAO }    from "./orders.pg.js";
import { mongoOrderDAO } from "./orders.mongo.js";

export const orderDAO =
  process.env.DB_ENGINE === "mongo"
    ? mongoOrderDAO
    : pgOrderDAO;
