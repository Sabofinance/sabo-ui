import { apiClient } from "../../services/api";

export const accountApi = {
  updateUsername: async (username: string) => {
    return apiClient.put<{ username: string }>("/account/username", { username });
  },

  setTransactionPin: async (pin: string, confirm_pin: string) => {
    return apiClient.post<null>("/account/transaction-pin/set", { pin, confirm_pin });
  },

  verifyTransactionPin: async (pin: string) => {
    return apiClient.post<null>("/account/transaction-pin/verify", { pin });
  },

  initiateEmailChange: async (new_email: string, password: string) => {
    return apiClient.post<null>("/account/email-change/initiate", { new_email, password });
  },

  confirmEmailChange: async (new_email: string, otp: string) => {
    return apiClient.post<null>("/account/email-change/confirm", { new_email, otp });
  },

  initiateAccountDeletion: async (password: string) => {
    return apiClient.post<null>("/account/delete/initiate", { password });
  },

  confirmAccountDeletion: async (password: string, otp: string) => {
    return apiClient.post<null>("/account/delete/confirm", { password, otp });
  },

  updateProfilePicture: async (formData: FormData) => {
    return apiClient.post<null>("/account/profile/picture", formData, {
      headers: { "Content-Type": undefined },
    });
  },
};

