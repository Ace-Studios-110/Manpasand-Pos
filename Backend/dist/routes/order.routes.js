"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/user/order.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const order_validation_1 = require("../validations/order.validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/", (0, validation_middleware_1.validate)(order_validation_1.createOrderSchema), order_controller_1.createOrder);
router.delete("/:orderId", order_controller_1.cancelOrder);
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']));
router.get("/", order_controller_1.getOrders);
router.get("/:orderId", order_controller_1.getOrder);
router.patch("/:orderId/status", (0, validation_middleware_1.validate)(order_validation_1.updateOrderStatusSchema), order_controller_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=order.routes.js.map