import mongoose from 'mongoose';
import request  from 'supertest';
import jwt      from 'jsonwebtoken';
import bcrypt   from 'bcrypt';

import app                  from '../../src/app.js';
import { userDAO }          from '../../src/modules/users/dao/index.js';
import { restaurantDAO }    from '../../src/modules/restaurants/dao/index.js';
import { menuDAO }          from '../../src/modules/menus/dao/index.js';
import { UserMongo }        from '../../src/modules/users/users.mongo.model.js';

let token, menuId, restId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.db.dropDatabase();
  await UserMongo.init();

  const admin = await userDAO.create({
    email: 'admin@menus.com',
    password: await bcrypt.hash('123', 10),
    role: 'Admin',
  });

  token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET);

  const rest = await restaurantDAO.create({ name: 'Resto', address: 'X', phone: '1' });
  restId = rest.id;
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('[Mongo] POST /menus', () => {
  it('201 crea menú', async () => {
    const res = await request(app)
      .post('/menus')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Menu Test', isActive: true, restaurantId: restId });

    expect(res.statusCode).toBe(201);
    expect(res.body.menu.title).toBe('Menu Test');
    menuId = res.body.menu.id;
  });

  it('400 faltan datos', async () => {
    const res = await request(app)
      .post('/menus')
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: true });
    expect(res.statusCode).toBe(400);
  });

  it('404 restaurante no existe', async () => {
    const res = await request(app)
      .post('/menus')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'X', isActive: true, restaurantId: '660000000000000000000000' });
    expect(res.statusCode).toBe(404);
  });
});

describe('[Mongo] GET /menus/:id', () => {
  it('200 obtiene menú', async () => {
    const res = await request(app)
      .get(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Menu Test');
  });

  it('404 no existe', async () => {
    const res = await request(app)
      .get('/menus/660000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});

describe('[Mongo] PUT /menus/:id', () => {
  it('200 actualiza menú', async () => {
    const res = await request(app)
      .put(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Actualizado' });
    expect(res.statusCode).toBe(200);
    expect(res.body.menu.title).toBe('Actualizado');
  });

  it('404 no existe', async () => {
    const res = await request(app)
      .put('/menus/660000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Nope' });
    expect(res.statusCode).toBe(404);
  });
});

describe('[Mongo] DELETE /menus/:id', () => {
  it('200 elimina menú', async () => {
    const res = await request(app)
      .delete(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('404 no existe', async () => {
    const res = await request(app)
      .delete(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});
