import dotenv from "dotenv";
import app from "./app.js";
import { sequelize } from "./db/index.js";
import { retrySequelizeConnection } from "./utils/retryConnection.js";

// Importar modelos
import "./modules/users/users.model.js";
import "./modules/restaurants/restaurants.model.js";
import "./modules/menus/menus.model.js";
import "./modules/reservations/reservations.model.js";
import "./modules/orders/orders.model.js";

dotenv.config();

const startServer = async () => {
  try {
    await retrySequelizeConnection(sequelize); // ⬅️ Usamos retry aquí
    await sequelize.sync({ alter: true });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error crítico al iniciar el servidor:", err);
  }
};

startServer();
