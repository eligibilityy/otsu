import type { Ruleset } from "./enums.js";
import type { ApiTimestamp } from "./primitives.js";
import type { Beatmapset, BeatmapsetExtended } from "./beatmapset.js";
import type { User } from "./user.js";

export interface BeatmapFailtimes {
  exit?: number[];
  fail?: number[];
}

export interface BeatmapOwner {
  id: number;
  username: string;
}

/** Base beatmap object. */
export interface Beatmap {
  id: number;
  beatmapset_id: number;
  difficulty_rating: number;
  mode: Ruleset;
  status: string;
  total_length: number;
  user_id: number;
  version: string;
  beatmapset?: Beatmapset | BeatmapsetExtended | null;
  checksum?: string;
  current_user_playcount?: number;
  failtimes?: BeatmapFailtimes;
  max_combo?: number;
  owners?: BeatmapOwner[];
}

/** Extended beatmap with difficulty metadata. */
export interface BeatmapExtended extends Beatmap {
  accuracy: number;
  ar: number;
  bpm: number | null;
  convert: boolean;
  count_circles: number;
  count_sliders: number;
  count_spinners: number;
  cs: number;
  deleted_at: ApiTimestamp | null;
  drain: number;
  hit_length: number;
  is_scoreable: boolean;
  last_updated: ApiTimestamp;
  mode_int: number;
  passcount: number;
  playcount: number;
  ranked: number;
  url: string;
}

/** Computed difficulty metrics for a beatmap (star rating, strain, etc.). */
export interface BeatmapDifficultyAttributes {
  star_rating: number;
  max_combo: number;
  aim_difficulty?: number;
  aim_difficult_slider_count?: number;
  speed_difficulty?: number;
  speed_note_count?: number;
  slider_factor?: number;
  aim_difficult_strain_count?: number;
  speed_difficult_strain_count?: number;
  mono_stamina_factor?: number;
}

/** Curated downloadable beatmap pack with optional completion tracking. */
export interface BeatmapPack {
  author: string;
  date: ApiTimestamp;
  name: string;
  no_diff_reduction: boolean;
  ruleset_id: number | null;
  tag: string;
  url: string;
  beatmapsets?: BeatmapsetExtended[];
  user_completion_data?: {
    beatmapset_ids: number[];
    completed: boolean;
  };
}

/** Play count for a single beatmap, with nested beatmap and beatmapset. */
export interface BeatmapPlaycount {
  beatmap_id: number;
  count: number;
  beatmap: Beatmap;
  beatmapset: Beatmapset;
}

/** User-defined tag applied to a beatmap. */
export interface BeatmapUserTag {
  id: number;
  name: string;
  ruleset_id: number | null;
  description: string;
}

/** Paginated list of beatmap packs from `GET /beatmapsets/packs`. */
export interface BeatmapPacksResult {
  beatmap_packs: BeatmapPack[];
  cursor_string: string | null;
}
