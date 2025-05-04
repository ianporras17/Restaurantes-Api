import dotenv from "dotenv";
import app from "./app.js";
import { initDB, sequelize } from "./db/index.js";
import "./modules/users/users.model.js"; // importa modelos para sincronización

dotenv.config();

const startServer = async () => {
  try {
    await initDB();
    await sequelize.sync({ alter: true }); // crea o actualiza tablas

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error al conectarse a la base de datos", err);
  }
};

startServer();
