import { createServer, type Server } from "node:http";
import { randomBytes } from "node:crypto";

export interface AuthCallbackServer {
  /** Redirect URI to register in your osu! OAuth app and pass to `getAuthorizeUrl()`. */
  redirectUri: string;
  /** Resolves when osu! redirects back with an authorization code. */
  waitForCode(): Promise<string>;
  /** Stop the local server without waiting for a callback. */
  close(): Promise<void>;
}

export interface AuthCallbackServerOptions {
  /** Port to listen on. Default: random available port. */
  port?: number;
  /** Host to bind. Default: `127.0.0.1`. */
  host?: string;
  /** Callback path. Default: `/callback`. */
  path?: string;
}

/**
 * Spin up a temporary local HTTP server to receive the OAuth redirect.
 *
 * @param options - Optional port, host, and callback path
 * @returns A server handle with the bound `redirectUri`, a `waitForCode()` promise,
 *   and a `close()` method
 *
 * @remarks Intended for CLI scripts and local development — not for production web apps.
 * Register the returned `redirectUri` in your osu! OAuth app before calling
 * {@link AuthorizationCodeAuth.getAuthorizeUrl}.
 *
 * @example
 * ```ts
 * const server = await createAuthCallbackServer({ port: 3914 });
 * console.log("Register this URI:", server.redirectUri);
 *
 * const url = auth.getAuthorizeUrl({ state: generateOAuthState() });
 * // Open `url` in a browser…
 *
 * const code = await server.waitForCode();
 * await server.close();
 * await auth.exchangeCode(code, server.redirectUri);
 * ```
 */
export function createAuthCallbackServer(
  options: AuthCallbackServerOptions = {},
): Promise<AuthCallbackServer> {
  const host = options.host ?? "127.0.0.1";
  const pathname = options.path ?? "/callback";

  return new Promise((resolve, reject) => {
    let resolveCode: (code: string) => void;
    let rejectCode: (error: Error) => void;

    const codePromise = new Promise<string>((resolve, reject) => {
      resolveCode = resolve;
      rejectCode = reject;
    });

    const server: Server = createServer((req, res) => {
      if (!req.url) {
        res.writeHead(400);
        res.end("Bad request");
        return;
      }

      const url = new URL(req.url, `http://${host}`);
      if (url.pathname !== pathname) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const oauthError = url.searchParams.get("error");
      if (oauthError) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(`<h1>Authorization failed</h1><p>${oauthError}</p>`);
        rejectCode(new Error(`OAuth authorization denied: ${oauthError}`));
        return;
      }

      const code = url.searchParams.get("code");
      if (!code) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end("<h1>Missing authorization code</h1>");
        rejectCode(new Error("OAuth callback missing code parameter"));
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end("<h1>Authorized!</h1><p>You can close this tab and return to the app.</p>");
      resolveCode(code);
    });

    server.on("error", reject);

    server.listen(options.port ?? 0, host, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to bind auth callback server"));
        return;
      }

      const redirectUri = `http://${host}:${address.port}${pathname}`;

      resolve({
        redirectUri,
        waitForCode: () => codePromise,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((error) => {
              if (error) {
                closeReject(error);
              } else {
                closeResolve();
              }
            });
          }),
      });
    });
  });
}

/**
 * Generate a random `state` parameter for CSRF protection.
 *
 * @returns A 32-character hex string suitable for the OAuth `state` query parameter
 *
 * @remarks Pass the value to {@link AuthorizationCodeAuth.getAuthorizeUrl} and verify
 * it matches when handling the redirect callback.
 */
export function generateOAuthState(): string {
  return randomBytes(16).toString("hex");
}
