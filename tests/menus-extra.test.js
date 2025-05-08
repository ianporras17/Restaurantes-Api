// tests/menus-extra.test.js
import request   from 'supertest';
import app       from '../src/app.js';
import { sequelize } from '../src/db/index.js';
import { User }  from '../src/modules/users/users.model.js';
import { Restaurant } from '../src/modules/restaurants/restaurants.model.js';
import { Menu }  from '../src/modules/menus/menus.model.js';
import bcrypt    from 'bcrypt';
import jwt       from 'jsonwebtoken';

import { buscarMenu } from '../src/modules/menus/menus.controller.js';

let adminToken, restaurantId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // admin
  const admin = await User.create({
    email: 'admin@extra.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'Admin',
  });
  adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET);

  // restaurante
  const rest = await Restaurant.create({
    name: 'BranchTest',
    address: 'CR',
    phone: '000',
  });
  restaurantId = rest.id;
});

afterAll(async () => {
  await sequelize.close();
});

/* ------------------------------------------------------------------ */
/* POST /menus — 400 cuerpo incompleto (línea 9)                       */
/* ------------------------------------------------------------------ */
it('400 si falta title', async () => {
  const res = await request(app)
    .post('/menus')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ restaurantId });            // sin title

  expect(res.statusCode).toBe(400);
  expect(res.body.error).toBe('Faltana datos necesarios');
});

/* ------------------------------------------------------------------ */
/* buscarMenu — 400 sin id (línea 38)                                  */
/* ------------------------------------------------------------------ */
it('400 si no se envía id en params', async () => {
  // llamamos al controlador directamente (test unitario)
  const mockReq = { params: {} };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json:   jest.fn(),
  };

  await buscarMenu(mockReq, mockRes);

  expect(mockRes.status).toHaveBeenCalledWith(400);
  expect(mockRes.json).toHaveBeenCalledWith({ error: 'debe ingresar un id' });
});

/* ------------------------------------------------------------------ */
/* PUT /menus/:id — 404 menú inexistente (línea 68)                    */
/* ------------------------------------------------------------------ */
it('404 al actualizar un menú que no existe', async () => {
  const res = await request(app)
    .put('/menus/9999')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ title: 'Nada' });

  expect(res.statusCode).toBe(404);
});

/* ------------------------------------------------------------------ */
/* PUT /menus/:id — 500 si findByPk lanza (líneas 92-93)               */
/* ------------------------------------------------------------------ */
describe('PUT /menus — error interno', () => {
  let spy;
  beforeAll(() => {
    spy = jest.spyOn(Menu, 'findByPk').mockImplementation(() => {
      throw new Error('DB fail');
    });
  });
  afterAll(() => spy.mockRestore());

  it('500 cuando findByPk lanza', async () => {
    const res = await request(app)
      .put('/menus/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'X' });

    expect(res.statusCode).toBe(500);
  });
});

/* ------------------------------------------------------------------ */
/* DELETE /menus/:id — 500 si findByPk lanza (línea 111)               */
/* ------------------------------------------------------------------ */
describe('DELETE /menus — error interno', () => {
  let spy;
  beforeAll(() => {
    spy = jest.spyOn(Menu, 'findByPk').mockImplementation(() => {
      throw new Error('DB fail');
    });
  });
  afterAll(() => spy.mockRestore());

  it('500 cuando findByPk lanza', async () => {
    const res = await request(app)
      .delete('/menus/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(500);
  });
});
