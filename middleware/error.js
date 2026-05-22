import HandleError from "../helper/handleError.js";


export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (err.code === 11000) {
    const message = `This email ${Object.values(err.keyValue)} is already registered`;
    err = new HandleError(message, 400);
  }
  
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
