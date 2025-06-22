"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../../config/db");
const apiError_1 = require("../../utils/apiError");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const convertToSeconds_1 = require("../../utils/convertToSeconds");
const app_1 = require("../../config/app");
class CustomerService {
    generateToken(cusId, email) {
        const token = jsonwebtoken_1.default.sign({
            email: email,
            id: cusId
        }, app_1.config.jwtSecret, {
            expiresIn: typeof app_1.config.jwtExpiresIn === 'string'
                ? (0, convertToSeconds_1.convertToSeconds)(app_1.config.jwtExpiresIn)
                : app_1.config.jwtExpiresIn,
        });
        return token;
    }
    async verifyCustomerExistance(email) {
        const customer = await db_1.prisma.customer.findFirst({
            where: {
                email: email,
            },
        });
        if (customer)
            return true;
        return false;
    }
    async createCustomer(data) {
        const customerExists = await this.verifyCustomerExistance(data.email);
        if (customerExists) {
            throw new apiError_1.AppError(400, 'Customer already exists');
        }
        const customer = await db_1.prisma.customer.create({
            data: data,
        });
        const token = this.generateToken(customer.id, customer.email);
        return {
            email: customer.email,
            token,
        };
    }
    async getCustomerById(customerId) {
        const customer = await db_1.prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!customer) {
            throw new apiError_1.AppError(404, 'Customer not found');
        }
        return customer;
    }
    async getCustomers(search) {
        return db_1.prisma.customer.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { phone_number: { contains: search } },
                    ],
                }
                : undefined,
            orderBy: { created_at: 'desc' },
        });
    }
}
exports.default = CustomerService;
//# sourceMappingURL=customer.service.js.map