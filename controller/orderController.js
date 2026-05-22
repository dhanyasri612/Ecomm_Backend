import HandleError from "../helper/handleError.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

export const createOrder = async (req, res, next) => {
  const {
    shippingAddress,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingAddress,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });
  res.status(201).json({
    success: true,
    order,
  });
};

// Razorpay/demo removed: payment handled via createOrder for demo flows.

export const getOrderDetails = async (req, res, next) => {
  const id = req.params.id;
  const order = await Order.findById(id).populate("user", "name email");
  if (!order) {
    return next(new HandleError("Order not found", 400));
  }
  res.status(200).json({
    success: true,
    order,
  });
};

//get all order details
export const getAllOrders = async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });
  if (!orders) {
    return next(new HandleError("Oredr not found", 404));
  }
  res.status(200).json({
    success: true,
    orders,
  });
};

//admin views all orders
export const getAllOrdersByAdmin = async (req, res, next) => {
  const orders = await Order.find();
  if (!orders) {
    return next(new HandleError("Oredr not found", 404));
  }
  let totAmount = 0;
  orders.forEach((order) => {
    totAmount += order.totalPrice;
  });
  res.status(200).json({
    success: true,
    orders,
    totAmount,
  });
};

//Delete orders
export const deleteOrders = async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new HandleError("Order not found", 404));
  }
  if (order.orderStatus !== "Delivered") {
    return next(
      new HandleError("Order is under processing cannot be deleted", 404),
    );
  }
  await Order.deleteOne({ _id: req.params.id });
  res.status(200).json({
    success: true,
    message: "Order Deleted successfully",
  });
};

//Admin order controller
export const updateOrderStatus = async (req, res, next) => {
  const id = req.params.id;
  const order = await Order.findById(id);
  if (!order) {
    return next(new HandleError("No such order", 400));
  }
  if (order.orderStatus === "Delivered") {
    return next(new HandleError("This order is already delivered", 400));
  }

  //Stock update
  await Promise.all(
    order.orderItems.map((item) => updateQuantity(item.product, item.quantity)),
  );
  order.orderStatus = req.body.status;
  if (order.orderStatus === "Delivered") {
    order.deliverAt = Date.now();
  }
  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
    order,
  });
};

async function updateQuantity(id, quantity) {
  const product = await Product.findById(id);
  if (!product) {
    throw new Error("Product not found");
  }
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}
