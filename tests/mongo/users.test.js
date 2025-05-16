// tests/mongo/users.test.js

jest.setTimeout(60_000);

import mongoose from 'mongoose';
import request  from 'supertest';
import jwt      from 'jsonwebtoken';
import bcrypt   from 'bcrypt';
import app      from '../../src/app.js';
import { userDAO } from '../../src/modules/users/dao/index.js';
import { UserMongo } from '../../src/modules/users/users.mongo.model.js';

let adminToken, adminId, clientToken, clientId;

beforeAll(async () => {
  // Conectar a Mongo y limpiar la DB de test
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await mongoose.connection.db.dropDatabase();
  await UserMongo.init();

  // Crear admin
  const admin = await userDAO.create({
    email:    'admin@mongo.com',
    password: await bcrypt.hash('admin123', 10),
    role:     'Admin',
  });
  adminId    = admin.id;
  adminToken = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET
  );

  // Crear cliente
  const cli = await userDAO.create({
    email:    'cli@mongo.com',
    password: await bcrypt.hash('cli123', 10),
    role:     'Cliente',
  });
  clientId    = cli.id;
  clientToken = jwt.sign(
    { id: cli.id, email: cli.email, role: cli.role },
    process.env.JWT_SECRET
  );
});

afterAll(async () => {
  // Limpiar y desconectar
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('[Mongo] GET /users/me', () => {
  it('200 ok', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('cli@mongo.com');
    expect(res.body.id).toBe(clientId);
  });

  it('401 sin token', async () => {
    const res = await request(app).get('/users/me');
    expect(res.statusCode).toBe(401);
    expect(res.body.msg).toBe('Token faltante');
  });

  it('404 id inexistente', async () => {
    const ghost = jwt.sign(
      { id: '660000000000000000000000', role: 'Cliente' },
      process.env.JWT_SECRET
    );
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${ghost}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Usuario no encontrado');
  });
});

describe('[Mongo] PUT /users/:id', () => {
  it('200 cliente cambia email', async () => {
    const res = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ email: 'nuevo@mongo.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.usuario.email).toBe('nuevo@mongo.com');
  });

  it('400 email duplicado', async () => {
    const res = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ email: 'admin@mongo.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('El correo ya está registrado');
  });

  it('403 cliente no puede cambiar role', async () => {
    const res = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ role: 'Admin' });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Sin permisos para cambiar role');
  });

  it('200 admin cambia role del user', async () => {
    const res = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'Admin' });

    expect(res.statusCode).toBe(200);
    expect(res.body.usuario.role).toBe('Admin');
  });

  it('404 user inexistente', async () => {
    const res = await request(app)
      .put('/users/660000000000000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email: 'x@y.com' });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Usuario no encontrado');
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

describe('[Mongo] DELETE /users/:id', () => {
  it('403 cliente no puede borrar', async () => {
    const res = await request(app)
      .delete(`/users/${adminId}`)
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.msg).toBe('Sin permisos');
  });

  it('200 admin borra user', async () => {
    const res = await request(app)
      .delete(`/users/${clientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.msg).toBe('Usuario eliminado correctamente');
  });

  it('404 ya no existe', async () => {
    const res = await request(app)
      .delete(`/users/${clientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Usuario no existe');
  });
});
