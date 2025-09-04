import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

// Routes imports //
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import adminRoutes from "./routes/adminRoutes";

import { cleanupExpiredReservations } from "./cleanup";

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Main route
app.get("/", (req, res) => {
  res.send("Inventory + Order Engine API is running!");
});
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully.");

    setInterval(cleanupExpiredReservations, 6000);

    console.log("Expired reservation cleanup task started.");

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
