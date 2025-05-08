import request        from 'supertest';
import app            from '../src/app.js';
import { sequelize }  from '../src/db/index.js';
import { User }       from '../src/modules/users/users.model.js';
import { Restaurant } from '../src/modules/restaurants/restaurants.model.js';
import bcrypt         from 'bcrypt';
import jwt            from 'jsonwebtoken';

let adminToken;
let userToken;

beforeAll(async () => {
  // Base limpia
  await sequelize.sync({ force: true });

  /* ─────── Crea ADMIN y CLIENTE directamente en la BD ────────────────────────── */
  const admin = await User.create({
    email: 'admin@mail.com',
    password: await bcrypt.hash('pass123', 10), // ⇠ hash explícito
    role: 'Admin',
  });

  const client = await User.create({
    email: 'client@mail.com',
    password: await bcrypt.hash('pass123', 10),
    role: 'Cliente',
  });

  /* ─────── Firmamos los JWT manualmente, igual que en users.test.js ──────────── */
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

/* ------------------------------------------------------------------ */
/*            POST /restaurants                                       */
/* ------------------------------------------------------------------ */

describe('POST /restaurants', () => {

  it('rechaza sin token', async () => {
    const res = await request(app)
      .post('/restaurants')
      .send({ name: 'Sin Auth', address: 'X', phone: '111' });

    expect(res.statusCode).toBe(401);   // sin credenciales
  });

  it('rechaza si el usuario NO es admin', async () => {
    const res = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Rest 1', address: 'X', phone: '111' });

    expect(res.statusCode).toBe(403);   // token válido, rol incorrecto
  });

  it('crea restaurante si es admin', async () => {
    const payload = {
      name: 'La Nonna',
      address: 'Av 1',
      phone: '222',
      capacity: 50
    };

    const res = await request(app)
      .post('/restaurants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.restaurant.name).toBe(payload.name);

    // verifica en la BD
    const inDb = await Restaurant.findOne({ where: { name: payload.name } });
    expect(inDb).not.toBeNull();
  });
});

/* ------------------------------------------------------------------ */
/*            GET /restaurants                                        */
/* ------------------------------------------------------------------ */

describe('GET /restaurants', () => {

  it('rechaza al no admin (middleware actual)', async () => {
    const res = await request(app)
      .get('/restaurants')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403);
  });

  it('devuelve lista si es admin', async () => {
    const res = await request(app)
      .get('/restaurants')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
