import request   from 'supertest';
import jwt       from 'jsonwebtoken';
import bcrypt    from 'bcrypt';

import app              from '../../src/app.js';
import { sequelize }    from '../../src/db/index.js';
import { userDAO }      from '../../src/modules/users/dao/index.js';
import { orderDAO }     from '../../src/modules/orders/dao/index.js';

describe('[PG] Orders controller — ramas catch', () => {
  let token;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const user = await userDAO.create({
      email: 'order@pg.com',
      password: await bcrypt.hash('123', 10),
      role: 'Cliente',
    });

    token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
  });

  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => await sequelize.close());

  it('POST /orders → 500 si orderDAO.create lanza', async () => {
    jest.spyOn(orderDAO, 'getMenuById').mockResolvedValue({ id: 1, restaurantId: 2 });
    jest.spyOn(orderDAO, 'getRestaurantById').mockResolvedValue({ id: 2 });

    jest.spyOn(orderDAO, 'create').mockImplementation(() => {
      throw new Error('fail creation');
    });

    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ menuId: 1, total: 50, restaurantId: 2 });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar con la base de datos');
  });

  it('GET /orders/:id → 500 si orderDAO.findById lanza', async () => {
    jest.spyOn(orderDAO, 'findById').mockImplementation(() => {
      throw new Error('fail fetch');
    });

    const res = await request(app)
      .get('/orders/999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Error al conectar con la base de datos');
  });
});
