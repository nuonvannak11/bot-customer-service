import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { eLog } from "./lib";

export type QueryParams = Record<string, unknown>;

export interface RequestBaseOptions {
  url: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface RequestGetOptions<TParams = QueryParams>
  extends RequestBaseOptions {
  params?: TParams;
}

export interface RequestWriteOptions<TData = unknown>
  extends RequestBaseOptions {
  data?: TData;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const api: AxiosInstance = axios.create({
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    eLog("API Response Error:", error?.message);
    return Promise.reject(error);
  }
);

async function handleRequest<TResponse>(
  config: AxiosRequestConfig
): Promise<ApiResult<TResponse>> {
  try {
    const res = await api.request<TResponse>(config);
    return { success: true, data: res.data };
  } catch (err: unknown) {
    let errorMessage = "Request failed";
    if (axios.isAxiosError(err)) {
      errorMessage = err.response?.data?.message || err.message || errorMessage;
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function request_get<
  TResponse = unknown,
  TParams = QueryParams
>(options: RequestGetOptions<TParams>) {
  return handleRequest<TResponse>({
    method: "GET",
    url: options.url,
    params: options.params,
    headers: options.headers,
    timeout: options.timeout,
  });
}

export async function request_post<
  TResponse = unknown,
  TData = unknown
>(options: RequestWriteOptions<TData>) {
  return handleRequest<TResponse>({
    method: "POST",
    url: options.url,
    data: options.data,
    headers: options.headers,
    timeout: options.timeout,
  });
}

export async function request_patch<
  TResponse = unknown,
  TData = unknown
>(options: RequestWriteOptions<TData>) {
  return handleRequest<TResponse>({
    method: "PATCH",
    url: options.url,
    data: options.data,
    headers: options.headers,
    timeout: options.timeout,
  });
}

export async function request_delete<
  TResponse = unknown,
  TParams = QueryParams
>(options: RequestGetOptions<TParams>) {
  return handleRequest<TResponse>({
    method: "DELETE",
    url: options.url,
    params: options.params,
    headers: options.headers,
    timeout: options.timeout,
  });
}