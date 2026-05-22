import express from "express";
import {
  addProducts,
  adminDeleteReview,
  createProductReview,
  deleteProduct,
  getAllProducts,
  getAllProductsByAdmin,
  getSingleProduct,
  productReviews,
  uploadProductImages,
  updateProduct,
} from "../controller/productController.js";
import { verifyUser, roleBasedAccess } from "../helper/userAuth.js";

const router = express.Router();

//User
router.route("/products").get(getAllProducts);
router
  .route("/admin/product/create")
  .post(verifyUser, roleBasedAccess("admin"), addProducts);
router.route("/product/:id").get(getSingleProduct);
//router.get("/product/:id",getSingleProduct);

//UserReview
router.route("/review").put(verifyUser, createProductReview);

// Admin image upload
router
  .route("/admin/upload")
  .post(verifyUser, roleBasedAccess("admin"), uploadProductImages);

//Admin
router
  .route("/product/:id")
  .put(verifyUser, roleBasedAccess("admin"), updateProduct)
  .delete(verifyUser, roleBasedAccess("admin"), deleteProduct);

//Admin view All products
router
  .route("/admin/viewProducts")
  .get(verifyUser, roleBasedAccess("admin"), getAllProductsByAdmin);
//View review
router
  .route("/admin/reviews")
  .get(verifyUser, roleBasedAccess("admin"), productReviews)
  //Delete review
  .delete(verifyUser, roleBasedAccess("admin"), adminDeleteReview);

export default router;
