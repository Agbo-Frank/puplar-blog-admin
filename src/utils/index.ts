export { cn } from "./cn";
export { mutate as clearCache } from "swr";

export function replacePathParams(
  path: string,
  params: Record<string, string | number>
): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`:${key}(?=/|$)`, "g"), String(value)),
    path
  );
}

export function cleanPayload<T>(payload: T): Partial<T> {
  if (payload === null || payload === undefined) return payload;
  if (Array.isArray(payload)) {
    return payload.map((item) => cleanPayload(item)) as unknown as Partial<T>;
  }
  if (typeof payload === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (value === "") continue;
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const cleaned = cleanPayload(value);
        if (Object.keys(cleaned as object).length > 0) result[key] = cleaned;
        continue;
      }
      result[key] = value;
    }
    return result as Partial<T>;
  }
  return payload as Partial<T>;
}

export function parseJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "object" && !Array.isArray(value)) {
    return Object.keys(value).length === 0;
  }
  return false;
}

export const concatStrings = (...args: unknown[]): string => {
  if (args.length === 0) return "";
  const separator = args[args.length - 1];
  const strings = args.slice(0, -1);
  return strings
    .filter((s) => s && typeof s === "string" && (s as string).trim() !== "")
    .join(typeof separator === "string" ? separator : "");
};

export const buildQueryString = (filter: Record<string, string | number | undefined>): string => {
  return Object.entries(filter)
    .filter(([, value]) => !isEmpty(value))
    .map(([key, value], i) => `${i === 0 ? "?" : ""}${key}=${value}`)
    .join("&");
};
