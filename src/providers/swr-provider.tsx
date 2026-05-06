import { fetcher } from "@/api/fetcher";
import type { ApiError } from "@/api/types";
import { SWRConfig } from "swr";

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        revalidateIfStale: true,
        shouldRetryOnError: (error: ApiError) => {
          if (error?.status && error.status >= 400 && error.status < 500) return false;
          return true;
        },
        errorRetryCount: 2,
        errorRetryInterval: 3000,
        dedupingInterval: 5000,
        focusThrottleInterval: 10000,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
