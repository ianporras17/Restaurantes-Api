// src/modules/users/dao/users.mongo.js
import { UserMongo } from "../users.mongo.model.js";
import { toObjectId } from "../../../utils/mongoId.js";
import { indexDocumentInElastic } from "../../../utils/indexers.js";

export const mongoUserDAO = {
  async create(data) {
    const doc = new UserMongo(data);
    const saved = await doc.save();
    await indexDocumentInElastic({
      name: saved.email,
      category: "User",
      description: `Usuario rol ${saved.role}`,
    });
    return { ...saved.toObject(), id: saved._id.toString() };
  },
  async findByEmail(email) {
    const user = await UserMongo.findOne({ email }).lean();
    return user ? { ...user, id: user._id.toString() } : null;
  },
  async findById(id) {
    const _id = toObjectId(id);
    if (!_id) return null;
    const user = await UserMongo.findById(_id).lean();
    return user ? { ...user, id: user._id.toString() } : null;
  },
  async update(id, updates) {
    const _id = toObjectId(id);
    if (!_id) return null;
    const updated = await UserMongo.findByIdAndUpdate(_id, updates, {
      new: true,
      lean: true,
    });
    return updated ? { ...updated, id: updated._id.toString() } : null;
  },
  async delete(id) {
    const _id = toObjectId(id);
    if (!_id) return false;
    const res = await UserMongo.findByIdAndDelete(_id);
    return !!res;
  },
};
