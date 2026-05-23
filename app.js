import express from "express";
import product from "./routes/productRoutes.js";
import errorHandler from "./middleware/error.js";
import user from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import order from "./routes/orderRoutes.js";
import fileupload from "express-fileupload";
import cors from "cors";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_URLS?.split(",").map((url) => url.trim()) ?? []),
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

app.use(express.json());
app.use(cookieParser());
app.use(fileupload());
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  }),
);

app.use("/api/v1", product);
app.use("/api/v1", order);
app.use("/api/v1", user);

app.use(errorHandler);

export default app;
