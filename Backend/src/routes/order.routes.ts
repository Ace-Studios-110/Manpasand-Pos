import { Router } from "express";
import {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    cancelOrder
} from "../controllers/user/order.controller";
import { validate } from "../middleware/validation.middleware";
import { createOrderSchema, updateOrderStatusSchema } from "../validations/order.validation";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.post("/", validate(createOrderSchema), createOrder);
router.delete("/:orderId", cancelOrder);

router.use(authenticate, authorize(['ADMIN']));

router.get("/", getOrders);
router.get("/:orderId", getOrder);
router.patch("/:orderId/status", validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
