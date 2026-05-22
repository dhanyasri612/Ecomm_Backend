import Product from "../models/productModel.js";
import { v2 as cloudinary } from "cloudinary";
import errorHandler from "../helper/handleError.js";
import APIHelper from "../helper/APIHelper.js";
import HandleError from "../helper/handleError.js";

//Create product
export const addProducts = async (req, res) => {
  console.log(req.body);
  req.body.user = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({
    message: "Product added successfully..",
    success: true,
    product,
  });
};

//Getting all products
export const getAllProducts = async (req, res, next) => {
  //console.log("Getting all Products....");
  //const products = await Product.find();
  const resultsPerPage = 6;
  const apiHelper = new APIHelper(Product.find(), req.query).search().filter();
  //console.log(apiHelper);
  const filteredQuery = apiHelper.query.clone();
  const productCounts = await filteredQuery.countDocuments();
  const totalPages = Math.ceil(productCounts / resultsPerPage);
  const page = Number(req.query.page) || 1;
  if (totalPages > 0 && page > totalPages) {
    return next(new errorHandler("Page does not exist", 404));
  }
  apiHelper.pagination(resultsPerPage);

  const products = await apiHelper.query;
  res.status(200).json({
    success: true,
    products,
    productCounts,
    resultsPerPage,
    totalPages,
    currentPage: page,
  });
};

//Getting single product
export const getSingleProduct = async (req, res, next) => {
  //console.log(req.params.id);
  const id = req.params.id;
  const product = await Product.findById(id);
  if (!product) {
    return next(new errorHandler("Product not found", 404));
  }
  return res.status(200).json({
    success: true,
    product,
  });
};

//Updating product
export const updateProduct = async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    /* return res.status(500).json({
      success: false,
      message: "Product not found",
    }); */
    return next(new errorHandler("Product not found", 404));
  }

  return res.status(200).json({
    success: true,
    product,
  });
};

//Deleting product
export const deleteProduct = async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return next(new errorHandler("Product not found", 404));
  }

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
};

//Reviewing Product
export const createProductReview = async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    avatar: req.user.avatar.url,
    rating: Number(rating),
    comment,
  };
  const product = await Product.findById(productId);
  if (!product) {
    return next(new HandleError("No such product found...", 400));
  }
  const reviewExists = product.reviews.find(
    (review) => review.user.toString() === req.user.id,
  );
  if (reviewExists) {
    //update reviews
    product.reviews.forEach((review) => {
      if (review.user.toString() == req.user.id) {
        review.rating = rating;
        reviewExists.comment = comment;
      }
    });
  } else {
    //Pudh reviews
    product.reviews.push(review);
  }

  product.numOfReviews = product.reviews.length;

  //update rating
  let sum = 0;
  product.reviews.forEach((review) => {
    sum += review.rating;
  });

  product.ratings =
    product.reviews.length > 0 ? sum / product.reviews.length : 0;

  await product.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    product,
  });
};

// Upload product images (admin)
export const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const files = Array.isArray(req.files.images)
      ? req.files.images
      : [req.files.images];

    const uploaded = [];
    for (const file of files) {
      // use Cloudinary uploader (configured in server.js)
      const result = await new Promise((resolve, reject) => {
        // file.tempFilePath is available because express-fileupload was used with default tempFile
        // but to be safe, use data buffer
        const stream = cloudinary.uploader.upload_stream(
          { folder: "shop_products" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        stream.end(file.data);
      });
      uploaded.push({ public_id: result.public_id, url: result.secure_url });
    }

    return res.status(200).json({ success: true, images: uploaded });
  } catch (err) {
    next(err);
  }
};

export const productReviews = async (req, res, next) => {
  const product = await Product.findById(req.query.pid);
  if (!product) {
    return next(new HandleError("No such product", 400));
  }
  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
};

export const getAllProductsByAdmin = async (req, res) => {
  const products = await Product.find();
  res.status(200).json({
    success: true,
    products,
  });
};

export const adminDeleteReview = async (req, res, next) => {
  const product = await Product.findById(req.query.pid);
  if (!product) {
    return next(new HandleError("No such product", 400));
  }
  const reviews = product.reviews.filter((review) => {
    review._id.toString() !== req.query.id.toString();
  });
  let sum = 0;
  reviews.forEach((review) => {
    sum += review.rating;
  });
  const ratings = reviews.length > 0 ? sum / reviews.length : 0;
  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.pid,
    { reviews, ratings, numOfReviews },
    { new: true, runValidators: true },
  );

  res.status(200).json({
    success: true,
    message: "Review deleted successsfully",
  });
};
