// src/modules/users/dao/users.pg.js
import { User } from "../users.model.js";
import { indexDocumentInElastic } from "../../../utils/indexers.js";

export const pgUserDAO = {
  async create(data) {
    const user = await User.create(data);
    await indexDocumentInElastic({
      name: user.email,
      category: "User",
      description: `Usuario rol ${user.role}`,
    });
    return user;
  },
  async findByEmail(email) {
    return User.findOne({ where: { email } });
  },
  async findById(id) {
    return User.findByPk(id);
  },
  async update(id, updates) {
    const user = await User.findByPk(id);
    if (!user) return null;
    Object.assign(user, updates);
    await user.save();
    return user;
  },
  async delete(id) {
    const user = await User.findByPk(id);
    if (!user) return null;
    await user.destroy();
    return true;
  },
};
