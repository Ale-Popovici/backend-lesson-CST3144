// routes/order.routes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

// POST create order
router.post("/", orderController.createOrder);

// GET all orders
router.get("/", orderController.getOrders);

module.exports = router;
