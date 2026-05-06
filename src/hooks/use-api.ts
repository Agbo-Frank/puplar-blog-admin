import useSWR, { type SWRConfiguration } from "swr";
import { del, fetcher, get, patch, post, put } from "@/api/fetcher";
import useSWRMutation from "swr/mutation";
import { useSWRConfig } from "swr";
import type { ApiError, ApiResponse } from "@/api/types";
import { cleanPayload, replacePathParams } from "@/utils";
import { toast } from "sonner";
import type { FormikProps } from "formik";

export interface UseApiOptions {
  pathParams?: Record<string, string | number>;
  skipErrorHandling?: boolean;
  onError?: (error: ApiError) => void;
  onSuccess?: (data: ApiResponse<unknown>) => void;
}

type Method = "POST" | "PUT" | "PATCH" | "DELETE" | "GET";

export function useApi<T>(
  endpoint: string | null,
  options: UseApiOptions & SWRConfiguration<ApiResponse<T>, ApiError> = {}
) {
  const {
    pathParams,
    skipErrorHandling = false,
    onError,
    onSuccess,
    ...swrConfig
  } = options;

  const resolvedEndpoint =
    endpoint != null && pathParams != null
      ? replacePathParams(endpoint, pathParams)
      : endpoint;

  const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<T>, ApiError>(
    resolvedEndpoint,
    (url) => fetcher<T>(url),
    {
      ...swrConfig,
      onError: (err) => {
        if (!skipErrorHandling) toast.error(err.message);
        onError?.(err);
      },
      onSuccess: (data) => {
        onSuccess?.(data as ApiResponse<unknown>);
      },
    }
  );

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

export interface UseMutationOptions<TResponse> {
  method?: Method;
  skipErrorHandling?: boolean;
  formik?: FormikProps<any> | null;
  onSuccess?: (data: ApiResponse<TResponse>) => void;
  onError?: (error: ApiError) => void;
  invalidate?: string[];
}

interface TriggerArg<TRequest> {
  data?: TRequest;
  pathParams?: Record<string, string | number>;
}

export function useMutation<TResponse = unknown, TRequest = unknown>(
  endpoint: string,
  options: UseMutationOptions<TResponse> = {}
) {
  const {
    method = "POST",
    formik = null,
    skipErrorHandling = false,
    onSuccess,
    onError,
    invalidate = [],
  } = options;
  const { mutate: globalMutate } = useSWRConfig();

  const fetcherFn = async (
    _key: string,
    { arg }: { arg: TriggerArg<TRequest> }
  ): Promise<ApiResponse<TResponse>> => {
    const url =
      arg.pathParams != null
        ? replacePathParams(endpoint, arg.pathParams)
        : endpoint;

    const cleaned = arg.data != null ? cleanPayload(arg.data) : undefined;

    switch (method.toUpperCase()) {
      case "PUT":
        return put<TResponse, TRequest>(url, cleaned as TRequest);
      case "PATCH":
        return patch<TResponse, TRequest>(url, cleaned as TRequest);
      case "DELETE":
        return del<TResponse>(url);
      case "GET":
        return get<TResponse>(url);
      default:
        return post<TResponse, TRequest>(url, cleaned as TRequest);
    }
  };

  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    endpoint,
    fetcherFn,
    {
      throwOnError: false,
      onSuccess: (data) => {
        invalidate.forEach((key) => globalMutate(key));
        onSuccess?.(data);
      },
      onError: (err: ApiError) => {
        if (err.errors?.length && formik) {
          err.errors.forEach((e) => {
            const raw = (e.path ?? e.param) ?? "form";
            const field = raw.replace(/^body\./, "");
            const msg = e.message ?? e.msg ?? err.message;
            formik?.setFieldError(field, msg);
          });
          if (err.message) toast.error(err.message);
          return;
        }

        if (!skipErrorHandling) toast.error(err.message);
        onError?.(err);
      },
    }
  );

  const triggerWithOptions = async (
    data?: TRequest,
    pathParams?: Record<string, string | number>
  ) => {
    try {
      const result = await trigger({ data, pathParams });
      return result;
    } catch (e) {
      if (skipErrorHandling) throw e;
      return undefined;
    }
  };

  return {
    trigger: triggerWithOptions,
    data,
    error,
    isLoading: isMutating,
    reset,
  };
}
