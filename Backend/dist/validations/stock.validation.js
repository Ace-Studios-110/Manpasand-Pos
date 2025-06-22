"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adjustStockSchema = exports.createStockSchema = void 0;
const zod_1 = require("zod");
const createStockSchema = zod_1.z.object({
    body: zod_1.z.object({
        productId: zod_1.z.string().min(1),
        branchId: zod_1.z.string().min(1),
        quantity: zod_1.z.number().int().min(1),
    }),
});
exports.createStockSchema = createStockSchema;
const adjustStockSchema = zod_1.z.object({
    body: zod_1.z.object({
        productId: zod_1.z.string().min(1),
        branchId: zod_1.z.string().min(1),
        quantityChange: zod_1.z.number().int().refine(val => val !== 0, { message: "Quantity change must not be zero" }),
        reason: zod_1.z.string().optional(),
    }),
});
exports.adjustStockSchema = adjustStockSchema;
//# sourceMappingURL=stock.validation.js.map