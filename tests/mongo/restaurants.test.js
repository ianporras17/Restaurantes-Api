// tests/mongo/restaurants.test.js
jest.setTimeout(60_000);

import mongoose           from 'mongoose';
import request            from 'supertest';
import jwt                from 'jsonwebtoken';
import bcrypt             from 'bcrypt';

import app               from '../../src/app.js';
import { userDAO }       from '../../src/modules/users/dao/index.js';
import { restaurantDAO } from '../../src/modules/restaurants/dao/index.js';
import { UserMongo }     from '../../src/modules/users/users.mongo.model.js';

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await mongoose.connection.db.dropDatabase();
  await UserMongo.init();

  const u = await userDAO.create({
    email:    'test@mongo.com',
    password: await bcrypt.hash('123', 10),
    role:     'Admin',
  });
  token = jwt.sign({ id:u.id, role:u.role }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('[Mongo] POST /restaurants', () => {
  it('201 crea restaurant', async () => {
    const r = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name:'Burger', address:'x', phone:'1' });
    expect(r.statusCode).toBe(201);
  });

  it('400 faltan campos', async () => {
    const r = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name:'NoPhone' });
    expect(r.statusCode).toBe(400);
  });
});

describe('[Mongo] GET /restaurants', () => {
  it('200 lista todos', async () => {
    const r = await request(app)
      .get('/restaurants')
      .set('Authorization', `Bearer ${token}`);
    expect(r.statusCode).toBe(200);
    expect(Array.isArray(r.body)).toBe(true);
  });
});
