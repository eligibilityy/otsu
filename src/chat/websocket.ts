import type { OsuClient } from "../client.js";
import {
  CHAT_WEBSOCKET_URL,
  ChatWebsocketCommands,
  getChatWebsocketHeaders,
} from "../utils/coerce.js";

export interface CreateChatWebsocketOptions {
  accessToken: string;
  url?: string;
  headers?: Record<string, string>;
}

/** Create a WebSocket connection to the osu! chat notification server. */
export function createChatWebsocket(options: CreateChatWebsocketOptions): WebSocket {
  const headers = options.headers ?? getChatWebsocketHeaders(options.accessToken);
  return new WebSocket(options.url ?? CHAT_WEBSOCKET_URL, { headers });
}

export { getChatWebsocketHeaders, ChatWebsocketCommands, CHAT_WEBSOCKET_URL };

/** Convenience helper that uses the client's current access token. */
export async function createChatWebsocketFromClient(
  client: OsuClient,
  options: Omit<CreateChatWebsocketOptions, "accessToken"> = {},
): Promise<WebSocket> {
  const accessToken = await client.auth.getAccessToken();
  return createChatWebsocket({ ...options, accessToken });
}
