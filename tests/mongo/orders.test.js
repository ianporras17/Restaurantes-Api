// tests/mongo/orders.test.js
jest.setTimeout(60_000);

import mongoose  from 'mongoose';
import request   from 'supertest';
import jwt       from 'jsonwebtoken';
import bcrypt    from 'bcrypt';

import app                  from '../../src/app.js';
import { userDAO }          from '../../src/modules/users/dao/index.js';
import { restaurantDAO }    from '../../src/modules/restaurants/dao/index.js';
import { menuDAO }          from '../../src/modules/menus/dao/index.js';
import { orderDAO }         from '../../src/modules/orders/dao/index.js';
import { UserMongo }        from '../../src/modules/users/users.mongo.model.js';

let token, userId, restId, menuId, orderId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.db.dropDatabase();
  await UserMongo.init();

  // Crear usuario y token
  const u = await userDAO.create({
    email:    'cli@mongo.com',
    password: await bcrypt.hash('123', 10),
    role:     'Cliente',
  });
  userId = u.id;
  token  = jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET);

  // Restaurante + menú
  const rest = await restaurantDAO.create({ name:'Pizza', address:'x', phone:'1' });
  restId = rest.id;
  const menu = await menuDAO.create({
    title:        'Margarita',
    restaurantId: restId,
    price:        10,
  });
  menuId = menu.id;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('[Mongo] POST /orders', () => {
  it('201 crea orden', async () => {
    const r = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ menuId, total:10, restaurantId:restId });

    expect(r.statusCode).toBe(201);
    expect(r.body.order.menuId).toBe(menuId);
    orderId = r.body.order.id;
  });

  it('400 faltan campos', async () => {
    const r = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ total:10 });
    expect(r.statusCode).toBe(400);
  });

  it('404 menú no existe', async () => {
    const r = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ menuId:'660000000000000000000000', total:10, restaurantId:restId });
    expect(r.statusCode).toBe(404);
  });

  it('404 restaurante no existe', async () => {
    const r = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ menuId, total:10, restaurantId:'660000000000000000000000' });
    expect(r.statusCode).toBe(404);
  });

  it('400 menú no pertenece', async () => {
    const otro = await restaurantDAO.create({ name:'Sushi', address:'z', phone:'2' });
    const r = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ menuId, total:10, restaurantId:otro.id });
    expect(r.statusCode).toBe(400);
  });
});

describe('[Mongo] GET /orders/:id', () => {
  it('200 obtiene propia orden', async () => {
    const r = await request(app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(r.statusCode).toBe(200);
    // ← aquí cambio a _id
    expect(r.body._id).toBe(orderId);
  });

  it('404 inexistente', async () => {
    const r = await request(app)
      .get('/orders/660000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(r.statusCode).toBe(404);
  });

  it('403 otra persona no puede ver', async () => {
    const other = await userDAO.create({
      email:    'other@x.com',
      password: await bcrypt.hash('123', 10),
      role:     'Cliente',
    });
    const otherTk = jwt.sign({ id: other.id, role:'Cliente' }, process.env.JWT_SECRET);

    const r = await request(app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${otherTk}`);
    expect(r.statusCode).toBe(403);
  });
});
