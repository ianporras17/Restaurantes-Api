// tests/postgres/orders.test.js
import request    from 'supertest';
import jwt        from 'jsonwebtoken';
import bcrypt     from 'bcrypt';

import app                  from '../../src/app.js';
import { sequelize }        from '../../src/db/index.js';
import { userDAO }          from '../../src/modules/users/dao/index.js';
import { restaurantDAO }    from '../../src/modules/restaurants/dao/index.js';
import { menuDAO }          from '../../src/modules/menus/dao/index.js';

let token, restId, menuId, orderId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Crear usuario y token
  const u = await userDAO.create({
    email:    'pg@x.com',
    password: await bcrypt.hash('123', 10),
    role:     'Cliente',
  });
  token = jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET);

  // Crear restaurante
  const rest = await restaurantDAO.create({
    name:    'PG Rest',
    address: 'z',
    phone:   '1',
  });
  restId = rest.id;

  // Crear menú (asegurándonos de pasar isActive)
  const menu = await menuDAO.create({
    title:        'PG Menu',
    restaurantId: restId,
    price:        15,
    isActive:     true,
  });
  menuId = menu.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('[PG] POST /orders', () => {
  it('201 crea orden', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ menuId, total: 15, restaurantId: restId });
    expect(res.statusCode).toBe(201);
    orderId = res.body.order.id;
  });

  it('400 falta campo', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });
});

describe('[PG] GET /orders/:id', () => {
  it('200 obtiene orden existente', async () => {
    const res = await request(app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
