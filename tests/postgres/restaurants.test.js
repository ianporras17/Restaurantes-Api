// tests/postgres/restaurants.test.js
import request    from 'supertest';
import jwt        from 'jsonwebtoken';
import bcrypt     from 'bcrypt';

import app         from '../../src/app.js';
import { sequelize } from '../../src/db/index.js';
import { userDAO }  from '../../src/modules/users/dao/index.js';

let token;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Crear usuario y token
  const u = await userDAO.create({
    email:    'test@pg.com',
    password: await bcrypt.hash('123456', 10),
    role:     'Admin',
  });
  token = jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await sequelize.close();
});

describe('[PG] POST /restaurants', () => {
  it('201 crea restaurante', async () => {
    const res = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'PG Food', address: 'c', phone: '2' });
    expect(res.statusCode).toBe(201);
  });

  it('400 faltan campos', async () => {
    const res = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'MissingPhone' });
    expect(res.statusCode).toBe(400);
  });
});

describe('[PG] GET /restaurants', () => {
  it('200 lista restaurantes', async () => {
    const res = await request(app)
      .get('/restaurants')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
