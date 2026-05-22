import express from "express";
import { roleBasedAccess, verifyUser } from "../helper/userAuth.js";
import {
  createOrder,
  deleteOrders,
  getAllOrders,
  getAllOrdersByAdmin,
  getOrderDetails,
  updateOrderStatus,
} from "../controller/orderController.js";
const router = express.Router();

router.route("/new/order").post(verifyUser, createOrder);
router.route("/order/:id").get(verifyUser, getOrderDetails);
router.route("/orders/user").get(verifyUser, getAllOrders);

//admin
router
  .route("/admin/orders")
  .get(verifyUser, roleBasedAccess("admin"), getAllOrdersByAdmin);
router
  .route("/admin/order/:id")
  .delete(verifyUser, roleBasedAccess("admin"), deleteOrders)
  .put(verifyUser, roleBasedAccess("admin"), updateOrderStatus);
export default router;
