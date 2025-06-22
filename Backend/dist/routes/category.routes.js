"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../controllers/admin/category.controller");
const category_validation_1 = require("../validations/category.validation");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['ADMIN']));
router.post('/', (0, validation_middleware_1.validate)(category_validation_1.createCategorySchema), category_controller_1.createCategory);
router.get('/', (0, validation_middleware_1.validate)(category_validation_1.listCategoriesSchema), category_controller_1.listCategories);
router.get('/:id', (0, validation_middleware_1.validate)(category_validation_1.getCategorySchema), category_controller_1.getCategory);
router.patch('/:id', (0, validation_middleware_1.validate)(category_validation_1.updateCategorySchema), category_controller_1.updateCategory);
router.patch('/:id/toggle-status', (0, validation_middleware_1.validate)(category_validation_1.getCategorySchema), category_controller_1.toggleCategoryStatus);
exports.default = router;
//# sourceMappingURL=category.routes.js.map