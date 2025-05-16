import { pgUserDAO }    from "./users.pg.js";
import { mongoUserDAO } from "./users.mongo.js";

export const userDAO =
  process.env.DB_ENGINE === "mongo"
    ? mongoUserDAO
    : pgUserDAO;
