// import express from 'express';
// import 'dotenv/config';
// import cors from 'cors';
// import DB from './config/mongodb.js';
// import purchaseRoutes from "./routes/purchaseRoutes.js";

// const app = express();

// // Middleware
// app.use(cors({
//   origin: 'http://localhost:5173', // Frontend URL
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use("/api/purchases", purchaseRoutes);



// // Health check endpoint
// app.get('/', (req, res) => {
//   res.send("Api is working")
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// const PORT = process.env.PORT || 6768;

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// DB();




import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import DB from './config/mongodb.js';
import purchaseRoutes from "./routes/purchaseRoutes.js";

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/purchases", purchaseRoutes);

// Health check endpoint (for frontend connection check)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send("✅ API is working");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 6768;

// Start server only after DB connects
DB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err.message);
});
