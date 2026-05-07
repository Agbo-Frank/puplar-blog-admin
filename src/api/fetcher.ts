import { client, authClient } from "./client";
import { authEndpoints } from "./endpoints";
import type { ApiResponse, RequestOptions } from "./types";

function getClient(url: string) {
  const isAuthEndpoint = Object
    .values(authEndpoints)
    .some((endpoint) => url.includes(endpoint) || url.endsWith(endpoint));

  return isAuthEndpoint ? authClient : client;
}

export async function fetcher<T>(
  url: string,
  config?: Parameters<typeof client.get>[1]
): Promise<ApiResponse<T>> {
  const c = getClient(url);
  const response = await c.get<ApiResponse<T>>(url, config);
  return response.data;
}

export async function get<T>(url: string, config?: RequestOptions): Promise<ApiResponse<T>> {
  const c = getClient(url);
  const response = await c.get<ApiResponse<T>>(url, config);
  return response.data;
}

export async function post<T, D = unknown>(url: string, data?: D, config?: RequestOptions): Promise<ApiResponse<T>> {
  const c = getClient(url);
  const response = await c.post<ApiResponse<T>>(url, data, config);
  return response.data;
}

export async function put<T, D = unknown>(url: string, data?: D, config?: RequestOptions): Promise<ApiResponse<T>> {
  const c = getClient(url);
  const response = await c.put<ApiResponse<T>>(url, data, config);
  return response.data;
}

export async function patch<T, D = unknown>(url: string, data?: D, config?: RequestOptions): Promise<ApiResponse<T>> {
  const c = getClient(url);
  const response = await c.patch<ApiResponse<T>>(url, data, config);
  return response.data;
}

export async function del<T>(url: string, config?: RequestOptions): Promise<ApiResponse<T>> {
  const c = getClient(url);
  const response = await c.delete<ApiResponse<T>>(url, config);
  return response.data;
}
