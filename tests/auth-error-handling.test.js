// tests/auth-error-handling.test.js
import request from 'supertest';
import app     from '../src/app.js';
import { sequelize } from '../src/db/index.js';
import { User } from '../src/modules/users/users.model.js';
import bcrypt  from 'bcrypt';
import jwt     from 'jsonwebtoken';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth controller — manejo de errores genéricos', () => {
  describe('POST /auth/register — error interno', () => {
    beforeAll(() => {
      // Simulamos un error fuera de UniqueConstraint
      jest.spyOn(User, 'create').mockImplementation(() => {
        const err = new Error('DB fail');
        err.name = 'SomeOtherError';
        throw err;
      });
    });
    afterAll(() => {
      User.create.mockRestore();
    });

    it('500 si User.create lanza un error genérico', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email:    'fail@example.com',
          password: '123456',
          role:     'Cliente',
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Error al registrar el usuario');
    });
  });

  describe('POST /auth/login — error interno', () => {
    beforeAll(async () => {
      // Creamos un usuario válido para el flujo de login
      const hash = await bcrypt.hash('password123', 10);
      await User.create({ email: 'errlogin@example.com', password: hash, role: 'Cliente' });

      // Simulamos que findOne arroja error
      jest.spyOn(User, 'findOne').mockImplementation(() => {
        throw new Error('DB lookup fail');
      });
    });
    afterAll(() => {
      User.findOne.mockRestore();
    });

    it('500 si User.findOne lanza un error genérico', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email:    'errlogin@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Error al conectar el servidor');
    });
  });
});
