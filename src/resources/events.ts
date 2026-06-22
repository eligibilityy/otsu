import type { RequestFn } from "../http/types.js";
import type { EventsResult } from "../types/event.js";
import type { CursorString, SortOrder } from "../types/common.js";

/** Options for {@link EventsResource.get}. */
export interface GetEventsOptions {
  /** Sort order. Defaults to `"id_desc"`. */
  sort?: SortOrder;
  /** Cursor for pagination. */
  cursor_string?: CursorString;
}

/** Global site activity events feed. */
export class EventsResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * List recent site-wide activity events.
   *
   * @param options - Sort order and pagination cursor.
   *
   * @remarks OAuth scope: `public`. API: `GET /events`
   *
   * @example
   * import { createOsuClient, clientCredentials } from "otsuapi";
   *
   * const client = createOsuClient({
   *   auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }),
   * });
   * const { events } = await client.events.get({ sort: "id_desc" });
   */
  get(options: GetEventsOptions = {}): Promise<EventsResult> {
    return this.request<EventsResult>({
      path: "/events",
      query: {
        sort: options.sort ?? "id_desc",
        cursor_string: options.cursor_string,
      },
    });
  }
}
