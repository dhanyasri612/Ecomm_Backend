import HandleError from "./handleError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const verifyUser = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new HandleError("Access denied please login to access", 401));
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decodedData);
  req.user = await User.findById(decodedData.id);
  next();
};

export const roleBasedAccess = (...roles) => {
  return (req, res, next) => {
    const allowedRoles = roles.flat();
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new HandleError(
          `Role - ${req.user.role} is not allowed access to access the resource`,
          403,
        ),
      );
    }
    next();
  };
};
