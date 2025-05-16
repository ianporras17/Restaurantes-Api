/* tests/mongo/users.test.js */
import request   from 'supertest';
import jwt       from 'jsonwebtoken';
import bcrypt    from 'bcrypt';
import app       from '../../src/app.js';
import { userDAO } from '../../src/modules/users/dao/index.js';
import { sequelize } from '../../src/db/index.js';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});
afterAll(async () => {
  await sequelize.close();
});


let adminToken, adminId, clientToken, clientId;

beforeAll(async () => {
  /* ---------- admin ---------- */
  const admin = await userDAO.create({
    email   : 'admin@mongo.com',
    password: await bcrypt.hash('admin123',10),
    role    : 'Admin'
  });
  adminId    = admin.id;
  adminToken = jwt.sign({ id:admin.id, role:admin.role }, process.env.JWT_SECRET);

  /* ---------- cliente ---------- */
  const cli = await userDAO.create({
    email   : 'cli@mongo.com',
    password: await bcrypt.hash('cli123',10),
    role    : 'Cliente'
  });
  clientId    = cli.id;
  clientToken = jwt.sign({ id:cli.id, role:cli.role }, process.env.JWT_SECRET);
});

/* ------- /users/me ------- */
describe('[Mongo] GET /users/me', () => {
  it('200 ok', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('cli@mongo.com');
  });

  it('401 sin token', async () => {
    const r = await request(app).get('/users/me');
    expect(r.statusCode).toBe(401);
  });

  it('404 id inexistente', async () => {
    const ghost = jwt.sign({ id:'660000000000000000000000', role:'Cliente' }, process.env.JWT_SECRET);
    const r = await request(app).get('/users/me').set('Authorization',`Bearer ${ghost}`);
    expect(r.statusCode).toBe(404);
  });
});

/* ------- PUT /users/:id ------- */
describe('[Mongo] PUT /users/:id', () => {
  it('200 cliente cambia email', async () => {
    const r = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ email:'nuevo@mongo.com' });

    expect(r.statusCode).toBe(200);
    expect(r.body.usuario.email).toBe('nuevo@mongo.com');
  });

  it('400 email duplicado', async () => {
    const r = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ email:'admin@mongo.com' });

    expect(r.statusCode).toBe(400);
  });

  it('403 cliente no puede cambiar role', async () => {
    const r = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ role:'Admin' });

    expect(r.statusCode).toBe(403);
  });

  it('200 admin cambia role del user', async () => {
    const r = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role:'Admin' });

    expect(r.statusCode).toBe(200);
    expect(r.body.usuario.role).toBe('Admin');
  });

  it('404 user inexistente', async () => {
    const r = await request(app)
      .put(`/users/660000000000000000000000`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email:'x@y.com' });

    expect(r.statusCode).toBe(404);
  });
  it('PUT /users/:id — hash de password si se envía campo password', async () => {
    const spy = jest.spyOn(bcrypt, 'hash');
    const res = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ password: 'miNUEVApass' });

    expect(res.statusCode).toBe(200);
    expect(spy).toHaveBeenCalledWith('miNUEVApass', 10);
    spy.mockRestore();
  });
});

/* ------- DELETE /users/:id ------- */
describe('[Mongo] DELETE /users/:id', () => {
  it('403 cliente no puede borrar', async () => {
    const r = await request(app)
      .delete(`/users/${adminId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(r.statusCode).toBe(403);
  });

  it('200 admin borra user', async () => {
    const r = await request(app)
      .delete(`/users/${clientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(r.statusCode).toBe(200);
  });

  it('404 ya no existe', async () => {
    const r = await request(app)
      .delete(`/users/${clientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(r.statusCode).toBe(404);
  });
});
