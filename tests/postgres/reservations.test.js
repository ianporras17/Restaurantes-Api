// tests/postgres/reservations.test.js
import request     from 'supertest';
import jwt         from 'jsonwebtoken';
import bcrypt      from 'bcrypt';

import app                  from '../../src/app.js';
import { sequelize }        from '../../src/db/index.js';
import { userDAO }          from '../../src/modules/users/dao/index.js';
import { restaurantDAO }    from '../../src/modules/restaurants/dao/index.js';

let token, restId, resvId;

beforeAll(async () => {
  await sequelize.sync({ force:true });

  const u = await userDAO.create({
    email:    'pg@u.com',
    password: await bcrypt.hash('123',10),
    role:     'Cliente'
  });
  token = jwt.sign({ id:u.id, role:'Cliente' }, process.env.JWT_SECRET);

  const r = await restaurantDAO.create({
    name:    'PG',
    address: 'a',
    phone:   '1'
  });
  restId = r.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe('[PG] POST /reservations', () => {
  it('201 crea', async () => {
    const r = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        date:         '2025-11-11',
        time:         '12:00',
        guests:       4,
        restaurantId: restId
      });
    expect(r.statusCode).toBe(201);
    resvId = r.body.reservation.id;
  });
});

describe('[PG] DELETE /reservations/:id', () => {
  it('200 cancela', async () => {
    const r = await request(app)
      .delete(`/reservations/${resvId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(r.statusCode).toBe(200);
  });
});
