import app from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "config/.env") });
const PORT = process.env.PORT || 3000;

/* app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is working right now.",
  });
});
 */

connectDB();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("App is Shutting down,due to uncaught exception.");

  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("App is Shutting down,due to unhadled Rejection.");
  server.close(() => {
    process.exit(1);
  });
});
