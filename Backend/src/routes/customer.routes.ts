import express from 'express';
import { createCustomer, getCustomerById, getCustomers } from '../controllers/user/customer.controller';
import { validate } from '../middleware/validation.middleware';
import { customerLoginSchema } from '../validations/customer.validation';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();


router.post('/', validate(customerLoginSchema), createCustomer);

router.use(authenticate, authorize(['ADMIN']));
router.get('/', getCustomers);
router.get('/:customerId', getCustomerById);

export default router;