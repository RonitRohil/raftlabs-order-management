const orderModel = require("../models/orderModel");
const apiResponse = require("../utils/apiResponse");

async function placeOrder(req, res, next) {
  try {
    const response = await orderModel.placeOrder(req.body);
    res.status(response.status_code).json(response);
  } catch (err) {
    next(err);
  }
}

async function getOrderById(req, res, next) {
  try {
    const order_id = parseInt(req.params.id);
    if (isNaN(order_id)) {
      return res.status(400).json(apiResponse(0, 400, "Order id must be a valid number", null));
    }
    const response = await orderModel.getOrderById(order_id);
    res.status(response.status_code).json(response);
  } catch (err) {
    next(err);
  }
}

async function updateOrderStatus(req, res, next) {
  try {
    const order_id = parseInt(req.params.id);
    if (isNaN(order_id)) {
      return res.status(400).json(apiResponse(0, 400, "Order id must be a valid number", null));
    }
    const response = await orderModel.updateOrderStatus(order_id, req.body.status);
    res.status(response.status_code).json(response);
  } catch (err) {
    next(err);
  }
}

async function streamOrderStatus(req, res, next) {
  try {
    const order_id = parseInt(req.params.id);
    if (isNaN(order_id)) {
      return res.status(400).json(apiResponse(0, 400, "Order id must be a valid number", null));
    }

    const order_check = await orderModel.getOrderById(order_id);
    if (!order_check.success) {
      return res.status(order_check.status_code).json(order_check);
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    const statuses = ["ORDER_RECEIVED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

    const send_event = (status) => {
      res.write("data: " + JSON.stringify({ order_id, status }) + "\n\n");
    };

    let current_step = 0;
    send_event(statuses[0]);

    const interval = setInterval(async () => {
      current_step += 1;
      if (current_step >= statuses.length) {
        clearInterval(interval);
        res.end();
        return;
      }

      const status = statuses[current_step];
      await orderModel.updateOrderStatus(order_id, status);
      send_event(status);

      if (status === "DELIVERED") {
        clearInterval(interval);
        setTimeout(() => res.end(), 1000);
      }
    }, 10000);

    req.on("close", () => {
      clearInterval(interval);
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { placeOrder, getOrderById, updateOrderStatus, streamOrderStatus };
