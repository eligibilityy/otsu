/**
 * Format a user reference for the osu! API path segment.
 * Numeric IDs are used as-is; usernames get an `@` prefix.
 */
export function formatUserIdentifier(user: number | string): string {
  if (typeof user === "number") {
    return String(user);
  }

  if (/^\d+$/.test(user)) {
    return user;
  }

  return user.startsWith("@") ? user : `@${user}`;
}

/**
 * Format a team reference for the osu! API path segment.
 * Numeric IDs are used as-is; short names get an `@` prefix.
 */
export function formatTeamIdentifier(team: number | string): string {
  if (typeof team === "number") {
    return String(team);
  }

  if (/^\d+$/.test(team)) {
    return team;
  }

  return team.startsWith("@") ? team : `@${team}`;
}

/** Encode a single path segment (user id, username, etc.). */
export function encodePathSegment(segment: string | number): string {
  return encodeURIComponent(String(segment));
}

/**
 * Build a path with encoded segments, e.g. `/users/@peppy/scores/best`.
 * Literal slashes in `parts` are not supported — pass each segment separately.
 */
export function buildPath(...parts: Array<string | number>): string {
  return `/${parts.map(encodePathSegment).join("/")}`;
}
