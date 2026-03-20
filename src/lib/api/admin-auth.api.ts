import { apiRequest } from "./request";

export const adminAuthApi = {
  login: async (payload: { email: string; password: string }) => {
    // Step 1: accept email + password, trigger OTP.
    return apiRequest.post("/admin/auth/login", payload);
  },

  verifyOtp: async (payload: { email: string; otp: string }) => {
    // Step 2: accept email + otp, return admin tokens.
    return apiRequest.post("/admin/auth/verify-otp", payload);
  },
};

export default adminAuthApi;

