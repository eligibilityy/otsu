import type { RequestFn } from "../http/types.js";
import type {
  ChangelogBuild,
  ChangelogMessageFormat,
  ChangelogUpdateStream,
} from "../types/changelog.js";

export type { ChangelogMessageFormat };

/** Release changelog and build history. */
export class ChangelogResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * List changelog update streams.
   *
   * @remarks OAuth scope: `public`. API: `GET /changelog`
   */
  async getStreams(): Promise<ChangelogUpdateStream[]> {
    const response = await this.request<{ streams: ChangelogUpdateStream[] }>({
      path: "/changelog",
      query: { max_id: 0 },
    });
    return response.streams;
  }

  /**
   * List changelog builds, optionally filtered by stream and date range.
   *
   * @param options - Stream name, date range, max id, and message formats.
   *
   * @remarks OAuth scope: `public`. API: `GET /changelog`
   */
  async getBuilds(
    options: {
      stream?: string;
      from?: string;
      to?: string;
      max_id?: number;
      message_formats?: ChangelogMessageFormat[];
    } = {},
  ): Promise<ChangelogBuild[]> {
    const response = await this.request<{ builds: ChangelogBuild[] }>({
      path: "/changelog",
      query: {
        stream: options.stream,
        from: options.from,
        to: typeof options.to === "string" ? options.to : undefined,
        max_id: typeof options.to === "number" ? options.to : options.max_id,
        message_formats: options.message_formats ?? ["html", "markdown"],
      },
    });
    return response.builds;
  }

  /**
   * Get a specific changelog build by stream and build name.
   *
   * @param stream - Changelog stream name (e.g. `"stable40"`).
   * @param build - Build identifier within the stream.
   *
   * @remarks OAuth scope: `public`. API: `GET /changelog/{stream}/{build}`
   */
  getBuild(stream: string, build: string): Promise<ChangelogBuild> {
    return this.request<ChangelogBuild>({
      path: `/changelog/${encodeURIComponent(stream)}/${encodeURIComponent(build)}`,
    });
  }

  /**
   * Look up a changelog build by id or build name.
   *
   * @param changelog - Numeric build id or build name string.
   * @param message_formats - Message body formats to include in the response.
   *
   * @remarks OAuth scope: `public`. API: `GET /changelog/{changelog}`
   */
  lookup(
    changelog: string | number,
    message_formats: ChangelogMessageFormat[] = ["html", "markdown"],
  ): Promise<ChangelogBuild> {
    return this.request<ChangelogBuild>({
      path: `/changelog/${encodeURIComponent(String(changelog))}`,
      query: {
        key: typeof changelog === "number" ? "id" : undefined,
        message_formats,
      },
    });
  }
}
