// src/modules/menus/menus.mongo.model.js
import mongoose from "mongoose";

const menuSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  }
}, {
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
      ret.id = ret._id;     // ✅ alias para compatibilidad
      delete ret._id;
    }
  }
});

export const MenuMongo = mongoose.model("Menu", menuSchema);
