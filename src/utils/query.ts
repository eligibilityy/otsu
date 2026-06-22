export type QueryValue =
  | string
  | number
  | boolean
  | Date
  | null
  | undefined
  | QueryValue[]
  | { [key: string]: QueryValue };

export type QueryRecord = Record<string, QueryValue>;

/** Flatten query objects for GET requests (arrays → `key[]`, nested → `key[sub]`). */
export function serializeQuery(
  params: QueryRecord,
  target: URLSearchParams = new URLSearchParams(),
  prefix = "",
): URLSearchParams {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    const paramKey = prefix ? `${prefix}[${key}]` : key;

    if (value instanceof Date) {
      target.set(paramKey, value.toISOString());
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        continue;
      }
      for (const item of value) {
        if (item === undefined || item === null) {
          continue;
        }
        if (typeof item === "object" && !(item instanceof Date)) {
          serializeQuery({ "": item } as QueryRecord, target, `${paramKey}[]`);
        } else {
          target.append(`${paramKey}[]`, String(item instanceof Date ? item.toISOString() : item));
        }
      }
      continue;
    }

    if (typeof value === "object") {
      serializeQuery(value as QueryRecord, target, paramKey);
      continue;
    }

    if (value === "" || (typeof value === "string" && value.length === 0)) {
      continue;
    }

    target.set(paramKey, String(value));
  }

  return target;
}
