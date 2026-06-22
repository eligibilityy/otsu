/** Game mode (osu!, taiko, catch, mania) used across API requests. */
export type Ruleset = "osu" | "taiko" | "fruits" | "mania";

/** Named constants for each {@link Ruleset} value. */
export const Ruleset = {
  Osu: "osu",
  Taiko: "taiko",
  Fruits: "fruits",
  Mania: "mania",
} as const satisfies Record<string, Ruleset>;

/** Score listing filter for user score endpoints (`best`, `firsts`, `recent`). */
export type ScoreType = "best" | "firsts" | "recent";

/**
 * OAuth permission scopes for the osu! API.
 *
 * @remarks Requested during authorization. See the
 * [osu! web API authorization docs](https://osu.ppy.sh/docs/index#authorization-code-grant).
 */
export type OsuScope =
  | "public"
  | "identify"
  | "friends.read"
  | "forum.write"
  | "forum.write_manage"
  | "chat.read"
  | "chat.write"
  | "chat.write_manage"
  | "multiplayer.write_manage"
  | "delegate"
  | "group_permissions";
