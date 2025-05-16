// src/utils/mongoId.js
import mongoose from "mongoose";
export const toObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
