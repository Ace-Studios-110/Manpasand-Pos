"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    data;
    message;
    statusCode;
    success;
    constructor(data, message, statusCode = 200, success = true) {
        this.data = data;
        this.message = message;
        this.statusCode = statusCode;
        this.success = success;
    }
    send(res) {
        return res.status(this.statusCode).json({
            success: this.success,
            message: this.message,
            data: this.data,
        });
    }
}
exports.ApiResponse = ApiResponse;
//# sourceMappingURL=apiResponse.js.map