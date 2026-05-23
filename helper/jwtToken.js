export const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();
  const isProduction = process.env.NODE_ENV === "production";
  const options = {
    expires: new Date(
      Date.now() + process.env.EXPIRE_COOKIE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    ...(isProduction && { secure: true, sameSite: "none" }),
  };
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user,
    token,
  });
};
