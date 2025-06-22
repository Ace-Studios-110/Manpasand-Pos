export const generateOTP = (length = 6): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const formatPhoneNumber = (phone: string): string => {
  // Implement phone number formatting logic for your region
  return phone.replace(/\D/g, '');
};
