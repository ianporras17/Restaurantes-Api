import request   from 'supertest';
import jwt       from 'jsonwebtoken';
import bcrypt    from 'bcrypt';

import app                 from '../../src/app.js';
import { sequelize }       from '../../src/db/index.js';
import { userDAO }         from '../../src/modules/users/dao/index.js';
import { restaurantDAO }   from '../../src/modules/restaurants/dao/index.js';
import { menuDAO }         from '../../src/modules/menus/dao/index.js';

describe('[PG] Menus controller', () => {
  let token, menuId, restId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const admin = await userDAO.create({
      email: 'admin@pg.com',
      password: await bcrypt.hash('123', 10),
      role: 'Admin',
    });

    token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET);

    const rest = await restaurantDAO.create({ name: 'Rest PG', address: 'X', phone: '1' });
    restId = rest.id;
  });

  afterAll(async () => await sequelize.close());

  describe('POST /menus', () => {
    it('201 crea menú', async () => {
      const res = await request(app)
        .post('/menus')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'PG Menu', isActive: true, restaurantId: restId });

      expect(res.statusCode).toBe(201);
      expect(res.body.menu.title).toBe('PG Menu');
      menuId = res.body.menu.id;
    });

    it('400 faltan datos', async () => {
      const res = await request(app)
        .post('/menus')
        .set('Authorization', `Bearer ${token}`)
        .send({ isActive: true });
      expect(res.statusCode).toBe(400);
    });

    it('404 restaurante no existe', async () => {
      const res = await request(app)
        .post('/menus')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Invalido', isActive: true, restaurantId: 999 });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('GET /menus/:id', () => {
    it('200 obtiene menú', async () => {
      const res = await request(app)
        .get(`/menus/${menuId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('PG Menu');
    });

    it('404 no existe', async () => {
      const res = await request(app)
        .get('/menus/999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /menus/:id', () => {
    it('200 actualiza menú', async () => {
      const res = await request(app)
        .put(`/menus/${menuId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Menu Actualizado' });
      expect(res.statusCode).toBe(200);
      expect(res.body.menu.title).toBe('Menu Actualizado');
    });

    it('404 no existe', async () => {
      const res = await request(app)
        .put('/menus/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Nada' });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /menus/:id', () => {
    it('200 elimina menú', async () => {
      const res = await request(app)
        .delete(`/menus/${menuId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    it('404 no existe', async () => {
      const res = await request(app)
        .delete(`/menus/${menuId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });
  });
});
