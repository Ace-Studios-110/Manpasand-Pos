import { z } from "zod";

const customerLoginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
    }),
});

export {
    customerLoginSchema
}