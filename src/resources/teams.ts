import type { RequestFn } from "../http/types.js";
import type { Ruleset } from "../types/enums.js";
import type { TeamExtended } from "../types/team.js";
import { buildPath, formatTeamIdentifier } from "../utils/path.js";

/** Team profiles and statistics. */
export class TeamsResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Get a team by id or short name.
   *
   * @param team - Team id or short name (`"myteam"` / `"@myteam"`). Numeric strings are ids.
   * @param mode - Optional ruleset for mode-specific statistics (appended to the path).
   *
   * @remarks OAuth scope: `public`. API: `GET /teams/{team}` or `GET /teams/{team}/{mode}`
   */
  get(team: number | string, mode?: Ruleset): Promise<TeamExtended> {
    const segments: Array<string | number> = ["teams", formatTeamIdentifier(team)];
    if (mode !== undefined) {
      segments.push(mode);
    }

    return this.request<TeamExtended>({ path: buildPath(...segments) });
  }
}
