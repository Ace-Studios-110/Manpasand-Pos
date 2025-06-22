import { z } from "zod";

const createStockSchema = z.object({
    body: z.object({
        productId: z.string().min(1),
        branchId: z.string().min(1),
        quantity: z.number().int().min(1),
    }),
});

const adjustStockSchema = z.object({
    body: z.object({
        productId: z.string().min(1),
        branchId: z.string().min(1),
        quantityChange: z.number().int().refine(val => val !== 0, { message: "Quantity change must not be zero" }),
        reason: z.string().optional(),
    }),
});

export { createStockSchema, adjustStockSchema };
