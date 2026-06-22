import type { User } from "./user.js";
import type { ApiTimestamp } from "./primitives.js";

/** Seasonal site background image with attributing user. */
export interface SeasonalBackground {
  url: string;
  user: User;
}

/** Active seasonal backgrounds and when the rotation ends. */
export interface SeasonalBackgroundsResult {
  ends_at: ApiTimestamp;
  backgrounds: SeasonalBackground[];
}
