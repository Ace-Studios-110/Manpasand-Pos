"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerLoginSchema = void 0;
const zod_1 = require("zod");
const customerLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
    }),
});
exports.customerLoginSchema = customerLoginSchema;
//# sourceMappingURL=customer.validation.js.map