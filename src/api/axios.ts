import axios from "axios";

// Memory storage for tokens
export const getAccessToken = () => localStorage.getItem("accessToken");
export const getRefreshToken = () => localStorage.getItem("refreshToken");

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// Core API instance (api.sbs-brokerz.com)
export const coreApi = axios.create({
  baseURL: "https://api.sbs-brokerz.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptor to core API
coreApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
coreApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post(
            "https://api.sbs-brokerz.com/api/v1/auth/refresh/",
            {
              refresh: refreshToken,
            }
          );

          const { access, refresh } = response.data;

          setTokens(access, refresh);

          originalRequest.headers.Authorization = `Bearer ${access}`;

          return coreApi(originalRequest);
        } catch (refreshError) {
          clearTokens();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        clearTokens();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
