// tests/users.test.js
import request from 'supertest';
import app from '../src/app.js';
import { sequelize } from '../src/db/index.js';
import { User } from '../src/modules/users/users.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let adminToken, clientToken, adminId, clientId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  /* ---------- Admin ---------- */
  const admin = await User.create({
    email: 'admin@example.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'Admin',
  });
  adminId = admin.id;
  adminToken = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET
  );

  /* ---------- Cliente ---------- */
  const client = await User.create({
    email: 'client@example.com',
    password: await bcrypt.hash('client123', 10),
    role: 'Cliente',
  });
  clientId = client.id;
  clientToken = jwt.sign(
    { id: client.id, email: client.email, role: client.role },
    process.env.JWT_SECRET
  );
});

afterAll(async () => {
  await sequelize.close();
});

/* ------------------------------------------------------------------ */
/* /users/me                                                          */
/* ------------------------------------------------------------------ */
describe('/users/me', () => {
  it('200 devuelve datos', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('client@example.com');
  });

  it('401 sin token', async () => {
    const res = await request(app).get('/users/me');
    expect(res.statusCode).toBe(401);
  });

  it('404 id inexistente', async () => {
    const ghost = jwt.sign(
      { id: 9999, email: 'ghost@x.com', role: 'Cliente' },
      process.env.JWT_SECRET
    );
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${ghost}`);
    expect(res.statusCode).toBe(404);
  });
});

/* ------------------------------------------------------------------ */
/* PUT /users/:id                                                     */
/* ------------------------------------------------------------------ */
describe('PUT /users/:id', () => {
  it('200 actualiza email', async () => {
    const res = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ email: 'nuevo@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.usuario.email).toBe('nuevo@example.com');
  });

  it('400 email duplicado', async () => {
    const res = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ email: 'admin@example.com' });
    expect(res.statusCode).toBe(400);
  });

  it('403 cliente no puede cambiar role', async () => {
    const res = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ role: 'Admin' });
    expect(res.statusCode).toBe(403);
  });

  it('200 admin cambia role del usuario', async () => {
    const res = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'Admin' });
    expect(res.statusCode).toBe(200);
    expect(res.body.usuario.role).toBe('Admin');
  });

  it('200 usuario actualiza password (hash rama)', async () => {
    const res = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ password: 'nueva123' });
    expect(res.statusCode).toBe(200);
  });

  it('404 id inexistente', async () => {
    const res = await request(app)
      .put('/users/9999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'x@x.com' });
    expect(res.statusCode).toBe(404);
  });
});

/* ------------------------------------------------------------------ */
/* DELETE /users/:id                                                  */
/* ------------------------------------------------------------------ */
describe('DELETE /users/:id', () => {
  it('200 admin elimina usuario', async () => {
    const res = await request(app)
      .delete(`/users/${clientId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('403 cliente no puede eliminar', async () => {
    const res = await request(app)
      .delete(`/users/${adminId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.statusCode).toBe(403);
  });
  it('404 al intentar eliminar un usuario que no existe', async () => {
    const res = await request(app)
      .delete('/users/9999')                 // id que no existe
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Usuario no existe');
  });
});

