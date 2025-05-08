import request   from 'supertest';
import app       from '../src/app.js';
import { sequelize } from '../src/db/index.js';
import { User }  from '../src/modules/users/users.model.js';
import { Restaurant } from '../src/modules/restaurants/restaurants.model.js';
import { Menu }  from '../src/modules/menus/menus.model.js';
import bcrypt    from 'bcrypt';
import jwt       from 'jsonwebtoken';

let adminToken, restaurantId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  const admin = await User.create({
    email: 'admin@err.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'Admin',
  });
  adminToken = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET);

  const rest = await Restaurant.create({
    name: 'ErrorTest',
    address: 'CR',
    phone: '000',
  });
  restaurantId = rest.id;
});

afterAll(async () => {
  await sequelize.close();
});

/* ------------------------------------------------------------------ */
/* POST /menus — error interno                                        */
/* ------------------------------------------------------------------ */
describe('POST /menus — error interno', () => {
  beforeAll(() => {
    jest.spyOn(Menu, 'create').mockImplementation(() => {
      throw new Error('DB crash');
    });
  });
  afterAll(() => Menu.create.mockRestore());

  it('500 cuando Menu.create lanza', async () => {
    const res = await request(app)
      .post('/menus')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Boom', restaurantId });
    expect(res.statusCode).toBe(500);
  });
});

/* ------------------------------------------------------------------ */
/* GET /menus/:id — error interno                                     */
/* ------------------------------------------------------------------ */
describe('GET /menus/:id — error interno', () => {
  beforeAll(() => {
    jest.spyOn(Menu, 'findByPk').mockImplementation(() => {
      throw new Error('DB crash');
    });
  });
  afterAll(() => Menu.findByPk.mockRestore());

  it('500 cuando Menu.findByPk lanza', async () => {
    const res = await request(app)
      .get('/menus/1')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(500);
  });
});
