import { Request, Response } from "express";
import asyncHandler from "../../middleware/asyncHandler";
import { ApiResponse } from "../../utils/apiResponse";
import CustomerService from "../../services/user/customer.service";

const customerService = new CustomerService();

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.createCustomer(req.body);
    new ApiResponse(customer, 'Customer successfully created', 200).send(res);
});

export const getCustomerById = asyncHandler(async (req: Request, res: Response) => {
    const customer = await customerService.getCustomerById(req.params.customerId);
    new ApiResponse(customer, 'Customer fetched').send(res);
});

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
    const customers = await customerService.getCustomers(req.query.search as string | undefined);
    new ApiResponse(customers, 'Customers fetched').send(res);
});