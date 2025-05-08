// tests/reservations.test.js
import request   from 'supertest';
import app       from '../src/app.js';
import { sequelize } from '../src/db/index.js';
import { User }  from '../src/modules/users/users.model.js';
import { Restaurant } from '../src/modules/restaurants/restaurants.model.js';
import { Reservation } from '../src/modules/reservations/reservations.model.js';
import bcrypt    from 'bcrypt';
import jwt       from 'jsonwebtoken';

let adminToken, client1Token, client2Token;
let restaurantId, reservationId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  /* ─── Usuarios ─────────────────────────────────────────────────────── */
  const admin = await User.create({
    email: 'admin@res.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'Admin',
  });
  adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET);

  const client1 = await User.create({
    email: 'c1@res.com',
    password: await bcrypt.hash('client123', 10),
    role: 'Cliente',
  });
  client1Token = jwt.sign({ id: client1.id, role: client1.role }, process.env.JWT_SECRET);

  const client2 = await User.create({
    email: 'c2@res.com',
    password: await bcrypt.hash('client123', 10),
    role: 'Cliente',
  });
  client2Token = jwt.sign({ id: client2.id, role: client2.role }, process.env.JWT_SECRET);

  /* ─── Restaurante base ─────────────────────────────────────────────── */
  const rest = await Restaurant.create({
    name: 'Pilones',
    address: 'CR',
    phone: '000',
  });
  restaurantId = rest.id;
});

afterAll(async () => {
  await sequelize.close();
});

/* ------------------------------------------------------------------ */
/* POST /reservations                                                 */
/* ------------------------------------------------------------------ */
describe('POST /reservations', () => {
  it('400 falta campo obligatorio', async () => {
    const res = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${client1Token}`)
      .send({ date: '2025-05-11', time: '19:00', guests: 2 }); // sin restaurantId
    expect(res.statusCode).toBe(400);
  });

  it('404 restaurante inexistente', async () => {
    const res = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${client1Token}`)
      .send({ date: '2025-05-11', time: '19:00', guests: 2, restaurantId: 999 });
    expect(res.statusCode).toBe(404);
  });

  it('201 crea reserva', async () => {
    const res = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${client1Token}`)
      .send({
        date: '2025-05-11',
        time: '19:00',
        guests: 2,
        restaurantId,
      });
  
    expect(res.statusCode).toBe(201);                 // ahora coincide con controlador
    expect(res.body.reservation.userId).toBeDefined();
  
    // guarda el id correctamente:
    reservationId = res.body.reservation.id;
  });
});

/* ------------------------------------------------------------------ */
/* DELETE /reservations/:id                                           */
/* ------------------------------------------------------------------ */
describe('DELETE /reservations/:id', () => {
  it('403 otro cliente no puede cancelar', async () => {
    const res = await request(app)
      .delete(`/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${client2Token}`);
    expect(res.statusCode).toBe(403);
  });

  it('200 dueño cancela', async () => {
    const res = await request(app)
      .delete(`/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${client1Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.reservation.status).toBe('CANCELLED');
  });

  it('200 al volver a cancelar (ya estaba cancelada)', async () => {
    const res = await request(app)
      .delete(`/reservations/${reservationId}`)
      .set('Authorization', `Bearer ${client1Token}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.reservation.status).toBe('CANCELLED'); // sigue cancelada
  });
});

/* ------------------------------------------------------------------ */
/* POST /reservations — 500 error interno                             */
/* ------------------------------------------------------------------ */
describe('POST /reservations — error interno', () => {
  let spy;
  beforeAll(() => {
    spy = jest.spyOn(Restaurant, 'findByPk').mockImplementation(() => {
      throw new Error('DB down');
    });
  });
  afterAll(() => spy.mockRestore());

  it('500 cuando Restaurant.findByPk lanza', async () => {
    const res = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${client1Token}`)
      .send({
        date: '2025-05-12',
        time: '18:00',
        guests: 2,
        restaurantId,
      });
    expect(res.statusCode).toBe(500);
  });
});

/* ------------------------------------------------------------------ */
/* DELETE /reservations/:id — ramas faltantes                         */
/* ------------------------------------------------------------------ */
describe('DELETE /reservations/:id — ramas extra', () => {
  it('404 al intentar cancelar una reserva inexistente', async () => {
    const res = await request(app)
      .delete('/reservations/9999')               // id que nunca existió
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('500 cuando Reservation.findByPk lanza error', async () => {
    const spy = jest
      .spyOn(Reservation, 'findByPk')
      .mockImplementation(() => {
        throw new Error('DB crash');
      });

    const res = await request(app)
      .delete('/reservations/123')                // id arbitrario
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(500);
    spy.mockRestore();
  });
});
