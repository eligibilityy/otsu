import type { RequestOptions } from "./http-client.js";

export type RequestFn = <T>(options: RequestOptions) => Promise<T>;
