// tests/auth.test.js
import request from 'supertest';
import app from '../src/app.js';
import { sequelize } from '../src/db/index.js';
import bcrypt from 'bcrypt';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth flow', () => {
  /* ---------------- REGISTRO ---------------- */
  it('201 cuando registra usuario', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'ok@example.com',
      password: '123456',
      role: 'Cliente',
    });
    expect(res.statusCode).toBe(201);
  });

  it('400 correo duplicado', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'ok@example.com',
      password: '123456',
      role: 'Cliente',
    });
    expect(res.statusCode).toBe(400);
  });

  it('400 registro sin email', async () => {
    const res = await request(app).post('/auth/register').send({
      password: '123456',
      role: 'Cliente',
    });
    expect(res.statusCode).toBe(400);
  });

  it('400 registro sin password', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'nopass@example.com',
      role: 'Cliente',
    });
    expect(res.statusCode).toBe(400);
  });

  it('400 registro sin role', async () => {
    const res = await request(app).post('/auth/register').send({
      email: 'norole@example.com',
      password: '123456',
    });
    expect(res.statusCode).toBe(400);
  });

  /* ---------------- LOGIN ---------------- */
  it('200 login correcto devuelve token', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'ok@example.com',
      password: '123456',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('401 password incorrecta', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'ok@example.com',
      password: 'badpass',
    });
    expect(res.statusCode).toBe(401);
  });

  it('400 login sin password', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'ok@example.com',
    });
    expect(res.statusCode).toBe(400);
  });

  it('400 login sin email', async () => {
    const res = await request(app).post('/auth/login').send({
      password: '123456',
    });
    expect(res.statusCode).toBe(400);
  });

  /* ---------------- Rama 500 (bcrypt falla) ---------------- */
  it('500 si bcrypt.compare lanza error', async () => {
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => {
      throw new Error('bcrypt fail');
    });
    const res = await request(app).post('/auth/login').send({
      email: 'ok@example.com',
      password: '123456',
    });
    expect(res.statusCode).toBe(500);
    bcrypt.compare.mockRestore();
  });
});

it('401 usuario inexistente', async () => {
  const res = await request(app).post('/auth/login').send({
    email: 'ghost@example.com',   // ← nunca se registró
    password: 'whatever',
  });
  expect(res.statusCode).toBe(401);
  expect(res.body.error).toBe('Datos incorrectos');
});