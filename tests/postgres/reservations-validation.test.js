import request   from 'supertest';
import jwt       from 'jsonwebtoken';
import bcrypt    from 'bcrypt';

import app                   from '../../src/app.js';
import { sequelize }         from '../../src/db/index.js';
import { userDAO }           from '../../src/modules/users/dao/index.js';
import { reservationDAO }    from '../../src/modules/reservations/dao/index.js';
import { restaurantDAO }     from '../../src/modules/restaurants/dao/index.js';


describe('[PG] Reservations controller — validaciones extra', () => {
  let token, userId, restId, resvId;

  beforeAll(async () => {
  let retries = 10;
      while (retries) {
        try {
          console.log(`⏳ Intentando conexión a DB (${11 - retries}/10)...`);
          await sequelize.authenticate();
          console.log("✅ Conexión establecida");
          await sequelize.sync({ force: true });
          console.log("✅ DB sincronizada");
          break;
        } catch (err) {
          console.log("⛔ DB aún no está lista. Reintentando...");
          retries--;
          await new Promise(res => setTimeout(res, 2000));
        }
      }

    console.log("👤 Creando usuario...");
    const u = await userDAO.create({
      email: 'resv@pg.com',
      password: await bcrypt.hash('123', 10),
      role: 'Cliente',
    });
    console.log("✅ Usuario creado");

    token = jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET);
    userId = u.id;

    console.log("🏠 Creando restaurante...");
    const rest = await restaurantDAO.create({ name: 'X', address: 'y', phone: '1' });
    restId = rest.id;
    console.log("✅ Restaurante creado");

    console.log("📆 Creando reservación...");
    const resv = await reservationDAO.create({
      date: '2025-01-01',
      time: '20:00',
      guests: 2,
      restaurantId: restId,
      userId,
    });
    resvId = resv.id;
    console.log("✅ Reservación creada");
  });

  afterAll(async () => {
    console.log("🧹 Cerrando conexión con DB...");
    await sequelize.close();
    console.log("✅ DB cerrada");
  });

  it('400 si faltan datos al crear', async () => {
    const res = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2025-01-01' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Faltan datos necesarios');
  });

  it('404 si restaurante no existe', async () => {
    const res = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2025-01-01',
        time: '19:00',
        guests: 3,
        restaurantId: 999,
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Restaurante no existente');
  });

  it('404 si reservación no existe', async () => {
    const res = await request(app)
      .delete('/reservations/999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('No existe la reservación');
  });

  it('403 si otro usuario intenta cancelar', async () => {
    const other = await userDAO.create({
      email: 'otro@pg.com',
      password: await bcrypt.hash('123', 10),
      role: 'Cliente',
    });

    const otherToken = jwt.sign({ id: other.id, role: other.role }, process.env.JWT_SECRET);

    const res = await request(app)
      .delete(`/reservations/${resvId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Sin permisos para cancelar esta reserva');
  });
});
