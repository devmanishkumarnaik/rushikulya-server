import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    benefits: { type: String, required: true, trim: true },
    mrp: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    gst: { type: Number, required: true, min: 0, max: 100 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    expiry: { type: String, required: false, default: "NA", trim: true },
    available: { type: Boolean, default: true },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", MedicineSchema);