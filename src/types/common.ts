/** Page number for endpoints that paginate with `page`. */
export type Page = number;

/** Opaque cursor from a previous response. */
export type CursorString = string;

/** Sort order for id-based pagination. */
export type SortOrder = "id_asc" | "id_desc";

/** Common list/pagination options shared across endpoints. */
export interface ListOptions {
  limit?: number;
  offset?: number;
  sort?: SortOrder;
  page?: Page;
  cursor_string?: CursorString;
}

export interface Country {
  code: string;
  name: string;
}

export interface RichText {
  html: string;
  raw: string;
}
