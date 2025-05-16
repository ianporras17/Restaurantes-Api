import mongoose       from 'mongoose';
import request        from 'supertest';
import jwt            from 'jsonwebtoken';
import bcrypt         from 'bcrypt';

import app            from '../../src/app.js';
import { userDAO }    from '../../src/modules/users/dao/index.js';
import { orderDAO }   from '../../src/modules/orders/dao/index.js';
import { UserMongo }  from '../../src/modules/users/users.mongo.model.js';

describe('[Mongo] Orders controller — ramas catch', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.db.dropDatabase();
    await UserMongo.init();

    const user = await userDAO.create({
      email: 'order@mongo.com',
      password: await bcrypt.hash('123', 10),
      role: 'Cliente',
    });

    token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
  });

  afterEach(() => jest.restoreAllMocks());

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  it('POST /orders → 500 si orderDAO.create lanza', async () => {
    jest.spyOn(orderDAO, 'getMenuById').mockResolvedValue({ id: 'menu123', restaurantId: 'rest456' });
    jest.spyOn(orderDAO, 'getRestaurantById').mockResolvedValue({ id: 'rest456' });

    jest.spyOn(orderDAO, 'create').mockImplementation(() => {
      throw new Error('boom');
    });

    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ menuId: 'menu123', total: 50, restaurantId: 'rest456' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar con la base de datos');
  });

  it('GET /orders/:id → 500 si orderDAO.findById lanza', async () => {
    jest.spyOn(orderDAO, 'findById').mockImplementation(() => {
      throw new Error('fail');
    });

    const res = await request(app)
      .get('/orders/660000000000000000000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar con la base de datos');
  });
});
