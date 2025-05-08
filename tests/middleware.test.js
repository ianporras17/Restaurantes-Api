import request from 'supertest';
import app from '../src/app.js';

describe('Middleware authJWT', () => {
  it('falta token → 401', async () => {
    const res = await request(app).get('/users/me');
    expect(res.statusCode).toBe(401);
  });

  it('token inválido → 401', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer faketoken');
    expect(res.statusCode).toBe(401);
  });
});
