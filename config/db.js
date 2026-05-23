import mongoose from "mongoose";

export const connectDB = () => {
  if (!process.env.DB_URL) {
    throw new Error(
      "DB_URL is not defined. Check backend/config/.env loading.",
    );
  }

  mongoose
    .connect(process.env.DB_URL)
    .then((data) => {
      console.log("MongoDB connected with server ", data.connection.host);
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err.message);
      process.exit(1);
    });
};
