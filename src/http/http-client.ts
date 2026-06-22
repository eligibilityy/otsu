import type { AuthProvider } from "../auth/oauth.js";
import { serializeQuery, type QueryRecord } from "../utils/query.js";

export interface HttpClientOptions {
  baseUrl?: string;
  auth: AuthProvider;
  apiVersion?: string;
  acceptLanguage?: string;
  fetch?: typeof fetch;
  debug?: boolean;
  /** Called when `debug: true`. Defaults to `console.debug`. */
  logger?: (message: string) => void;
}

export interface RequestOptions {
  method?: string;
  path: string;
  query?: QueryRecord;
  body?: unknown;
  headers?: Record<string, string>;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly auth: AuthProvider;
  private readonly apiVersion?: string;
  private readonly acceptLanguage?: string;
  private readonly fetchImpl: typeof fetch;
  private readonly debug: boolean;
  private readonly logger: (message: string) => void;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl ?? "https://osu.ppy.sh/api/v2";
    this.auth = options.auth;
    if (options.apiVersion !== undefined) this.apiVersion = options.apiVersion;
    if (options.acceptLanguage !== undefined) this.acceptLanguage = options.acceptLanguage;
    this.fetchImpl = options.fetch ?? globalThis.fetch;
    this.debug = options.debug ?? false;
    this.logger = options.logger ?? ((message) => console.debug(message));
  }

  get authProvider(): AuthProvider {
    return this.auth;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const method = options.method ?? "GET";
    const url = this.buildUrl(options.path, options.query);
    const token = await this.auth.getAccessToken();

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...options.headers,
    };

    if (this.apiVersion) {
      headers["x-api-version"] = this.apiVersion;
    }

    if (this.acceptLanguage) {
      headers["Accept-Language"] = this.acceptLanguage;
    }

    let body: string | undefined;
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    if (this.debug) {
      this.logger(`[otsu] ${method} ${url}`);
    }

    const init: RequestInit = { method, headers };
    if (body !== undefined) {
      init.body = body;
    }

    const response = await this.fetchImpl(url, init);
    return this.parseResponse<T>(response, { method, url });
  }

  private buildUrl(path: string, query?: RequestOptions["query"]): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);

    if (query) {
      serializeQuery(query, url.searchParams);
    }

    return url.toString();
  }

  private async parseResponse<T>(
    response: Response,
    request: { method: string; url: string },
  ): Promise<T> {
    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const { createErrorFromResponse } = await import("../errors/index.js");
      throw createErrorFromResponse(response.status, request, body, response.headers);
    }

    return body as T;
  }
}
