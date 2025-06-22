import { Request, Response } from 'express';
import { OrderService } from '../../services/user/order.service';
import { ApiResponse } from '../../utils/apiResponse';
import asyncHandler from '../../middleware/asyncHandler';

const orderService = new OrderService();

const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.body);
  new ApiResponse(order, 'Order created successfully', 201).send(res);
});

const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const orders = await orderService.getUserOrders("1", status as string | undefined);
  new ApiResponse(orders, 'Orders retrieved successfully').send(res);
});

const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getUserOrder("1", req.params.id);
  new ApiResponse(order, 'Order retrieved successfully').send(res);
});

const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateOrderStatus(req.params.orderId, req.body.status);
  new ApiResponse(order, 'Order status updated successfully').send(res);
});

const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.cancelOrder(req.params.orderId);
  new ApiResponse(order, 'Order cancelled successfully').send(res);
});

export { createOrder, getOrders, getOrder, updateOrderStatus, cancelOrder };
