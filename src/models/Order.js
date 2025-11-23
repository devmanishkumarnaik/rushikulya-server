import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, match: /^\d{10}$/ },
    location: { type: String, required: true, trim: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
    medicineName: { type: String, required: true },
    medicineBenefits: { type: String },
    medicinePrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);