"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_controller_1 = require("../controllers/user/customer.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const customer_validation_1 = require("../validations/customer.validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post('/', (0, validation_middleware_1.validate)(customer_validation_1.customerLoginSchema), customer_controller_1.createCustomer);
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']));
router.get('/', customer_controller_1.getCustomers);
router.get('/:customerId', customer_controller_1.getCustomerById);
exports.default = router;
//# sourceMappingURL=customer.routes.js.map