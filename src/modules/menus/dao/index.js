import { pgMenuDAO }    from "./menus.pg.js";
import { mongoMenuDAO } from "./menus.mongo.js";

export const menuDAO =
  process.env.DB_ENGINE === "mongo"
    ? mongoMenuDAO
    : pgMenuDAO;
