import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED"],
      default: "ACTIVE",
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
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    timestamps: true,
  }
);

export const ReservationMongo = mongoose.model("Reservation", reservationSchema);
