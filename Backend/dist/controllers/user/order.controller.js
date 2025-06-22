"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrder = exports.updateOrderStatus = exports.getOrder = exports.getOrders = exports.createOrder = void 0;
const order_service_1 = require("../../services/user/order.service");
const apiResponse_1 = require("../../utils/apiResponse");
const asyncHandler_1 = __importDefault(require("../../middleware/asyncHandler"));
const orderService = new order_service_1.OrderService();
const createOrder = (0, asyncHandler_1.default)(async (req, res) => {
    const order = await orderService.createOrder(req.body);
    new apiResponse_1.ApiResponse(order, 'Order created successfully', 201).send(res);
});
exports.createOrder = createOrder;
const getOrders = (0, asyncHandler_1.default)(async (req, res) => {
    const { status } = req.query;
    const orders = await orderService.getUserOrders("1", status);
    new apiResponse_1.ApiResponse(orders, 'Orders retrieved successfully').send(res);
});
exports.getOrders = getOrders;
const getOrder = (0, asyncHandler_1.default)(async (req, res) => {
    const order = await orderService.getUserOrder("1", req.params.id);
    new apiResponse_1.ApiResponse(order, 'Order retrieved successfully').send(res);
});
exports.getOrder = getOrder;
const updateOrderStatus = (0, asyncHandler_1.default)(async (req, res) => {
    const order = await orderService.updateOrderStatus(req.params.orderId, req.body.status);
    new apiResponse_1.ApiResponse(order, 'Order status updated successfully').send(res);
});
exports.updateOrderStatus = updateOrderStatus;
const cancelOrder = (0, asyncHandler_1.default)(async (req, res) => {
    const order = await orderService.cancelOrder(req.params.orderId);
    new apiResponse_1.ApiResponse(order, 'Order cancelled successfully').send(res);
});
exports.cancelOrder = cancelOrder;
//# sourceMappingURL=order.controller.js.map