import request   from 'supertest';
import jwt       from 'jsonwebtoken';
import bcrypt    from 'bcrypt';

import app                from '../../src/app.js';
import { sequelize }      from '../../src/db/index.js';
import { userDAO }        from '../../src/modules/users/dao/index.js';
import { restaurantDAO }  from '../../src/modules/restaurants/dao/index.js';
import { menuDAO }        from '../../src/modules/menus/dao/index.js';
import { orderDAO }       from '../../src/modules/orders/dao/index.js';

describe('[PG] Orders controller — validaciones extra', () => {
  let token, userId, menuId, restId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const user = await userDAO.create({
      email: 'pg@x.com',
      password: await bcrypt.hash('123', 10),
      role: 'Cliente',
    });
    token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    userId = user.id;

    const rest1 = await restaurantDAO.create({ name: 'R1', address: 'a', phone: '1' });
    const rest2 = await restaurantDAO.create({ name: 'R2', address: 'b', phone: '2' });

    restId = rest2.id;

    const menu = await menuDAO.create({
      title: 'Pizza',
      price: 10,
      restaurantId: rest1.id,  // ⚠️ Menú de otro restaurante
      isActive: true,          // ✅ requerido en Postgres
    });

    menuId = menu.id;
  });

  afterAll(async () => await sequelize.close());

  it('400 si menú no pertenece al restaurante', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        menuId,
        total: 10,
        restaurantId: restId, // restaurante diferente
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('El menú no pertenece a ese restaurante');
  });

  it('403 si otro usuario accede a la orden', async () => {
    const order = await orderDAO.create({
      menuId,
      total: 15,
      restaurantId: restId,
      userId: userId,
    });

    const other = await userDAO.create({
      email: 'other@x.com',
      password: await bcrypt.hash('123', 10),
      role: 'Cliente',
    });

    const otherToken = jwt.sign({ id: other.id, role: other.role }, process.env.JWT_SECRET);

    const res = await request(app)
      .get(`/orders/${order.id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe('Sin permisos para ver esta orden');
  });
});
