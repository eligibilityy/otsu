import type { ApiTimestamp } from "./primitives.js";

/** News post summary for listings and navigation. */
export interface NewsPostSummary {
  id: number;
  author: string;
  slug: string;
  title: string;
  published_at: ApiTimestamp;
  updated_at: ApiTimestamp;
  edit_url?: string;
  first_image?: string | null;
}

/** Full news post with HTML content and prev/next links. */
export interface NewsPost extends NewsPostSummary {
  content: string;
  navigation: {
    newer?: NewsPostSummary;
    older?: NewsPostSummary;
  };
}
