import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "READY", "PICKED_UP", "CANCELLED"],
    default: "PENDING",
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
}, {
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
    }
  },
  timestamps: true
});

export const OrderMongo = mongoose.model("Order", orderSchema);
