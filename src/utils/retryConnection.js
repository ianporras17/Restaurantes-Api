// src/utils/retryConnection.js
export async function retrySequelizeConnection(sequelize, maxRetries = 10, delayMs = 2000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await sequelize.authenticate();
      console.log("✅ Conectado a la base de datos");
      return;
    } catch (err) {
      retries++;
      console.log(`🔁 Intento ${retries}/${maxRetries} - Esperando conexión con DB...`);
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw new Error("❌ No se pudo conectar a la base de datos después de varios intentos");
}
