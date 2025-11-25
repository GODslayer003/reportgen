// server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import reportRoutes from "./routes/report.js";

dotenv.config();

const app = express();

// ******** IMPORTANT ********
app.use(cors());
app.use(express.json());  // <-- Without this req.body will be empty!!
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("API is running...");
});

// DB CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("DB Error:", err));
