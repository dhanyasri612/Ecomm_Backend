import express from "express";
import product from "./routes/productRoutes.js";
import errorHandler from "./middleware/error.js";
import user from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import order from "./routes/orderRoutes.js";
import fileupload from "express-fileupload";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(fileupload());

app.use("/api/v1", product);
app.use("/api/v1", order);
app.use("/api/v1", user);

app.use(errorHandler);

export default app;
