// tests/postgres/extra-errors.test.js
import request   from 'supertest';
import jwt       from 'jsonwebtoken';
import app       from '../../src/app.js';
import { userDAO } from '../../src/modules/users/dao/index.js';

describe('[PG] Ramas 400/500 de Users', () => {
  const TOKEN = jwt.sign(
    { id: 1, email: 'x@x.com', role: 'Admin' },
    process.env.JWT_SECRET
  );

  it('POST /auth/register – 400 faltan campos', async () => {
    const r = await request(app)
      .post('/auth/register')
      .send({ email: 'x@y.com' });
    expect(r.statusCode).toBe(400);
  });

  it('POST /auth/login – 400 sin pwd', async () => {
    const r = await request(app)
      .post('/auth/login')
      .send({ email: 'nada@y.com' });
    expect(r.statusCode).toBe(400);
  });

  it('PUT /users/:id – 500 cuando DAO.findById lanza', async () => {
    // 1) espía findById para que lance error
    const spy = jest
      .spyOn(userDAO, 'findById')
      .mockImplementation(() => { throw new Error('DB fail'); });

    // 2) hace la petición CON token válido
    const r = await request(app)
      .put('/users/1')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({ email: 'cualquiera@x.com' });

    expect(r.statusCode).toBe(500);

    spy.mockRestore();
  });
});
