"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const app_1 = require("./config/app");
const error_middleware_1 = require("./middleware/error.middleware");
const not_found_middleware_1 = require("./middleware/not-found.middleware");
const db_1 = require("./config/db");
const redis_1 = require("./config/redis");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const subcategory_routes_1 = __importDefault(require("./routes/subcategory.routes"));
const branch_routes_1 = __importDefault(require("./routes/branch.routes"));
const color_routes_1 = __importDefault(require("./routes/color.routes"));
const size_routes_1 = __importDefault(require("./routes/size.routes"));
const unit_routes_1 = __importDefault(require("./routes/unit.routes"));
const supplier_routes_1 = __importDefault(require("./routes/supplier.routes"));
const tax_routes_1 = __importDefault(require("./routes/tax.routes"));
const brand_routes_1 = __importDefault(require("./routes/brand.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const stock_routes_1 = __importDefault(require("./routes/stock.routes"));
const sale_routes_1 = __importDefault(require("./routes/sale.routes"));
const app_routes_1 = __importDefault(require("./routes/app.routes"));
const customer_routes_1 = __importDefault(require("./routes/customer.routes"));
const device_identity_routes_1 = __importDefault(require("./routes/device_identity.routes"));
const vAPI = process.env.vAPI || '/api/v1';
const app = (0, express_1.default)();
(0, db_1.connectDB)();
(0, redis_1.connectRedis)();
// Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use(`${vAPI}/auth`, auth_routes_1.default);
app.use(`${vAPI}/categories`, category_routes_1.default);
app.use(`${vAPI}/subcategories`, subcategory_routes_1.default);
app.use(`${vAPI}/branches`, branch_routes_1.default);
app.use(`${vAPI}/colors`, color_routes_1.default);
app.use(`${vAPI}/sizes`, size_routes_1.default);
app.use(`${vAPI}/units`, unit_routes_1.default);
app.use(`${vAPI}/suppliers`, supplier_routes_1.default);
app.use(`${vAPI}/taxes`, tax_routes_1.default);
app.use(`${vAPI}/brands`, brand_routes_1.default);
app.use(`${vAPI}/products`, product_routes_1.default);
app.use(`${vAPI}/order`, order_routes_1.default);
app.use(`${vAPI}/sale`, sale_routes_1.default);
app.use(`${vAPI}/stock`, stock_routes_1.default);
// App Routes
app.use(`${vAPI}/user/app`, app_routes_1.default);
app.use(`${vAPI}/user/customer`, customer_routes_1.default);
app.use(`${vAPI}/user/device-identity`, device_identity_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});
// Error handling
app.use(error_middleware_1.errorHandler);
app.use(not_found_middleware_1.notFoundHandler);
// Start server
app.listen(app_1.config.port, () => {
    console.log(`Server running on port ${app_1.config.port}`);
});
//# sourceMappingURL=index.js.map