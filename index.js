// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import Medicine from "./src/models/Medicine.js";
// import Seller from "./src/models/Seller.js";
// import Service from "./src/models/Service.js";
// import Product from "./src/models/Product.js";
// import { v2 as cloudinary } from "cloudinary";
// import multer from "multer";
// import fs from "fs";
// import path from "path";

// dotenv.config();

// const app = express();
// app.use(cors({ origin: "*" }));
// app.use(express.json());
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// const ADMIN_USER = process.env.ADMIN_USER;
// const ADMIN_PASS = process.env.ADMIN_PASS;

// function isAuthorized(req) {
//   const h = req.headers["authorization"] || "";
//   if (!h.startsWith("Basic ")) return false;
//   try {
//     const b64 = h.slice(6);
//     const decoded = Buffer.from(b64, "base64").toString("utf8");
//     const [u, p] = decoded.split(":");
//     return u === ADMIN_USER && p === ADMIN_PASS;
//   } catch {
//     return false;
//   }
// }

// // Generate a random 5-character alphanumeric code
// function generateCode() {
//   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//   let code = "";
//   for (let i = 0; i < 5; i++) {
//     code += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return code;
// }

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// // Error handler for multer
// const multerErrorHandler = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     if (err.code === "LIMIT_FILE_SIZE") {
//       return res.status(413).json({ error: "Image must be 2MB or smaller" });
//     }
//     return res.status(400).json({ error: err.message });
//   }
//   next(err);
// };

// app.use(multerErrorHandler);

// // Ensure uploads directory exists
// const uploadsDir = path.join(process.cwd(), "uploads");
// fs.mkdirSync(uploadsDir, { recursive: true });

// app.get("/api/medicines", async (req, res) => {
//   const list = await Medicine.find().sort({ createdAt: -1 });
//   const base = `${req.protocol}://${req.get("host")}`;
//   const normalized = list.map((doc) => {
//     const m = doc.toObject();
//     if (m.imageUrl && m.imageUrl.startsWith("/uploads/")) {
//       m.imageUrl = `${base}${m.imageUrl}`;
//     }
//     return m;
//   });
//   res.json(normalized);
// });

// app.post("/api/medicines", async (req, res) => {
//   if (!isAuthorized(req)) {
//     res.status(401).json({ error: "Unauthorized" });
//     return;
//   }
//   const { name, benefits, mrp, price, gst, deliveryCharge, expiry } = req.body;
//   if (!name || !benefits || mrp === undefined || price === undefined || gst === undefined || deliveryCharge === undefined) {
//     res.status(400).json({ error: "Missing fields" });
//     return;
//   }
  
//   // Validate expiry format if provided
//   if (expiry && expiry.trim().toUpperCase() !== "NA") {
//     const expiryPattern = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
//     if (!expiryPattern.test(expiry.trim())) {
//       return res.status(400).json({ error: "Expiry must be in DD-MM-YYYY format or NA" });
//     }
//   }
  
//   try {
//     const med = new Medicine({ 
//       name, 
//       benefits, 
//       mrp,
//       price, 
//       gst, 
//       deliveryCharge,
//       expiry: expiry ? expiry.trim() : "NA",
//       imageUrl: req.body.imageUrl, 
//       available: req.body.available !== undefined ? !!req.body.available : true 
//     });
//     await med.save();
//     res.status(201).json(med);
//   } catch (e) {
//     res.status(400).json({ error: "Invalid data" });
//   }
// });

// app.put("/api/medicines/:id", async (req, res) => {
//   if (!isAuthorized(req)) {
//     res.status(401).json({ error: "Unauthorized" });
//     return;
//   }
//   const { id } = req.params;
//   const { name, benefits, mrp, gst, deliveryCharge, expiry, imageUrl, available } = req.body;
  
//   // Validate expiry format if provided
//   if (expiry !== undefined && expiry.trim().toUpperCase() !== "NA") {
//     const expiryPattern = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
//     if (!expiryPattern.test(expiry.trim())) {
//       return res.status(400).json({ error: "Expiry must be in DD-MM-YYYY format or NA" });
//     }
//   }
  
//   const patch = {};
//   if (name !== undefined) patch.name = name;
//   if (benefits !== undefined) patch.benefits = benefits;
//   if (mrp !== undefined) patch.mrp = mrp;
//   if (gst !== undefined) patch.gst = gst;
//   if (deliveryCharge !== undefined) patch.deliveryCharge = deliveryCharge;
//   if (expiry !== undefined) patch.expiry = expiry.trim();
//   if (imageUrl !== undefined) patch.imageUrl = imageUrl;
//   if (available !== undefined) patch.available = !!available;
//   try {
//     const updated = await Medicine.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
//     if (!updated) {
//       res.status(404).json({ error: "Not found" });
//       return;
//     }
//     res.json(updated);
//   } catch (e) {
//     res.status(400).json({ error: "Invalid data" });
//   }
// });

// app.delete("/api/medicines/:id", async (req, res) => {
//   if (!isAuthorized(req)) {
//     res.status(401).json({ error: "Unauthorized" });
//     return;
//   }
//   const { id } = req.params;
//   try {
//     const del = await Medicine.findByIdAndDelete(id);
//     if (!del) {
//       res.status(404).json({ error: "Not found" });
//       return;
//     }
//     res.json({ ok: true });
//   } catch (e) {
//     res.status(400).json({ error: "Invalid id" });
//   }
// });

// // Orders are handled client-side via Gmail compose links; keep endpoint for compatibility
// app.post("/api/orders", (req, res) => {
//   res.status(410).json({ error: "Ordering via API has been discontinued. Please use the website order form." });
// });

// app.post("/api/upload", upload.single("file"), async (req, res) => {
//   try {
//     if (!isAuthorized(req)) {
//       res.status(401).json({ error: "Unauthorized" });
//       return;
//     }

//     if (!req.file) {
//       res.status(400).json({ error: "No file provided" });
//       return;
//     }

//     if (!req.file.mimetype || !req.file.mimetype.startsWith("image/")) {
//       res.status(400).json({ error: "Only image files are allowed" });
//       return;
//     }

//     const hasCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
    
//     if (hasCloudinary) {
//       try {
//         const result = await new Promise((resolve, reject) => {
//           const stream = cloudinary.uploader.upload_stream({ folder: "medstore" }, (err, res2) => {
//             if (err) reject(err);
//             else resolve(res2);
//           });
//           stream.end(req.file.buffer);
//         });
//         res.json({ url: result.secure_url });
//       } catch (err) {
//         console.error("Cloudinary upload error:", err);
//         res.status(500).json({ error: "Cloudinary upload failed" });
//       }
//     } else {
//       try {
//         const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.\-]/g, "_")}`;
//         const full = path.join(uploadsDir, filename);
//         fs.writeFileSync(full, req.file.buffer);
//         const base = `${req.protocol}://${req.get("host")}`;
//         res.json({ url: `${base}/uploads/${filename}` });
//       } catch (err) {
//         console.error("Local file save error:", err);
//         res.status(500).json({ error: "Failed to save file" });
//       }
//     }
//   } catch (err) {
//     console.error("Upload error:", err);
//     res.status(500).json({ error: "Upload failed" });
//   }
// });

// app.get("/api/admin-check", (req, res) => {
//   if (!isAuthorized(req)) {
//     res.status(401).json({ error: "Unauthorized" });
//     return;
//   }
//   res.json({ ok: true });
// });

// // Seller registration
// app.post("/api/seller/register", async (req, res) => {
//   try {
//     const { firstName, lastName, email, password, phone } = req.body;
    
//     console.log("Registration attempt:", { firstName, lastName, email, phone });
    
//     if (!firstName || !lastName || !email || !password || !phone) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     if (!/^\d{10}$/.test(phone)) {
//       return res.status(400).json({ error: "Phone number must be 10 digits" });
//     }

//     const existingSeller = await Seller.findOne({ email: email.toLowerCase() });
//     if (existingSeller) {
//       return res.status(400).json({ error: "Email already registered" });
//     }

//     const seller = new Seller({ 
//       firstName: firstName.trim(), 
//       lastName: lastName.trim(), 
//       email: email.toLowerCase().trim(), 
//       password, 
//       phone: phone.trim() 
//     });
    
//     await seller.save();
//     console.log("Seller registered successfully:", seller._id);
    
//     res.status(201).json({ 
//       success: true, 
//       seller: { 
//         id: seller._id, 
//         firstName: seller.firstName, 
//         lastName: seller.lastName, 
//         email: seller.email,
//         phone: seller.phone
//       } 
//     });
//   } catch (error) {
//     console.error("Registration error:", error);
//     if (error.code === 11000) {
//       return res.status(400).json({ error: "Email already registered" });
//     }
//     res.status(500).json({ error: error.message || "Registration failed" });
//   }
// });

// // Seller login
// app.post("/api/seller/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     console.log("Login attempt:", { email });
    
//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     const seller = await Seller.findOne({ email: email.toLowerCase().trim() });
//     if (!seller) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }
    
//     if (seller.password !== password) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     console.log("Seller logged in successfully:", seller._id);
    
//     res.json({ 
//       success: true, 
//       seller: { 
//         id: seller._id, 
//         firstName: seller.firstName, 
//         lastName: seller.lastName, 
//         email: seller.email,
//         phone: seller.phone
//       } 
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({ error: error.message || "Login failed" });
//   }
// });

// // Verify seller account status
// app.get("/api/seller/verify/:sellerId", async (req, res) => {
//   try {
//     const { sellerId } = req.params;
//     const seller = await Seller.findById(sellerId);
    
//     if (!seller) {
//       return res.status(404).json({ 
//         exists: false, 
//         error: "ACCOUNT_DELETED",
//         message: "Your account has been deleted. Please contact support if you believe this is an error." 
//       });
//     }
    
//     res.json({ exists: true, seller: { id: seller._id, firstName: seller.firstName, lastName: seller.lastName } });
//   } catch (error) {
//     console.error("Error verifying seller:", error);
//     res.status(500).json({ error: error.message || "Verification failed" });
//   }
// });

// // Get all sellers (admin only)
// app.get("/api/sellers", async (req, res) => {
//   if (!isAuthorized(req)) {
//     res.status(401).json({ error: "Unauthorized" });
//     return;
//   }
//   try {
//     const sellers = await Seller.find().sort({ createdAt: -1 }).select("-password");
//     res.json(sellers);
//   } catch (error) {
//     console.error("Error fetching sellers:", error);
//     res.status(500).json({ error: "Failed to fetch sellers" });
//   }
// });

// // Update seller (admin only)
// app.put("/api/sellers/:id", async (req, res) => {
//   if (!isAuthorized(req)) {
//     res.status(401).json({ error: "Unauthorized" });
//     return;
//   }
//   try {
//     const { id } = req.params;
//     const { firstName, lastName, email, phone } = req.body;
    
//     const updateData = {};
//     if (firstName) updateData.firstName = firstName.trim();
//     if (lastName) updateData.lastName = lastName.trim();
//     if (email) updateData.email = email.toLowerCase().trim();
//     if (phone) updateData.phone = phone.trim();

//     const seller = await Seller.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    
//     if (!seller) {
//       return res.status(404).json({ error: "Seller not found" });
//     }

//     console.log("Seller updated:", seller._id);
//     res.json({ success: true, seller });
//   } catch (error) {
//     console.error("Error updating seller:", error);
//     res.status(500).json({ error: error.message || "Failed to update seller" });
//   }
// });

// // Delete seller (admin only)
// app.delete("/api/sellers/:id", async (req, res) => {
//   if (!isAuthorized(req)) {
//     res.status(401).json({ error: "Unauthorized" });
//     return;
//   }
//   try {
//     const { id } = req.params;
//     const seller = await Seller.findById(id);
    
//     if (!seller) {
//       return res.status(404).json({ error: "Seller not found" });
//     }

//     // Delete all services associated with this seller
//     const deletedServices = await Service.deleteMany({ sellerId: id });
//     console.log(`Deleted ${deletedServices.deletedCount} services for seller:`, id);

//     // Delete all products associated with this seller
//     const deletedProducts = await Product.deleteMany({ sellerId: id });
//     console.log(`Deleted ${deletedProducts.deletedCount} products for seller:`, id);

//     // Delete the seller
//     await Seller.findByIdAndDelete(id);
//     console.log("Seller deleted:", seller._id);
    
//     res.json({ 
//       success: true, 
//       message: "Seller and all associated data deleted successfully",
//       deletedServices: deletedServices.deletedCount,
//       deletedProducts: deletedProducts.deletedCount
//     });
//   } catch (error) {
//     console.error("Error deleting seller:", error);
//     res.status(500).json({ error: error.message || "Failed to delete seller" });
//   }
// });

// // Get all services (public)
// app.get("/api/services", async (req, res) => {
//   try {
//     // Populate services with seller phone numbers
//     const services = await Service.find().sort({ createdAt: -1 });
    
//     // Add seller phone numbers to services
//     const servicePromises = services.map(async (service) => {
//       const seller = await Seller.findById(service.sellerId);
//       return {
//         ...service.toObject(),
//         phone: seller ? seller.phone : null
//       };
//     });
    
//     const servicesWithPhone = await Promise.all(servicePromises);
//     res.json(servicesWithPhone);
//   } catch (error) {
//     console.error("Error fetching services:", error);
//     res.status(500).json({ error: "Failed to fetch services" });
//   }
// });

// // Get unique service names
// app.get("/api/services/names", async (req, res) => {
//   try {
//     const names = await Service.distinct("serviceName");
//     res.json(names.sort());
//   } catch (error) {
//     console.error("Error fetching service names:", error);
//     res.status(500).json({ error: "Failed to fetch service names" });
//   }
// });

// // Get services by seller ID
// app.get("/api/services/seller/:sellerId", async (req, res) => {
//   try {
//     const { sellerId } = req.params;
//     const services = await Service.find({ sellerId }).sort({ createdAt: -1 });
    
//     // Add seller phone numbers to services
//     const servicePromises = services.map(async (service) => {
//       const seller = await Seller.findById(service.sellerId);
//       return {
//         ...service.toObject(),
//         phone: seller ? seller.phone : null
//       };
//     });
    
//     const servicesWithPhone = await Promise.all(servicePromises);
//     res.json(servicesWithPhone);
//   } catch (error) {
//     console.error("Error fetching seller services:", error);
//     res.status(500).json({ error: "Failed to fetch services" });
//   }
// });

// // Create service
// app.post("/api/services", async (req, res) => {
//   try {
//     const { sellerId, firstName, lastName, serviceName, description, availableTime, location } = req.body;
    
//     if (!sellerId || !firstName || !lastName || !serviceName || !availableTime || !location) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // Check if seller account exists
//     const seller = await Seller.findById(sellerId);
//     if (!seller) {
//       return res.status(403).json({ error: "ACCOUNT_DELETED", message: "Your account has been deleted. Please contact support if you believe this is an error." });
//     }

//     // Validate service name character count
//     if (serviceName.trim().length > 20) {
//       return res.status(400).json({ error: "Service name must not exceed 20 characters" });
//     }

//     // Validate description character count
//     if (description) {
//       if (description.trim().length > 50) {
//         return res.status(400).json({ error: "Description must not exceed 50 characters" });
//       }
//     }

//     // Validate available time character count
//     if (availableTime.trim().length > 30) {
//       return res.status(400).json({ error: "Available time must not exceed 30 characters" });
//     }

//     // Validate location character count
//     if (location.trim().length > 70) {
//       return res.status(400).json({ error: "Address must not exceed 70 characters" });
//     }

//     const service = new Service({
//       sellerId,
//       firstName: firstName.trim(),
//       lastName: lastName.trim(),
//       serviceName: serviceName.trim(),
//       description: description ? description.trim() : "",
//       availableTime: availableTime.trim(),
//       location: location.trim(),
//       code: generateCode() // Generate unique 5-character code
//     });

//     await service.save();
//     console.log("Service created:", service._id);
    
//     res.status(201).json({ success: true, service });
//   } catch (error) {
//     console.error("Error creating service:", error);
//     res.status(500).json({ error: error.message || "Failed to create service" });
//   }
// });

// // Update service
// app.put("/api/services/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { serviceName, description, availableTime, location, available } = req.body;
    
//     // Validate service name character count
//     if (serviceName && serviceName.trim().length > 20) {
//       return res.status(400).json({ error: "Service name must not exceed 20 characters" });
//     }
    
//     // Validate description character count
//     if (description) {
//       if (description.trim().length > 50) {
//         return res.status(400).json({ error: "Description must not exceed 50 characters" });
//       }
//     }

//     // Validate available time character count
//     if (availableTime && availableTime.trim().length > 30) {
//       return res.status(400).json({ error: "Available time must not exceed 30 characters" });
//     }

//     // Validate location character count
//     if (location && location.trim().length > 50) {
//       return res.status(400).json({ error: "Address must not exceed 50 characters" });
//     }
    
//     const updateData = {};
//     if (serviceName) updateData.serviceName = serviceName.trim();
//     if (description !== undefined) updateData.description = description.trim();
//     if (availableTime) updateData.availableTime = availableTime.trim();
//     if (location) updateData.location = location.trim();
//     if (available !== undefined) updateData.available = !!available;

//     const service = await Service.findByIdAndUpdate(id, updateData, { new: true });
    
//     if (!service) {
//       return res.status(404).json({ error: "Service not found" });
//     }

//     console.log("Service updated:", service._id);
//     res.json({ success: true, service });
//   } catch (error) {
//     console.error("Error updating service:", error);
//     res.status(500).json({ error: error.message || "Failed to update service" });
//   }
// });

// // Delete service
// app.delete("/api/services/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const service = await Service.findByIdAndDelete(id);
    
//     if (!service) {
//       return res.status(404).json({ error: "Service not found" });
//     }

//     console.log("Service deleted:", service._id);
//     res.json({ success: true });
//   } catch (error) {
//     console.error("Error deleting service:", error);
//     res.status(500).json({ error: error.message || "Failed to delete service" });
//   }
// });

// // Get all products (public)
// app.get("/api/products", async (req, res) => {
//   try {
//     const products = await Product.find().sort({ createdAt: -1 });
//     const base = `${req.protocol}://${req.get("host")}`;
    
//     // Add seller phone numbers to products
//     const productPromises = products.map(async (product) => {
//       const seller = await Seller.findById(product.sellerId);
//       const p = product.toObject();
//       if (p.imageUrl && p.imageUrl.startsWith("/uploads/")) {
//         p.imageUrl = `${base}${p.imageUrl}`;
//       }
//       return {
//         ...p,
//         phone: seller ? seller.phone : null
//       };
//     });
    
//     const productsWithPhone = await Promise.all(productPromises);
//     res.json(productsWithPhone);
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// });

// // Get unique product names
// app.get("/api/products/names", async (req, res) => {
//   try {
//     const names = await Product.distinct("productName");
//     res.json(names.sort());
//   } catch (error) {
//     console.error("Error fetching product names:", error);
//     res.status(500).json({ error: "Failed to fetch product names" });
//   }
// });

// // Get products by seller ID
// app.get("/api/products/seller/:sellerId", async (req, res) => {
//   try {
//     const { sellerId } = req.params;
//     const products = await Product.find({ sellerId }).sort({ createdAt: -1 });
//     const base = `${req.protocol}://${req.get("host")}`;
    
//     // Add seller phone numbers to products
//     const productPromises = products.map(async (product) => {
//       const seller = await Seller.findById(product.sellerId);
//       const p = product.toObject();
//       if (p.imageUrl && p.imageUrl.startsWith("/uploads/")) {
//         p.imageUrl = `${base}${p.imageUrl}`;
//       }
//       return {
//         ...p,
//         phone: seller ? seller.phone : null
//       };
//     });
    
//     const productsWithPhone = await Promise.all(productPromises);
//     res.json(productsWithPhone);
//   } catch (error) {
//     console.error("Error fetching seller products:", error);
//     res.status(500).json({ error: "Failed to fetch products" });
//   }
// });

// // Create product
// app.post("/api/products", async (req, res) => {
//   try {
//     const { sellerId, firstName, lastName, productName, details, imageUrl, location } = req.body;
    
//     if (!sellerId || !firstName || !lastName || !productName || !imageUrl || !location) {
//       return res.status(400).json({ error: "All fields are required" });
//     }

//     // Check if seller account exists
//     const seller = await Seller.findById(sellerId);
//     if (!seller) {
//       return res.status(403).json({ error: "ACCOUNT_DELETED", message: "Your account has been deleted. Please contact support if you believe this is an error." });
//     }

//     // Validate product name character count
//     if (productName.trim().length > 20) {
//       return res.status(400).json({ error: "Product name must not exceed 20 characters" });
//     }

//     // Validate product details character count
//     if (details && details.trim().length > 50) {
//       return res.status(400).json({ error: "Product details must not exceed 50 characters" });
//     }

//     // Validate location character count
//     if (location.trim().length > 70) {
//       return res.status(400).json({ error: "Address must not exceed 70 characters" });
//     }

//     const product = new Product({
//       sellerId,
//       firstName: firstName.trim(),
//       lastName: lastName.trim(),
//       productName: productName.trim(),
//       details: details ? details.trim() : "",
//       imageUrl,
//       location: location.trim(),
//       code: generateCode() // Generate unique 5-character code
//     });

//     await product.save();
//     console.log("Product created:", product._id);
    
//     res.status(201).json({ success: true, product });
//   } catch (error) {
//     console.error("Error creating product:", error);
//     res.status(500).json({ error: error.message || "Failed to create product" });
//   }
// });

// // Update product
// app.put("/api/products/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { productName, details, imageUrl, location, available } = req.body;
    
//     // Validate product name character count
//     if (productName && productName.trim().length > 20) {
//       return res.status(400).json({ error: "Product name must not exceed 20 characters" });
//     }

//     // Validate product details character count
//     if (details && details.trim().length > 50) {
//       return res.status(400).json({ error: "Product details must not exceed 50 characters" });
//     }

//     // Validate location character count
//     if (location && location.trim().length > 50) {
//       return res.status(400).json({ error: "Address must not exceed 50 characters" });
//     }
    
//     const updateData = {};
//     if (productName) updateData.productName = productName.trim();
//     if (details !== undefined) updateData.details = details.trim();
//     if (imageUrl) updateData.imageUrl = imageUrl;
//     if (location) updateData.location = location.trim();
//     if (available !== undefined) updateData.available = !!available;

//     const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    
//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     console.log("Product updated:", product._id);
//     res.json({ success: true, product });
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res.status(500).json({ error: error.message || "Failed to update product" });
//   }
// });

// // Delete product
// app.delete("/api/products/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findByIdAndDelete(id);
    
//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     console.log("Product deleted:", product._id);
//     res.json({ success: true });
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     res.status(500).json({ error: error.message || "Failed to delete product" });
//   }
// });

// const PORT = process.env.PORT || 5000;

// async function start() {
//   const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medstore";
//   try {
//     await mongoose.connect(uri);
//     console.log("Database connected successfully");
//   } catch (err) {
//     console.error("Database connection error:", err && err.message ? err.message : err);
//     process.exit(1);
//   }
//   app.listen(PORT, () => {
//     console.log(`Server started on port ${PORT}`);
//   });
// }

// start();



import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Medicine from "./src/models/Medicine.js";
import Seller from "./src/models/Seller.js";
import Service from "./src/models/Service.js";
import Product from "./src/models/Product.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

function isAuthorized(req) {
  const h = req.headers["authorization"] || "";
  if (!h.startsWith("Basic ")) return false;
  try {
    const b64 = h.slice(6);
    const decoded = Buffer.from(b64, "base64").toString("utf8");
    const [u, p] = decoded.split(":");
    return u === ADMIN_USER && p === ADMIN_PASS;
  } catch {
    return false;
  }
}

// Generate a random 5-character alphanumeric code
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

// Error handler for multer
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "Image must be 2MB or smaller" });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
};

app.use(multerErrorHandler);

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

app.get("/api/medicines", async (req, res) => {
  const list = await Medicine.find().sort({ createdAt: -1 });
  const base = `${req.protocol}://${req.get("host")}`;
  const normalized = list.map((doc) => {
    const m = doc.toObject();
    if (m.imageUrl && m.imageUrl.startsWith("/uploads/")) {
      m.imageUrl = `${base}${m.imageUrl}`;
    }
    return m;
  });
  res.json(normalized);
});

app.post("/api/medicines", async (req, res) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { name, benefits, mrp, price, gst, deliveryCharge, expiry } = req.body;
  if (!name || !benefits || mrp === undefined || price === undefined || gst === undefined || deliveryCharge === undefined) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }
  
  // Validate expiry format if provided
  if (expiry && expiry.trim().toUpperCase() !== "NA") {
    const expiryPattern = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (!expiryPattern.test(expiry.trim())) {
      return res.status(400).json({ error: "Expiry must be in DD-MM-YYYY format or NA" });
    }
  }
  
  try {
    const med = new Medicine({ 
      name, 
      benefits, 
      mrp,
      price, 
      gst, 
      deliveryCharge,
      expiry: expiry ? expiry.trim() : "NA",
      imageUrl: req.body.imageUrl, 
      available: req.body.available !== undefined ? !!req.body.available : true 
    });
    await med.save();
    res.status(201).json(med);
  } catch (e) {
    res.status(400).json({ error: "Invalid data" });
  }
});

app.put("/api/medicines/:id", async (req, res) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params;
  const { name, benefits, mrp, gst, deliveryCharge, expiry, imageUrl, available } = req.body;
  
  // Validate expiry format if provided
  if (expiry !== undefined && expiry.trim().toUpperCase() !== "NA") {
    const expiryPattern = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (!expiryPattern.test(expiry.trim())) {
      return res.status(400).json({ error: "Expiry must be in DD-MM-YYYY format or NA" });
    }
  }
  
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (benefits !== undefined) patch.benefits = benefits;
  if (mrp !== undefined) patch.mrp = mrp;
  if (gst !== undefined) patch.gst = gst;
  if (deliveryCharge !== undefined) patch.deliveryCharge = deliveryCharge;
  if (expiry !== undefined) patch.expiry = expiry.trim();
  if (imageUrl !== undefined) patch.imageUrl = imageUrl;
  if (available !== undefined) patch.available = !!available;
  try {
    const updated = await Medicine.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: "Invalid data" });
  }
});

app.delete("/api/medicines/:id", async (req, res) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { id } = req.params;
  try {
    const del = await Medicine.findByIdAndDelete(id);
    if (!del) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// Orders are handled client-side via Gmail compose links; keep endpoint for compatibility
app.post("/api/orders", (req, res) => {
  res.status(410).json({ error: "Ordering via API has been discontinued. Please use the website order form." });
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!isAuthorized(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    if (!req.file.mimetype || !req.file.mimetype.startsWith("image/")) {
      res.status(400).json({ error: "Only image files are allowed" });
      return;
    }

    const hasCloudinary = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
    
    if (hasCloudinary) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: "medstore" }, (err, res2) => {
            if (err) reject(err);
            else resolve(res2);
          });
          stream.end(req.file.buffer);
        });
        res.json({ url: result.secure_url });
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        res.status(500).json({ error: "Cloudinary upload failed" });
      }
    } else {
      try {
        const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.\-]/g, "_")}`;
        const full = path.join(uploadsDir, filename);
        fs.writeFileSync(full, req.file.buffer);
        const base = `${req.protocol}://${req.get("host")}`;
        res.json({ url: `${base}/uploads/${filename}` });
      } catch (err) {
        console.error("Local file save error:", err);
        res.status(500).json({ error: "Failed to save file" });
      }
    }
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get("/api/admin-check", (req, res) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({ ok: true });
});

// Seller registration
app.post("/api/seller/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    console.log("Registration attempt:", { name, email, phone });
    
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: "Phone number must be 10 digits" });
    }

    const existingSeller = await Seller.findOne({ email: email.toLowerCase() });
    if (existingSeller) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const seller = new Seller({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password, 
      phone: phone.trim() 
    });
    
    await seller.save();
    console.log("Seller registered successfully:", seller._id);
    
    res.status(201).json({ 
      success: true, 
      seller: { 
        id: seller._id, 
        name: seller.name, 
        email: seller.email,
        phone: seller.phone
      } 
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: error.message || "Registration failed" });
  }
});

// Seller login
app.post("/api/seller/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("Login attempt:", { email });
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const seller = await Seller.findOne({ email: email.toLowerCase().trim() });
    if (!seller) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    if (seller.password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log("Seller logged in successfully:", seller._id);
    
    res.json({ 
      success: true, 
      seller: { 
        id: seller._id, 
        name: seller.name, 
        email: seller.email,
        phone: seller.phone
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message || "Login failed" });
  }
});

// Verify seller account status
app.get("/api/seller/verify/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const seller = await Seller.findById(sellerId);
    
    if (!seller) {
      return res.status(404).json({ 
        exists: false, 
        error: "ACCOUNT_DELETED",
        message: "Your account has been deleted. Please contact support if you believe this is an error." 
      });
    }
    
    res.json({ exists: true, seller: { id: seller._id, name: seller.name } });
  } catch (error) {
    console.error("Error verifying seller:", error);
    res.status(500).json({ error: error.message || "Verification failed" });
  }
});

// Get all sellers (admin only)
app.get("/api/sellers", async (req, res) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const sellers = await Seller.find().sort({ createdAt: -1 }).select("-password");
    res.json(sellers);
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ error: "Failed to fetch sellers" });
  }
});

// Update seller (admin only)
app.put("/api/sellers/:id", async (req, res) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();
    if (phone) updateData.phone = phone.trim();

    const seller = await Seller.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    console.log("Seller updated:", seller._id);
    res.json({ success: true, seller });
  } catch (error) {
    console.error("Error updating seller:", error);
    res.status(500).json({ error: error.message || "Failed to update seller" });
  }
});

// Delete seller (admin only)
app.delete("/api/sellers/:id", async (req, res) => {
  if (!isAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { id } = req.params;
    const seller = await Seller.findById(id);
    
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    // Delete all services associated with this seller
    const deletedServices = await Service.deleteMany({ sellerId: id });
    console.log(`Deleted ${deletedServices.deletedCount} services for seller:`, id);

    // Delete all products associated with this seller
    const deletedProducts = await Product.deleteMany({ sellerId: id });
    console.log(`Deleted ${deletedProducts.deletedCount} products for seller:`, id);

    // Delete the seller
    await Seller.findByIdAndDelete(id);
    console.log("Seller deleted:", seller._id);
    
    res.json({ 
      success: true, 
      message: "Seller and all associated data deleted successfully",
      deletedServices: deletedServices.deletedCount,
      deletedProducts: deletedProducts.deletedCount
    });
  } catch (error) {
    console.error("Error deleting seller:", error);
    res.status(500).json({ error: error.message || "Failed to delete seller" });
  }
});

// Get all services (public)
app.get("/api/services", async (req, res) => {
  try {
    // Populate services with seller phone numbers
    const services = await Service.find().sort({ createdAt: -1 });
    
    // Add seller phone numbers to services
    const servicePromises = services.map(async (service) => {
      const seller = await Seller.findById(service.sellerId);
      return {
        ...service.toObject(),
        phone: seller ? seller.phone : null
      };
    });
    
    const servicesWithPhone = await Promise.all(servicePromises);
    res.json(servicesWithPhone);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// Get unique service names
app.get("/api/services/names", async (req, res) => {
  try {
    const names = await Service.distinct("serviceName");
    res.json(names.sort());
  } catch (error) {
    console.error("Error fetching service names:", error);
    res.status(500).json({ error: "Failed to fetch service names" });
  }
});

// Get services by seller ID
app.get("/api/services/seller/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const services = await Service.find({ sellerId }).sort({ createdAt: -1 });
    
    // Add seller phone numbers to services
    const servicePromises = services.map(async (service) => {
      const seller = await Seller.findById(service.sellerId);
      return {
        ...service.toObject(),
        phone: seller ? seller.phone : null
      };
    });
    
    const servicesWithPhone = await Promise.all(servicePromises);
    res.json(servicesWithPhone);
  } catch (error) {
    console.error("Error fetching seller services:", error);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// Create service
app.post("/api/services", async (req, res) => {
  try {
    const { sellerId, name, serviceName, description, availableTime, location } = req.body;
    
    if (!sellerId || !name || !serviceName || !availableTime || !location) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if seller account exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(403).json({ error: "ACCOUNT_DELETED", message: "Your account has been deleted. Please contact support if you believe this is an error." });
    }

    // Validate service name character count
    if (serviceName.trim().length > 20) {
      return res.status(400).json({ error: "Service name must not exceed 20 characters" });
    }

    // Validate description character count
    if (description) {
      if (description.trim().length > 50) {
        return res.status(400).json({ error: "Description must not exceed 50 characters" });
      }
    }

    // Validate available time character count
    if (availableTime.trim().length > 30) {
      return res.status(400).json({ error: "Available time must not exceed 30 characters" });
    }

    // Validate location character count
    if (location.trim().length > 70) {
      return res.status(400).json({ error: "Address must not exceed 70 characters" });
    }

    const service = new Service({
      sellerId,
      name: name.trim(),
      serviceName: serviceName.trim(),
      description: description ? description.trim() : "",
      availableTime: availableTime.trim(),
      location: location.trim(),
      code: generateCode() // Generate unique 5-character code
    });

    await service.save();
    console.log("Service created:", service._id);
    
    res.status(201).json({ success: true, service });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: error.message || "Failed to create service" });
  }
});

// Update service
app.put("/api/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { serviceName, description, availableTime, location, available } = req.body;
    
    // Validate service name character count
    if (serviceName && serviceName.trim().length > 20) {
      return res.status(400).json({ error: "Service name must not exceed 20 characters" });
    }
    
    // Validate description character count
    if (description) {
      if (description.trim().length > 50) {
        return res.status(400).json({ error: "Description must not exceed 50 characters" });
      }
    }

    // Validate available time character count
    if (availableTime && availableTime.trim().length > 30) {
      return res.status(400).json({ error: "Available time must not exceed 30 characters" });
    }

    // Validate location character count
    if (location && location.trim().length > 50) {
      return res.status(400).json({ error: "Address must not exceed 50 characters" });
    }
    
    const updateData = {};
    if (serviceName) updateData.serviceName = serviceName.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (availableTime) updateData.availableTime = availableTime.trim();
    if (location) updateData.location = location.trim();
    if (available !== undefined) updateData.available = !!available;

    const service = await Service.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    console.log("Service updated:", service._id);
    res.json({ success: true, service });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: error.message || "Failed to update service" });
  }
});

// Delete service
app.delete("/api/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    console.log("Service deleted:", service._id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: error.message || "Failed to delete service" });
  }
});

// Get all products (public)
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const base = `${req.protocol}://${req.get("host")}`;
    
    // Add seller phone numbers to products
    const productPromises = products.map(async (product) => {
      const seller = await Seller.findById(product.sellerId);
      const p = product.toObject();
      if (p.imageUrl && p.imageUrl.startsWith("/uploads/")) {
        p.imageUrl = `${base}${p.imageUrl}`;
      }
      return {
        ...p,
        phone: seller ? seller.phone : null
      };
    });
    
    const productsWithPhone = await Promise.all(productPromises);
    res.json(productsWithPhone);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get unique product names
app.get("/api/products/names", async (req, res) => {
  try {
    const names = await Product.distinct("productName");
    res.json(names.sort());
  } catch (error) {
    console.error("Error fetching product names:", error);
    res.status(500).json({ error: "Failed to fetch product names" });
  }
});

// Get products by seller ID
app.get("/api/products/seller/:sellerId", async (req, res) => {
  try {
    const { sellerId } = req.params;
    const products = await Product.find({ sellerId }).sort({ createdAt: -1 });
    const base = `${req.protocol}://${req.get("host")}`;
    
    // Add seller phone numbers to products
    const productPromises = products.map(async (product) => {
      const seller = await Seller.findById(product.sellerId);
      const p = product.toObject();
      if (p.imageUrl && p.imageUrl.startsWith("/uploads/")) {
        p.imageUrl = `${base}${p.imageUrl}`;
      }
      return {
        ...p,
        phone: seller ? seller.phone : null
      };
    });
    
    const productsWithPhone = await Promise.all(productPromises);
    res.json(productsWithPhone);
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Create product
app.post("/api/products", async (req, res) => {
  try {
    const { sellerId, name, productName, details, imageUrl, location } = req.body;
    
    if (!sellerId || !name || !productName || !imageUrl || !location) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if seller account exists
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(403).json({ error: "ACCOUNT_DELETED", message: "Your account has been deleted. Please contact support if you believe this is an error." });
    }

    // Validate product name character count
    if (productName.trim().length > 20) {
      return res.status(400).json({ error: "Product name must not exceed 20 characters" });
    }

    // Validate product details character count
    if (details && details.trim().length > 50) {
      return res.status(400).json({ error: "Product details must not exceed 50 characters" });
    }

    // Validate location character count
    if (location.trim().length > 70) {
      return res.status(400).json({ error: "Address must not exceed 70 characters" });
    }

    const product = new Product({
      sellerId,
      name: name.trim(),
      productName: productName.trim(),
      details: details ? details.trim() : "",
      imageUrl,
      location: location.trim(),
      code: generateCode() // Generate unique 5-character code
    });

    await product.save();
    console.log("Product created:", product._id);
    
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: error.message || "Failed to create product" });
  }
});

// Update product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, details, imageUrl, location, available } = req.body;
    
    // Validate product name character count
    if (productName && productName.trim().length > 20) {
      return res.status(400).json({ error: "Product name must not exceed 20 characters" });
    }

    // Validate product details character count
    if (details && details.trim().length > 50) {
      return res.status(400).json({ error: "Product details must not exceed 50 characters" });
    }

    // Validate location character count
    if (location && location.trim().length > 50) {
      return res.status(400).json({ error: "Address must not exceed 50 characters" });
    }
    
    const updateData = {};
    if (productName) updateData.productName = productName.trim();
    if (details !== undefined) updateData.details = details.trim();
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (location) updateData.location = location.trim();
    if (available !== undefined) updateData.available = !!available;

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("Product updated:", product._id);
    res.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: error.message || "Failed to update product" });
  }
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("Product deleted:", product._id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: error.message || "Failed to delete product" });
  }
});

const PORT = process.env.PORT || 5000;

async function start() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medstore";
  try {
    await mongoose.connect(uri);
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection error:", err && err.message ? err.message : err);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

start();
