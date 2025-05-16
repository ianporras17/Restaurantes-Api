import request   from 'supertest';
import jwt       from 'jsonwebtoken';
import bcrypt    from 'bcrypt';

import app                from '../../src/app.js';
import { sequelize }      from '../../src/db/index.js';
import { userDAO }        from '../../src/modules/users/dao/index.js';

describe('[PG] Orders controller — recursos no encontrados', () => {
  let token;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const user = await userDAO.create({
      email: 'notfound@pg.com',
      password: await bcrypt.hash('123', 10),
      role: 'Cliente',
    });

    token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
  });

  afterAll(async () => await sequelize.close());

  it('404 si menú no existe', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        menuId: 999, // menú inexistente
        total: 20,
        restaurantId: 1, // cualquier valor
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Menú no encontrado');
  });

  it('404 si restaurante no existe', async () => {
    // para que no falle por menú, usamos uno ficticio que sí pasa
    const fakeMenu = { id: 1, restaurantId: 1 };
    jest.spyOn(require('../../src/modules/orders/dao/index.js').orderDAO, 'getMenuById')
      .mockResolvedValue(fakeMenu);

    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        menuId: 1,
        total: 20,
        restaurantId: 999, // restaurante inexistente
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Restaurante no encontrado');
  });

  it('404 si la orden no existe', async () => {
    const res = await request(app)
      .get('/orders/999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('La orden no existe');
  });
});
