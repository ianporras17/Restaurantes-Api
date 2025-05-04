import request from 'supertest';
import app from '../src/app.js';
import { sequelize } from '../src/db/index.js';

beforeAll(async () => {
  await sequelize.sync(); // sincroniza los modelos
});

afterAll(async () => {
  await sequelize.close(); // cierra conexión luego de pruebas
});

describe('Registro de usuarios', () => {
  it('Debe registrar un usuario exitosamente', async () => {
    const res = await request(app)
      .post('/auth/register') // ajusta esta ruta según tu archivo auth.routes.js
      .send({
        email: `test${Date.now()}@example.com`,
        password: '123456',
        role: 'Cliente'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBeDefined(); // o cualquier propiedad que devuelvas
  });

  it('Debe fallar si falta el email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({
        password: '123456',
        role: 'Cliente'
      });

    expect(res.statusCode).toBe(400); // o el código que devuelvas en errores
  });
});
