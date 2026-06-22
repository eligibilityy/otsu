import type { ApiTimestamp } from "./primitives.js";

/** osu! client update stream (stable, cutting edge, etc.). */
export interface ChangelogUpdateStream {
  id: number;
  name: string;
  display_name: string | null;
  is_featured: boolean;
  latest_build?: ChangelogBuild | null;
  user_count?: number;
}

/** GitHub contributor linked to a changelog entry. */
export interface ChangelogGithubUser {
  display_name: string;
  github_url: string | null;
  github_username: string | null;
  id: number | null;
  osu_username: string | null;
  user_id: number | null;
  user_url: string | null;
}

/** Single change note within a client build. */
export interface ChangelogEntry {
  id: number | null;
  repository: string | null;
  github_pull_request_id: number | null;
  github_url: string | null;
  url: string | null;
  type: string;
  category: string;
  title: string | null;
  major: boolean;
  created_at: ApiTimestamp | null;
  github_user?: ChangelogGithubUser;
  message?: string | null;
  message_html?: string | null;
}

/** osu! client build with changelog entries and navigation. */
export interface ChangelogBuild {
  id: number;
  version: string | null;
  display_version: string;
  users: number;
  created_at: ApiTimestamp;
  youtube_id?: string | null;
  update_stream?: ChangelogUpdateStream;
  changelog_entries?: ChangelogEntry[];
  versions?: {
    next: ChangelogBuild | null;
    previous: ChangelogBuild | null;
  };
}

/** Message format for changelog entry bodies. */
export type ChangelogMessageFormat = "html" | "markdown";
