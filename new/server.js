import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import DB from "./DB.js"; // MongoDB connection
import purchaseRoutes from "./routes/purchaseRoutes.js"; // your purchase routes


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({credentials: true})); // allow frontend requests
app.use(express.json()); // parse JSON

// Connect to MongoDB
DB();

// Routes
app.use("/api/invoices", purchaseRoutes);


// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
