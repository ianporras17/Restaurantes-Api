// tests/mongo/auth.test.js
jest.setTimeout(60_000);

import mongoose from 'mongoose';
import request  from 'supertest';
import jwt      from 'jsonwebtoken';
import bcrypt   from 'bcrypt';

import app      from '../../src/app.js';
import { UserMongo } from '../../src/modules/users/users.mongo.model.js';   // 👈
import { userDAO  } from '../../src/modules/users/dao/index.js';           // (-si lo usas en otros tests)

/* ------------------------------------------------------------------ */
/* SET-UP                                                              */
/* ------------------------------------------------------------------ */
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser : true,
    useUnifiedTopology: true,
  });
  await mongoose.connection.db.dropDatabase();

  // 🟢 garantiza que el índice { email:1, unique:true } exista
  await UserMongo.init();
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

/* ------------------------------------------------------------------ */
/* TESTS                                                               */
/* ------------------------------------------------------------------ */
describe('[Mongo] Auth', () => {

  it('201 registra usuario', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email:'ok@mongo.com', password:'123456', role:'Cliente' });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Usuario creado correctamente');
  });

  it('400 e-mail duplicado', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email:'ok@mongo.com', password:'123456', role:'Cliente' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Correo ya registrado');
  });

  it('200 login devuelve token', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email:'ok@mongo.com', password:'123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();

    global.mongoToken = res.body.token;               // para otros tests
    global.mongoUser  = jwt.verify(res.body.token, process.env.JWT_SECRET);
  });

  it('401 contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email:'ok@mongo.com', password:'bad' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Datos incorrectos');
  });

  it('400 faltan campos', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email:'x' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Debe ingresar correo y contraseña');
  });

  it('500 si bcrypt.compare lanza error', async () => {
    jest.spyOn(bcrypt,'compare').mockImplementation(() => { throw new Error('bcrypt fail'); });

    const res = await request(app)
      .post('/auth/login')
      .send({ email:'ok@mongo.com', password:'123456' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar con el servidor');

    bcrypt.compare.mockRestore();
  });
});
