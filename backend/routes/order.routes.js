// routes/order.routes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

// POST create order
router.post("/", orderController.createOrder);

// GET all orders
router.get("/", orderController.getOrders);

// GET order by ID
router.get("/:id", orderController.getOrderById);

// DELETE order
router.delete("/:id", orderController.deleteOrder);

module.exports = router;
