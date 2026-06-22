import type { ApiTimestamp } from "./primitives.js";
import type { BeatmapsetExtended } from "./beatmapset.js";
import type { UserStatistics } from "./user.js";

/** Spotlight event category (monthly, yearly, theme, etc.). */
export type SpotlightType = "bestof" | "monthly" | "special" | "spotlight" | "theme" | "yearly";

/** Time-bounded map/feature spotlight event. */
export interface Spotlight {
  id: number;
  name: string;
  start_date: ApiTimestamp;
  end_date: ApiTimestamp;
  type: SpotlightType | string;
  mode_specific: boolean;
  participant_count?: number;
}

/** Spotlight chart with ranked users and featured beatmapsets. */
export interface SpotlightRankingResult {
  beatmapsets: BeatmapsetExtended[];
  ranking: UserStatistics[];
  spotlight: Spotlight;
}
