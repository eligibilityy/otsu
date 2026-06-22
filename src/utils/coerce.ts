/** Coerce API JSON strings into Date/number where appropriate. */
export function coerceApiTypes<T>(value: T, forceString = false): T {
  if (Array.isArray(value)) {
    return value.map((item) => coerceApiTypes(item, forceString)) as T;
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    const textFields = new Set([
      "artist",
      "artist_unicode",
      "title",
      "title_unicode",
      "tags",
      "location",
      "interests",
      "occupation",
      "twitter",
      "discord",
      "category",
      "beatmap_version",
      "version",
      "display_version",
      "author",
      "raw",
      "bbcode",
      "message",
      "creator",
      "source",
    ]);

    for (const [key, nested] of Object.entries(record)) {
      const keepString =
        forceString ||
        textFields.has(key) ||
        key.toLowerCase().includes("string") ||
        key.toLowerCase().includes("name");

      record[key] = coerceApiTypes(nested, keepString);
    }

    return record as T;
  }

  if (forceString && typeof value !== "object") {
    return String(value) as T;
  }

  if (typeof value === "string") {
    if (/^[+-]?\d{4}-\d{2}-\d{2}($|[ T].*)/.test(value)) {
      let normalized: string = value;
      if (/[0-9]{2}:[0-9]{2}:[0-9]{2}$/.test(normalized)) {
        normalized += "Z";
      }
      if (/[0-9]{2}:[0-9]{2}:[0-9]{2}\+[0-9]{2}:[0-9]{2}$/.test(normalized)) {
        normalized = `${normalized.substring(0, normalized.indexOf("+"))}Z`;
      }
      return new Date(normalized) as T;
    }

    if (value !== "" && !Number.isNaN(Number(value))) {
      return Number(value) as T;
    }
  }

  return value;
}

/** Auth headers for the osu! chat WebSocket (`wss://notify.ppy.sh`). */
export function getChatWebsocketHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

/** Pre-built WebSocket command payloads for chat. */
export const ChatWebsocketCommands = {
  chatStart: JSON.stringify({ command: "chat.start" }),
  chatEnd: JSON.stringify({ command: "chat.end" }),
} as const;

export const CHAT_WEBSOCKET_URL = "wss://notify.ppy.sh";
