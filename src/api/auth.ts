import { coreApi, setTokens, clearTokens } from "./axios";
import type { LoginResponse, User } from "@/types";

export const login = async (
  phone: string,
  password: string
): Promise<LoginResponse> => {
  const response = await coreApi.post("/auth/login/", { phone, password });
  const { access, refresh, user } = response.data;
  setTokens(access, refresh);
  return { access, refresh, user };
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<string> => {
  const response = await coreApi.post("/auth/refresh/", {
    refresh: refreshToken,
  });
  return response.data.access;
};

export const logout = () => {
  clearTokens();
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await coreApi.get("/auth/me/");
  return response.data;
};
