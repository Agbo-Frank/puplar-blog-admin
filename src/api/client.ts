import axios, { type AxiosError } from "axios";
import type { ApiError, ApiResponse, IAuth, RequestOptions } from "./types";
import { STORAGE_KEYS } from "@/utils/constant";
import { parseJson } from "@/utils";
import { endpoints } from "./endpoints";
import dayjs from "dayjs";

const baseURL     = import.meta.env.VITE_API_BASE_URL;
const authBaseURL = import.meta.env.VITE_AUTH_API_BASE_URL;

const requestHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

const client = axios.create({ baseURL, headers: requestHeaders });

const authClient = axios.create({ baseURL: authBaseURL, headers: requestHeaders });

function getToken(): IAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (!raw) return null;
    return parseJson<IAuth>(raw);
  } catch {
    return null;
  }
}

function normalizeError(error: AxiosError): ApiError {
  const status = error.response?.status;
  const body   = error.response?.data as ApiError | undefined;

  return {
    message: body?.message ?? error.message ?? "Request failed",
    status,
    errors: body?.errors,
    data:   body?.data,
  };
}

function isRefreshTokenExpired(auth: IAuth | null): boolean {
  if (!auth?.refresh_token_expires_at) return true;
  const expiresAt = dayjs(auth.refresh_token_expires_at);
  return !expiresAt.isValid() || expiresAt.isBefore(dayjs());
}

client.interceptors.request.use((config) => {
  const options = config as RequestOptions;
  if (options.skipAuth) return config;

  const token = getToken();
  if (token) {
    if (isRefreshTokenExpired(token)) {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
      window.location.replace("/login");
      return Promise.reject(new Error("Session expired"));
    }
    config.headers.Authorization = `Bearer ${token.access_token}`;
  }

  // Let the browser set Content-Type (with boundary) for multipart uploads
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config   = error.config;
    const apiError = normalizeError(error);

    const retried = (config as RequestOptions & { _retriedAfterRefresh?: boolean })._retriedAfterRefresh;

    if (error.response?.status === 401 && config && !retried) {
      const auth = getToken();

      if (isRefreshTokenExpired(auth)) {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        window.location.replace("/login");
        return Promise.reject(apiError);
      }

      const refreshToken = auth?.refresh_token;
      if (refreshToken) {
        try {
          const { data } = await authClient.post<ApiResponse<IAuth>>(
            endpoints.refresh,
            { refresh_token: refreshToken }
          );
          if (data?.data) {
            localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(data.data));
            (config as RequestOptions & { _retriedAfterRefresh?: boolean })._retriedAfterRefresh = true;
            return client.request(config);
          }
        } catch {
          // Refresh failed — fall through
        }
      }
    }

    return Promise.reject(apiError);
  }
);

authClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => Promise.reject(normalizeError(error))
);

export { client, authClient };
