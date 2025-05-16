import mongoose  from 'mongoose';
import request   from 'supertest';
import jwt       from 'jsonwebtoken';
import bcrypt    from 'bcrypt';

import app                 from '../../src/app.js';
import { userDAO }         from '../../src/modules/users/dao/index.js';
import { menuDAO }         from '../../src/modules/menus/dao/index.js';
import { restaurantDAO }   from '../../src/modules/restaurants/dao/index.js';
import { UserMongo }       from '../../src/modules/users/users.mongo.model.js';

describe('[Mongo] Menus controller — errores 500', () => {
  let token, restId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.db.dropDatabase();
    await UserMongo.init();

    const admin = await userDAO.create({
      email: 'mongo@err.com',
      password: await bcrypt.hash('123', 10),
      role: 'Admin',
    });

    token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET);

    const rest = await restaurantDAO.create({ name: 'R', address: 'a', phone: '1' });
    restId = rest.id;
  });

  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  it('POST /menus → 500 si menuDAO.create lanza', async () => {
    jest.spyOn(menuDAO, 'getRestaurantById').mockResolvedValue({ id: restId });
    jest.spyOn(menuDAO, 'create').mockImplementation(() => {
      throw new Error('boom');
    });

    const res = await request(app)
      .post('/menus')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'X', isActive: true, restaurantId: restId });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error en servidor');
  });

  it('GET /menus/:id → 500 si menuDAO.findById lanza', async () => {
    jest.spyOn(menuDAO, 'findById').mockImplementation(() => {
      throw new Error('fail');
    });

    const res = await request(app)
      .get('/menus/660000000000000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error en servidor');
  });

  it('PUT /menus/:id → 500 si menuDAO.update lanza', async () => {
    jest.spyOn(menuDAO, 'update').mockImplementation(() => {
      throw new Error('fail');
    });

    const res = await request(app)
      .put('/menus/660000000000000000000000')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'nada' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error en servidor');
  });

  it('DELETE /menus/:id → 500 si menuDAO.delete lanza', async () => {
    jest.spyOn(menuDAO, 'delete').mockImplementation(() => {
      throw new Error('fail');
    });

    const res = await request(app)
      .delete('/menus/660000000000000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error en servidor');
  });
});
