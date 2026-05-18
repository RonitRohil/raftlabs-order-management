const { Router } = require("express");
const menuController = require("../controllers/menuController");
const orderController = require("../controllers/orderController");
const validate = require("../middleware/validate");
const { PlaceOrderSchema } = require("../validations/orderValidations");

const router = Router();

router.get("/menu", menuController.getAllMenuItems);
router.post("/orders", validate(PlaceOrderSchema), orderController.placeOrder);
router.get("/orders/:id", orderController.getOrderById);
router.patch("/orders/:id/status", orderController.updateOrderStatus);
router.get("/orders/:id/stream", orderController.streamOrderStatus);

module.exports = router;
