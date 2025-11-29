// import mongoose from "mongoose";

// const serviceSchema = new mongoose.Schema({
//   sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   serviceName: { type: String, required: true },
//   description: { type: String, required: false, default: "" },
//   availableTime: { type: String, required: true },
//   location: { type: String, required: true },
//   code: { type: String, required: true, unique: true }, // 5-character alphanumeric code
//   available: { type: Boolean, default: true },
//   createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model("Service", serviceSchema);

import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  name: { type: String, required: true },
  serviceName: { type: String, required: true },
  description: { type: String, required: false, default: "" },
  availableTime: { type: String, required: true },
  location: { type: String, required: true },
  code: { type: String, required: true, unique: true }, // 5-character alphanumeric code
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Service", serviceSchema);
