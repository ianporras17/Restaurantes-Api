import mongoose           from 'mongoose';
import request            from 'supertest';
import jwt                from 'jsonwebtoken';
import bcrypt             from 'bcrypt';

import app                  from '../../src/app.js';
import { userDAO }          from '../../src/modules/users/dao/index.js';
import { reservationDAO }   from '../../src/modules/reservations/dao/index.js';
import { UserMongo }        from '../../src/modules/users/users.mongo.model.js';

describe('[Mongo] Reservations controller — ramas catch', () => {
  let token, userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.db.dropDatabase();
    await UserMongo.init();

    const u = await userDAO.create({
      email: 'catch@mongo.com',
      password: await bcrypt.hash('123', 10),
      role: 'Cliente',
    });
    userId = u.id;
    token = jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET);
    global.mongoUser = { id: u.id }; // útil para otros mocks
  });

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  it('POST /reservations → 500 si reservationDAO.create lanza', async () => {
    jest.spyOn(reservationDAO, 'getRestaurantById').mockResolvedValue({ id: '123' });
    jest.spyOn(reservationDAO, 'create').mockImplementation(() => {
      throw new Error('boom');
    });

    const res = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date: '2025-01-01',
        time: '20:00',
        guests: 2,
        restaurantId: '123',
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar con la BD');
  });

  it('DELETE /reservations/:id → 500 si reservationDAO.cancel lanza', async () => {
    jest.spyOn(reservationDAO, 'findById').mockResolvedValue({
      id: 'fake',
      userId: global.mongoUser.id, // ← debe coincidir con el token
    });

    jest.spyOn(reservationDAO, 'cancel').mockImplementation(() => {
      throw new Error('fail');
    });

    const res = await request(app)
      .delete('/reservations/fake')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar con la BD');
  });
});
