// tests/mongo/reservations.test.js
jest.setTimeout(60_000);

import mongoose            from 'mongoose';
import request             from 'supertest';
import jwt                 from 'jsonwebtoken';
import bcrypt              from 'bcrypt';

import app                   from '../../src/app.js';
import { userDAO }           from '../../src/modules/users/dao/index.js';
import { restaurantDAO }     from '../../src/modules/restaurants/dao/index.js';
import { reservationDAO }    from '../../src/modules/reservations/dao/index.js';
import { UserMongo }         from '../../src/modules/users/users.mongo.model.js';
import { RestaurantMongo }   from '../../src/modules/restaurants/restaurants.mongo.model.js';
import { ReservationMongo }  from '../../src/modules/reservations/reservations.mongo.model.js';

let token, userId, restId, resvId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.db.dropDatabase();

  // Inicializar índices y esquemas
  await UserMongo.init();
  await RestaurantMongo.init();
  await ReservationMongo.init();

  // Crear usuario y token
  const usr = await userDAO.create({
    email:    'u@x.com',
    password: await bcrypt.hash('123', 10),
    role:     'Cliente',
  });
  userId = usr.id;
  token  = jwt.sign({ id: userId, role: usr.role }, process.env.JWT_SECRET);

  // Crear restaurante en Mongo
  const r = await restaurantDAO.create({ name: 'Tacos', address: 'a', phone: '1' });
  restId = r.id;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('[Mongo] POST /reservations', () => {
  it('201 crea reservación', async () => {
    const r = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date:         '2025-12-01',
        time:         '20:00',
        guests:       2,
        restaurantId: restId,
      });

    expect(r.statusCode).toBe(201);
    // Capturar el id (transformado) de la respuesta
    resvId = r.body.reservation.id;
  });

  it('400 falta data', async () => {
    const r = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(r.statusCode).toBe(400);
  });

  it('404 restaurante no existe', async () => {
    const r = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date:         '2025-12-01',
        time:         '20:00',
        guests:       2,
        restaurantId: '660000000000000000000000',
      });
    expect(r.statusCode).toBe(404);
  });
});

describe('[Mongo] DELETE /reservations/:id', () => {
  it('200 cancela reservación', async () => {
    const r = await request(app)
      .delete(`/reservations/${resvId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(r.statusCode).toBe(200);
    expect(r.body.reservation.status).toBe('CANCELLED');
  });

  it('404 inexistente', async () => {
    const r = await request(app)
      .delete('/reservations/660000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(r.statusCode).toBe(404);
  });

  it('403 otro usuario', async () => {
    const other = await userDAO.create({
      email:    'other@x.com',
      password: await bcrypt.hash('123', 10),
      role:     'Cliente',
    });
    const otherTk = jwt.sign({ id: other.id, role: other.role }, process.env.JWT_SECRET);

    const r = await request(app)
      .delete(`/reservations/${resvId}`)
      .set('Authorization', `Bearer ${otherTk}`);
    expect(r.statusCode).toBe(403);
  });
});
