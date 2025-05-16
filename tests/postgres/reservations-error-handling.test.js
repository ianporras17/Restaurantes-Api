import request   from 'supertest';
import jwt       from 'jsonwebtoken';
import bcrypt    from 'bcrypt';

import app                   from '../../src/app.js';
import { sequelize }         from '../../src/db/index.js';
import { userDAO }           from '../../src/modules/users/dao/index.js';
import { reservationDAO }    from '../../src/modules/reservations/dao/index.js';

describe('[PG] Reservations controller — ramas catch', () => {
  let token;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    const u = await userDAO.create({
      email: 'catch@pg.com',
      password: await bcrypt.hash('123', 10),
      role: 'Cliente',
    });
    token = jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET);
  });

  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => { await sequelize.close(); });

  it('POST /reservations → 500 si reservationDAO.create lanza', async () => {
    jest.spyOn(reservationDAO, 'getRestaurantById').mockResolvedValue({ id: 1 });
    jest.spyOn(reservationDAO, 'create').mockImplementation(() => {
      throw new Error('boom');
    });

    const res = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({ date: '2025-01-01', time: '20:00', guests: 2, restaurantId: 1 });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar con la BD');
  });

  it('DELETE /reservations/:id → 500 si reservationDAO.cancel lanza', async () => {
    jest.spyOn(reservationDAO, 'findById').mockResolvedValue({ id: 1, userId: 1 });
    jest.spyOn(reservationDAO, 'cancel').mockImplementation(() => {
      throw new Error('fail');
    });

    const res = await request(app)
      .delete('/reservations/1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar con la BD');
  });
});
