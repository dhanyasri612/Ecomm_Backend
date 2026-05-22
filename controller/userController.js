import HandleError from "../helper/handleError.js";
import { sendToken } from "../helper/jwtToken.js";
import User from "../models/userModel.js";
import { sendEmail } from "../helper/sendEmail.js";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

export const registerUser = async (req, res, next) => {
  //console.log(req.body);
  const { name, email, password, avatar } = req.body;
  if (!name || !email || !password) {
    next(new HandleError("Name ,Email Or password cannot be empty", 400));
  }

  const myCloud = await cloudinary.uploader.upload(avatar, {
    folder: "E-Commerce",
    width: 150,
    crop: "scale",
  });
  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  /* const token = user.getJwtToken();
  res.status(201).json({
    success: true,
    user,
    token,
  }); */
  sendToken(user, 201, res);
};

export const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new HandleError("Email or password can't be empty", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new HandleError("Invalid email or password", 401));
  }
  const isValidPassword = await user.verifyPassword(password);
  if (!isValidPassword) {
    return next(new HandleError("Wrong password", 400));
  }
  /* const token = user.getJwtToken();
  res.json({ success: true, user, token }); */
  sendToken(user, 201, res);
};

export const logout = async (req, res, next) => {
  const options = {
    expires: new Date(Date.now()),
    httpOnly: true,
  };
  res.cookie("token", null, options);
  res.status(200).json({ success: true, message: "Successfully logged out." });
};

//Reset password
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new HandleError("User not found", 400));
  }
  let resetToken;
  try {
    resetToken = user.createPasswordResetToken();
    await user.save();
    console.log(resetToken);
  } catch (error) {
    console.log(error);
    return next(
      new HandleError("Could not save reset Token,Try again later", 500),
    );
  }
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetPasswordURL = `${frontendURL}/reset/${resetToken}`;
  const message = `Reset your password using the below url:\n${resetPasswordURL}\n\n The Reset link will expires in 30 minutes.\n\n If this wasn't you , igonre this message`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset request",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email is sent to ${user.email} successfully`,
    });
  } catch (error) {
    console.error("Password reset email failed:", error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new HandleError(
        error?.message || "Email couldn't be sent. Try again later.",
        500,
      ),
    );
  }
};

export const resetPassword = async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new HandleError("Invalid or reset code expired", 400));
  }

  const { password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return next(new HandleError("Password mismatch", 400));
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
};

export const profile = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
};

export const updatePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const user = await User.findById(req.user.id).select("+password");
  const isCorrect = await user.verifyPassword(oldPassword);
  if (!isCorrect) {
    return next(new HandleError("Old password is incorrect", 400));
  }
  if (newPassword !== confirmPassword) {
    return next(new HandleError("Confirm password must be new password", 400));
  }
  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
};

export const updateProfile = async (req, res, next) => {
  const { name, email, avatar } = req.body;
  const updatedUserDetails = { name, email };
  if (avatar && avatar !== "") {
    const user = await User.findById(req.user.id);
    const image_id = user.avatar?.public_id;
    if (image_id) {
      await cloudinary.uploader.destroy(image_id);
    }
    const myCloud = await cloudinary.uploader.upload(avatar, {
      folder: "E-Commerce",
      width: 150,
      crop: "scale",
    });
    updatedUserDetails.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }
  const user = await User.findByIdAndUpdate(req.user.id, updatedUserDetails, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    message: "profile updated successfully",
    user,
  });
};

export const getUsers = async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
};

export const getSingleUser = async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return next(new HandleError("No such User found", 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
};

export const updateUserRole = async (req, res, next) => {
  const { role } = req.body;
  const id = req.params.id;
  const updatedRole = { role };
  const user = await User.findByIdAndUpdate(id, updatedRole, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new HandleError("No such User found", 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
};

export const deleteUser = async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    return next(new HandleError("No such User found", 400));
  }
  await User.findByIdAndDelete(id);
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
};
