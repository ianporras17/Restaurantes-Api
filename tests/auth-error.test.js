// tests/users-error.test.js
import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/modules/users/users.model.js';
import jwt from 'jsonwebtoken';
import { sequelize } from '../src/db/index.js';
import bcrypt from 'bcrypt';

let clientToken, clientId, adminToken;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Crear usuario cliente
  const clientPass = await bcrypt.hash('cli123', 10);
  const client = await User.create({
    email: 'cli@err.com',
    password: clientPass,
    role: 'Cliente',
  });
  clientId = client.id;
  clientToken = jwt.sign(
    { id: client.id, email: client.email, role: client.role },
    process.env.JWT_SECRET
  );

  // Crear usuario admin para pruebas de delete
  const adminPass = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    email: 'admin@err.com',
    password: adminPass,
    role: 'Admin',
  });
  adminToken = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET
  );
});

afterAll(async () => {
  await sequelize.close();
});

describe('Ramas 500 en Users', () => {
  it('meUser catch → 500', async () => {
    jest.spyOn(User, 'findByPk').mockImplementation(() => {
      throw new Error('DB fail');
    });
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.statusCode).toBe(500);
    User.findByPk.mockRestore();
  });

  it('idUserModify catch → 500', async () => {
    jest.spyOn(User, 'findByPk').mockImplementation(() => {
      throw new Error('DB fail');
    });
    const res = await request(app)
      .put(`/users/${clientId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ email: 'x@err.com' });
    expect(res.statusCode).toBe(500);
    User.findByPk.mockRestore();
  });

  it('deleteUser catch → 500', async () => {
    jest.spyOn(User, 'findByPk').mockImplementation(() => {
      throw new Error('DB fail');
    });
    const res = await request(app)
      .delete(`/users/${clientId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(500);
    User.findByPk.mockRestore();
  });
});
