"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatPhoneNumber = exports.generateOTP = void 0;
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
};
exports.generateOTP = generateOTP;
const formatPhoneNumber = (phone) => {
    // Implement phone number formatting logic for your region
    return phone.replace(/\D/g, '');
};
exports.formatPhoneNumber = formatPhoneNumber;
//# sourceMappingURL=helpers.js.map