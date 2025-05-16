// tests/postgres/auth-error-handling-extra.test.js
import request from 'supertest';
import app     from '../../src/app.js';
import jwt     from 'jsonwebtoken';
import bcrypt  from 'bcrypt';
import { userDAO } from '../../src/modules/users/dao/index.js';

jest.setTimeout(30_000); 

describe('[PG] Auth — ramas no cubiertas', () => {
  let adminToken;

  beforeAll(() => {
    // Creamos un JWT admin ficticio para saltarnos auth en /login
    adminToken = jwt.sign(
      { id: 1, email: 'a@b.com', role: 'Admin' },
      process.env.JWT_SECRET
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('POST /auth/register → 500 si userDAO.create lanza error genérico', async () => {
    jest.spyOn(userDAO, 'create').mockImplementation(() => {
      const e = new Error('boom');
      e.name = 'OtherError';
      throw e;
    });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'x@x.com', password: '123456', role: 'Cliente' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al registrar el usuario');
  });

  it('POST /auth/login → 500 si userDAO.findByEmail lanza', async () => {
    jest.spyOn(userDAO, 'findByEmail').mockImplementation(() => {
      throw new Error('lookup fail');
    });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'whatever', password: 'doesntmatter' });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar con el servidor');
  });

  it('POST /auth/login → 401 si usuario no existe (rama línea 38)', async () => {
    jest.spyOn(userDAO, 'findByEmail').mockResolvedValue(null);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'missing@user.com', password: 'nopass' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Datos incorrectos');
  });
});
