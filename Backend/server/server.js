import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/report.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://report-generator-ritn.onrender.com"
  ],
  credentials: true,
  allowedHeaders: ["Authorization", "Content-Type"],
  methods: "GET,POST,PUT,DELETE,OPTIONS"
}));

app.options("*", cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 404 Handler - Fixed
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// Database and server
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});