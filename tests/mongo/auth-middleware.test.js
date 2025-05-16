import request from 'supertest';
import jwt     from 'jsonwebtoken';
import app     from '../../src/app.js';

describe('[PG] Middleware authJWT', () => {
  it('401 si token es inválido', async () => {
    // Generamos un token con otra clave (malintencionado)
    const fakeToken = jwt.sign({ id: 1, role: 'Admin' }, 'clave-falsa');

    const res = await request(app)
      .get('/users/me') // cualquier ruta protegida
      .set('Authorization', `Bearer ${fakeToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Error: Token inválido');
  });
});
