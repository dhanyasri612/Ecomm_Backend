import express from "express";
import {
  registerUser,
  userLogin,
  logout,
  forgetPassword,
  resetPassword,
  profile,
  updatePassword,
  updateProfile,
  getUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
} from "../controller/userController.js";
import { verifyUser, roleBasedAccess } from "../helper/userAuth.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(userLogin);
router.route("/logout").get(logout);
router.route("/password/forget").post(forgetPassword);
router.route("/reset/:token").post(resetPassword);
router.route("/profile").get(verifyUser, profile);
router.route("/update/password").put(verifyUser, updatePassword);
router.route("/update/profile").put(verifyUser, updateProfile);

router
  .route("/admin/users")
  .get(verifyUser, roleBasedAccess("admin"), getUsers);

router
  .route("/admin/user/:id")
  .get(verifyUser, roleBasedAccess("admin"), getSingleUser)
  .put(verifyUser, roleBasedAccess("admin"), updateUserRole)
  .delete(verifyUser, roleBasedAccess("admin"), deleteUser);

export default router;
