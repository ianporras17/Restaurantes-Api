// src/modules/restaurants/restaurants.mongo.model.js
import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  capacity: { type: Number }
}, {
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
      ret.id = ret._id;     // ✅ alias
      delete ret._id;
    }
  }
});

export const RestaurantMongo = mongoose.model("Restaurant", restaurantSchema);
