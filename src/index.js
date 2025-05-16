import dotenv from "dotenv";
dotenv.config();

import { sequelize, mongoConn } from "./db/index.js";
import { retrySequelizeConnection } from "./utils/retryConnection.js";

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    console.log(`🛠️ DB_ENGINE activo: ${process.env.DB_ENGINE}`);

    if (process.env.DB_ENGINE === "postgres") {
      // 1. Importa modelos primero
      await import("./modules/users/users.model.js");
      await import("./modules/restaurants/restaurants.model.js");
      await import("./modules/menus/menus.model.js");
      await import("./modules/reservations/reservations.model.js");
      await import("./modules/orders/orders.model.js");

      await retrySequelizeConnection(sequelize);

      // ⚠️ Solo sincroniza si DB_SYNC es true
      if (process.env.DB_SYNC === "true") {
        await sequelize.sync({ alter: true });
      }
    }

    if (process.env.DB_ENGINE === "mongo") {
      await mongoConn;

      await import("./modules/users/users.mongo.model.js");
      await import("./modules/restaurants/restaurants.mongo.model.js");
      await import("./modules/menus/menus.mongo.model.js");
      await import("./modules/reservations/reservations.mongo.model.js");
      await import("./modules/orders/orders.mongo.model.js");
    }

    const { default: app } = await import("./app.js");
    app.listen(PORT, () =>
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error crítico al iniciar el servidor:", err);
  }
};

startServer();
