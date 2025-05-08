import request from 'supertest';
import app from '../src/app.js';
import { sequelize } from '../src/db/index.js';
import { User } from '../src/modules/users/users.model.js';
import { Restaurant } from '../src/modules/restaurants/restaurants.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let adminToken, userToken;

beforeAll(async () => {
  // Sincronizar BD en modo test
  await sequelize.sync({ force: true });

  // Crear admin y cliente
  const admin = await User.create({
    email: 'admin@test.com',
    password: await bcrypt.hash('test123', 10),
    role: 'Admin',
  });

  const client = await User.create({
    email: 'client@test.com',
    password: await bcrypt.hash('test123', 10),
    role: 'Cliente',
  });

  // Firmar tokens manualmente
  adminToken = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET
  );

  userToken = jwt.sign(
    { id: client.id, email: client.email, role: client.role },
    process.env.JWT_SECRET
  );
});

afterAll(async () => {
  await sequelize.close();
});

/**
 * Validaciones y manejo de errores en POST /restaurants
 */
describe('POST /restaurants — Validaciones y errores', () => {
  it('400 si faltan campos obligatorios (name, address, phone)', async () => {
    const res = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ address: 'Calle Falsa 123', phone: '555-1234' });

    expect(res.statusCode).toBe(400);
    expect(res.body.Error).toBe('Debe ingresar nombre, dirección y teléfono');
  });

  describe('Error interno al crear restaurante', () => {
    beforeAll(() => {
      jest.spyOn(Restaurant, 'create').mockImplementation(() => {
        throw new Error('DB failure');
      });
    });
    afterAll(() => {
      Restaurant.create.mockRestore();
    });

    it('500 si Restaurant.create lanza un error', async () => {
      const res = await request(app)
        .post('/restaurants')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test', address: 'Calle X', phone: '000', capacity: 10 });

      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Error al conectar con la base de datos');
    });
  });
});

/**
 * Manejo de error interno en GET /restaurants
 */
describe('GET /restaurants — Error interno', () => {
  beforeAll(() => {
    jest.spyOn(Restaurant, 'findAll').mockImplementation(() => {
      throw new Error('DB failure');
    });
  });
  afterAll(() => {
    Restaurant.findAll.mockRestore();
  });

  it('500 si Restaurant.findAll lanza un error', async () => {
    const res = await request(app)
      .get('/restaurants')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar a la data base');
  });
});