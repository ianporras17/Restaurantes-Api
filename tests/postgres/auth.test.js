  /* tests/mongo/auth.test.js */
  import request from 'supertest';
  import app     from '../../src/app.js';
  import jwt     from 'jsonwebtoken';
  import bcrypt  from 'bcrypt';
  import { userDAO } from '../../src/modules/users/dao/index.js';
  import { sequelize } from '../../src/db/index.js';

  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });
  afterAll(async () => {
    await sequelize.close();
  });


  describe('[Mongo] Auth', () => {

    /* ---------- registro ---------- */
    it('201 registra usuario', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email:'ok@mongo.com', password:'123456', role:'Cliente' });

      expect(res.statusCode).toBe(201);
    });

    it('400 e-mail duplicado', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email:'ok@mongo.com', password:'123456', role:'Cliente' });

      expect(res.statusCode).toBe(400);
    });

    /* ---------- login ---------- */
    it('200 login devuelve token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email:'ok@mongo.com', password:'123456' });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();

      /** guardamos para tests de /users/me */
      global.mongoToken = res.body.token;
      global.mongoUser  = jwt.verify(res.body.token, process.env.JWT_SECRET);
    });

    it('401 contraseña incorrecta', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email:'ok@mongo.com', password:'bad' });

      expect(res.statusCode).toBe(401);
    });

    it('400 faltan campos', async () => {
      const res = await request(app).post('/auth/login').send({ email:'x' });
      expect(res.statusCode).toBe(400);
    });

    /* ---------- 500 rama genérica ---------- */
    it('500 si bcrypt.compare lanza error', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => { throw new Error('bcrypt fail'); });

      const res = await request(app)
        .post('/auth/login')
        .send({ email:'ok@mongo.com', password:'123456' });

      expect(res.statusCode).toBe(500);
      bcrypt.compare.mockRestore();
    });
  });