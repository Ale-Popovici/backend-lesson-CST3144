// routes/order.routes.js
const express = require("express");
const router = express.Router();
const { getOrders, createOrder } = require("../controllers/order.controller");

router.route("/").get(getOrders).post(createOrder);

module.exports = router;
