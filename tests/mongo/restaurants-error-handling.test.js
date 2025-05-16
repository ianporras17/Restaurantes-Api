import mongoose         from 'mongoose';
import request          from 'supertest';
import jwt              from 'jsonwebtoken';
import bcrypt           from 'bcrypt';

import app               from '../../src/app.js';
import { userDAO }       from '../../src/modules/users/dao/index.js';
import { restaurantDAO } from '../../src/modules/restaurants/dao/index.js';
import { UserMongo }     from '../../src/modules/users/users.mongo.model.js';

describe('[Mongo] Restaurants controller — ramas catch', () => {
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.db.dropDatabase();
    await UserMongo.init();

    const u = await userDAO.create({
      email: 'admin@mongo.com',
      password: await bcrypt.hash('123', 10),
      role: 'Admin',
    });
    token = jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET);
  });

  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  it('POST /restaurants → 500 si restaurantDAO.create lanza', async () => {
    jest.spyOn(restaurantDAO, 'create').mockImplementation(() => {
      throw new Error('boom');
    });

    const res = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'X', address: 'Y', phone: '1' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar con la base de datos');
  });

  it('GET /restaurants → 500 si restaurantDAO.findAllRestaurant lanza', async () => {
    jest.spyOn(restaurantDAO, 'findAllRestaurant').mockImplementation(() => {
      throw new Error('fail');
    });

    const res = await request(app)
      .get('/restaurants')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar a la data base');
  });
});
