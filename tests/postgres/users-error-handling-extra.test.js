// tests/postgres/users-error-handling-extra.test.js
import request from 'supertest';
import app     from '../../src/app.js';
import jwt     from 'jsonwebtoken';
import { userDAO } from '../../src/modules/users/dao/index.js';

describe('[PG] Users — ramas no cubiertas', () => {
  let clientToken;

  beforeAll(() => {
    // JWT cliente para /me
    clientToken = jwt.sign(
      { id: 1, email: 'u@u.com', role: 'Cliente' },
      process.env.JWT_SECRET
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('GET /users/me → 500 si userDAO.findById lanza (línea 17)', async () => {
    jest.spyOn(userDAO, 'findById').mockImplementation(() => {
      throw new Error('fail me');
    });

    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error en el servidor');
  });

  it('PUT /users/:id → 500 si userDAO.update lanza (línea 52-53)', async () => {
    // token admin para poder entrar en esta ruta
    const adminToken = jwt.sign(
      { id: 1, email: 'a@a.com', role: 'Admin' },
      process.env.JWT_SECRET
    );

    jest.spyOn(userDAO, 'findById').mockResolvedValue({ id: 1, email: 'a', role: 'Cliente' });
    jest.spyOn(userDAO, 'update').mockImplementation(() => {
      throw new Error('fail update');
    });

    const res = await request(app)
      .put('/users/1')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'x@y.com' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error en el servidor');
  });

  it('DELETE /users/:id → 500 si userDAO.delete lanza (línea 64)', async () => {
    const adminToken = jwt.sign(
      { id: 1, email: 'a@a.com', role: 'Admin' },
      process.env.JWT_SECRET
    );

    jest.spyOn(userDAO, 'delete').mockImplementation(() => {
      throw new Error('fail del');
    });

    const res = await request(app)
      .delete('/users/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error en el servidor');
  });
});
