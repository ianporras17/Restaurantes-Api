// tests/orders.test.js
import request   from 'supertest';
import app       from '../src/app.js';
import { sequelize } from '../src/db/index.js';
import { User }  from '../src/modules/users/users.model.js';
import { Restaurant } from '../src/modules/restaurants/restaurants.model.js';
import { Menu }  from '../src/modules/menus/menus.model.js';
import { Order } from '../src/modules/orders/orders.model.js';
import bcrypt    from 'bcrypt';
import jwt       from 'jsonwebtoken';

let adminToken, client1Token, client2Token;
let restaurantId, otherRestaurantId, menuId, orderId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  /* ---------------- Usuarios ---------------- */
  const admin = await User.create({
    email: 'admin@orders.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'Admin',
  });
  adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET);

  const client1 = await User.create({
    email: 'client1@orders.com',
    password: await bcrypt.hash('client123', 10),
    role: 'Cliente',
  });
  client1Token = jwt.sign({ id: client1.id, role: client1.role }, process.env.JWT_SECRET);

  const client2 = await User.create({
    email: 'client2@orders.com',
    password: await bcrypt.hash('client123', 10),
    role: 'Cliente',
  });
  client2Token = jwt.sign({ id: client2.id, role: client2.role }, process.env.JWT_SECRET);

  /* ---------------- Restaurantes y menú ---------------- */
  const rest = await Restaurant.create({
    name: 'Pilones',
    address: 'CR',
    phone: '000',
  });
  restaurantId = rest.id;

  const otherRest = await Restaurant.create({
    name: 'Otro',
    address: 'CR',
    phone: '111',
  });
  otherRestaurantId = otherRest.id;

  const menu = await Menu.create({
    title: 'Almuerzo',
    isActive: true,
    restaurantId,
  });
  menuId = menu.id;
});

afterAll(async () => {
  await sequelize.close();
});

/* ------------------------------------------------------------------ */
/* POST /orders                                                       */
/* ------------------------------------------------------------------ */
describe('POST /orders', () => {
  it('400 falta campo obligatorio', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${client1Token}`)
      .send({ total: 20, restaurantId }); // sin menuId
    expect(res.statusCode).toBe(400);
  });

  it('404 restaurante inexistente', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${client1Token}`)
      .send({ total: 20, restaurantId: 999, menuId });
    expect(res.statusCode).toBe(404);
  });

  it('404 menú inexistente', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${client1Token}`)
      .send({ total: 20, restaurantId, menuId: 999 });
    expect(res.statusCode).toBe(404);
  });

  it('400 menú no pertenece al restaurante', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${client1Token}`)
      .send({ total: 20, restaurantId: otherRestaurantId, menuId });
    expect(res.statusCode).toBe(400);
  });

  it('201 crea pedido', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${client1Token}`)
      .send({ total: 25.5, restaurantId, menuId });
    expect(res.statusCode).toBe(201);
    orderId = res.body.order.id;
  });
});

/* ------------------------------------------------------------------ */
/* GET /orders/:id                                                    */
/* ------------------------------------------------------------------ */
describe('GET /orders/:id', () => {
  it('403 otro cliente no puede ver', async () => {
    const res = await request(app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${client2Token}`);
    expect(res.statusCode).toBe(403);
  });

  it('404 pedido inexistente', async () => {
    const res = await request(app)
      .get('/orders/9999')
      .set('Authorization', `Bearer ${client1Token}`);
    expect(res.statusCode).toBe(404);
  });

  it('200 dueño ve su pedido', async () => {
    const res = await request(app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${client1Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.Menu.id).toBe(menuId);
  });

  it('200 admin también puede ver', async () => {
    const res = await request(app)
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });
});

/* ------------------------------------------------------------------ */
/* POST /orders — 500 error interno                                   */
/* ------------------------------------------------------------------ */
describe('POST /orders — error interno', () => {
  let spy;
  beforeAll(() => {
    spy = jest.spyOn(Menu, 'findByPk').mockImplementation(() => {
      throw new Error('DB crash');
    });
  });
  afterAll(() => spy.mockRestore());

  it('500 cuando Menu.findByPk lanza', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${client1Token}`)
      .send({ total: 30, restaurantId, menuId });
    expect(res.statusCode).toBe(500);
  });
});


/* ------------------------------------------------------------------ */
/* GET /orders/:id — 500 error interno                                */
/* ------------------------------------------------------------------ */
describe('GET /orders/:id — error interno', () => {
    let spy;
    beforeAll(() => {
      spy = jest.spyOn(Order, 'findByPk').mockImplementation(() => {
        throw new Error('DB crash');
      });
    });
    afterAll(() => spy.mockRestore());
  
    it('500 cuando Order.findByPk lanza', async () => {
      const res = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${client1Token}`);
  
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('No se pudo conectar a la BD');
    });
  });
  