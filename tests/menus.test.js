import request   from 'supertest';
import app       from '../src/app.js';
import { sequelize } from '../src/db/index.js';
import { User }  from '../src/modules/users/users.model.js';
import { Restaurant } from '../src/modules/restaurants/restaurants.model.js';
import { Menu }  from '../src/modules/menus/menus.model.js';
import bcrypt    from 'bcrypt';
import jwt       from 'jsonwebtoken';

let adminToken, clientToken, restaurantId, menuId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  /* ─── Crea admin y cliente ─────────────────────────────────────────────────── */
  const admin = await User.create({
    email: 'admin@menus.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'Admin',
  });
  adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET);

  const client = await User.create({
    email: 'client@menus.com',
    password: await bcrypt.hash('client123', 10),
    role: 'Cliente',
  });
  clientToken = jwt.sign({ id: client.id, role: client.role }, process.env.JWT_SECRET);

  /* ─── Crea un restaurante base ─────────────────────────────────────────────── */
  const rest = await Restaurant.create({
    name: 'Pilones',
    address: 'En naranjo Alajuela',
    phone: '+506 72321851',
  });
  restaurantId = rest.id;
});

afterAll(async () => {
  await sequelize.close();
});

/* ------------------------------------------------------------------ */
/* POST /menus                                                        */
/* ------------------------------------------------------------------ */
describe('POST /menus', () => {
  it('401 sin token', async () => {
    const res = await request(app).post('/menus').send({});
    expect(res.statusCode).toBe(401);
  });

  it('403 si no es admin', async () => {
    const res = await request(app)
      .post('/menus')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ title: 'Almuerzo', restaurantId });
    expect(res.statusCode).toBe(403);
  });

  it('404 restaurante inexistente', async () => {
    const res = await request(app)
      .post('/menus')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Fantasma', restaurantId: 999 });
    expect(res.statusCode).toBe(404);
  });

  it('201 crea menú', async () => {
    const res = await request(app)
      .post('/menus')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Almuerzo', isActive: true, restaurantId });

    expect(res.statusCode).toBe(201);
    expect(res.body.menuN.title).toBe('Almuerzo');
    menuId = res.body.menuN.id;        // para usar en GET/PUT/DELETE
  });
});

/* ------------------------------------------------------------------ */
/* GET /menus/:id                                                     */
/* ------------------------------------------------------------------ */
describe('GET /menus/:id', () => {
  it('403 cliente no autorizado', async () => {
    const res = await request(app)
      .get(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('404 menú inexistente', async () => {
    const res = await request(app)
      .get('/menus/9999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('200 devuelve menú con restaurante', async () => {
    const res = await request(app)
      .get(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.Restaurant.name).toBe('Pilones');
  });
});

/* ------------------------------------------------------------------ */
/* PUT /menus/:id                                                     */
/* ------------------------------------------------------------------ */
describe('PUT /menus/:id', () => {
  it('403 cliente no autorizado', async () => {
    const res = await request(app)
      .put(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ title: 'Cena' });
    expect(res.statusCode).toBe(403);
  });

  it('200 actualiza título e isActive', async () => {
    const res = await request(app)
      .put(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Cena', isActive: false });
    expect(res.statusCode).toBe(200);
    expect(res.body.menu.title).toBe('Cena');
    expect(res.body.menu.isActive).toBe(false);
  });

  it('200 actualiza solo title (isActive no enviado)', async () => {
    const res = await request(app)
      .put(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Solo título' });   // ← isActive ausente
  
    expect(res.statusCode).toBe(200);
    expect(res.body.menu.title).toBe('Solo título');
    expect(res.body.menu.isActive).toBe(false); // conserva valor previo
  });

  it('200 actualiza solo isActive (title no enviado)', async () => {
    const res = await request(app)
      .put(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true });          // ← title ausente
  
    expect(res.statusCode).toBe(200);
    expect(res.body.menu.isActive).toBe(true);
    expect(res.body.menu.title).toBe('Solo título');  // conserva el valor previo
  });
  
});

/* ------------------------------------------------------------------ */
/* DELETE /menus/:id                                                  */
/* ------------------------------------------------------------------ */
describe('DELETE /menus/:id', () => {
  it('403 cliente no autorizado', async () => {
    const res = await request(app)
      .delete(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('200 elimina menú', async () => {
    const res = await request(app)
      .delete(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);

    const inDb = await Menu.findByPk(menuId);
    expect(inDb).toBeNull();
  });

  it('404 menú ya eliminado', async () => {
    const res = await request(app)
      .delete(`/menus/${menuId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });


});
