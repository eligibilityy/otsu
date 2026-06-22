import type { AuthProvider } from "./auth/oauth.js";
import { HttpClient, type RequestOptions } from "./http/http-client.js";
import { RateLimiter, type RateLimitOptions } from "./http/rate-limiter.js";
import { withRetry, type RetryOptions } from "./http/retry.js";
import { BeatmapsResource } from "./resources/beatmaps.js";
import { BeatmapsetsResource } from "./resources/beatmapsets.js";
import { ChangelogResource } from "./resources/changelog.js";
import { ChatResource } from "./resources/chat.js";
import { CommentsResource } from "./resources/comments.js";
import { EventsResource } from "./resources/events.js";
import { ForumResource } from "./resources/forum.js";
import { HomeResource } from "./resources/home.js";
import { MatchesResource } from "./resources/matches.js";
import { MeResource } from "./resources/me.js";
import { MiscResource } from "./resources/misc.js";
import { MultiplayerResource } from "./resources/multiplayer.js";
import { NewsResource } from "./resources/news.js";
import { RankingsResource } from "./resources/rankings.js";
import { ScoresResource } from "./resources/scores.js";
import { SpotlightsResource } from "./resources/spotlights.js";
import { TeamsResource } from "./resources/teams.js";
import { UsersResource } from "./resources/users.js";
import { WikiResource } from "./resources/wiki.js";
import { OsuAuthenticationError } from "./errors/index.js";

export interface OsuClientOptions {
  /** Authentication provider (client credentials, static token, or authorization code). */
  auth: AuthProvider;
  /** API base URL. Defaults to `https://osu.ppy.sh/api/v2`. */
  baseUrl?: string;
  /** Value for the `x-api-version` header (e.g. `"20220705"` for modern score objects). */
  apiVersion?: string;
  /** Value for the `Accept-Language` header. */
  acceptLanguage?: string;
  /** Client-side rate limiting applied before each request. */
  rateLimit?: RateLimitOptions;
  /** Retry policy for transient network and rate-limit errors. */
  retry?: RetryOptions;
  /** Custom `fetch` implementation (for tests or non-Node runtimes). */
  fetch?: typeof fetch;
  /** Log outgoing requests when `true`. */
  debug?: boolean;
  /** Called when `debug: true`. Defaults to `console.debug`. */
  logger?: (message: string) => void;
}

/**
 * Typed osu! API v2 client.
 *
 * Access endpoints through resource namespaces (e.g. `client.users.get()`).
 * Handles auth headers, rate limiting, retries, and token refresh automatically.
 *
 * @example
 * ```ts
 * const client = createOsuClient({
 *   auth: clientCredentials({ clientId, clientSecret, scopes: ["public"] }),
 * });
 * const user = await client.users.get("@peppy");
 * ```
 */
export class OsuClient {
  private readonly http: HttpClient;
  private readonly rateLimiter: RateLimiter;
  private readonly retryOptions: RetryOptions;

  /** User profiles, scores, and beatmapsets. */
  readonly users: UsersResource;
  /** Individual beatmaps, leaderboards, packs, and difficulty attributes. */
  readonly beatmaps: BeatmapsResource;
  /** Beatmapset search, lookup, and modding discussions. */
  readonly beatmapsets: BeatmapsetsResource;
  /** Global and country rankings. */
  readonly rankings: RankingsResource;
  /** Site-wide user and wiki search. */
  readonly home: HomeResource;
  /** Authenticated user profile (`/me`). */
  readonly me: MeResource;
  /** Score lookup and replay download. */
  readonly scores: ScoresResource;
  /** Wiki pages. */
  readonly wiki: WikiResource;
  /** News posts. */
  readonly news: NewsResource;
  /** Site-wide recent activity feed. */
  readonly events: EventsResource;
  /** Comment threads on beatmapsets and other entities. */
  readonly comments: CommentsResource;
  /** Release changelog and build history. */
  readonly changelog: ChangelogResource;
  /** Multiplayer match history (tournament / legacy matches). */
  readonly matches: MatchesResource;
  /** Multiplayer rooms (playlists and realtime). */
  readonly multiplayer: MultiplayerResource;
  /** Forum listing, topics, and posts. */
  readonly forum: ForumResource;
  /** In-game chat channels and messages. */
  readonly chat: ChatResource;
  /** Team profiles and statistics. */
  readonly teams: TeamsResource;
  /** Seasonal spotlights and spotlight rankings. */
  readonly spotlights: SpotlightsResource;
  /** Miscellaneous public endpoints. */
  readonly misc: MiscResource;

  constructor(options: OsuClientOptions) {
    const httpOptions: ConstructorParameters<typeof HttpClient>[0] = {
      auth: options.auth,
    };
    if (options.baseUrl !== undefined) httpOptions.baseUrl = options.baseUrl;
    if (options.apiVersion !== undefined) httpOptions.apiVersion = options.apiVersion;
    if (options.acceptLanguage !== undefined) httpOptions.acceptLanguage = options.acceptLanguage;
    if (options.fetch !== undefined) httpOptions.fetch = options.fetch;
    if (options.debug !== undefined) httpOptions.debug = options.debug;
    if (options.logger !== undefined) httpOptions.logger = options.logger;

    this.http = new HttpClient(httpOptions);
    this.rateLimiter = new RateLimiter(options.rateLimit);
    this.retryOptions = options.retry ?? {};

    const request = <T>(opts: RequestOptions) => this.execute(() => this.http.request<T>(opts));

    this.users = new UsersResource(request);
    this.beatmaps = new BeatmapsResource(request);
    this.beatmapsets = new BeatmapsetsResource(request);
    this.rankings = new RankingsResource(request);
    this.home = new HomeResource(request);
    this.me = new MeResource(request);
    this.scores = new ScoresResource(request);
    this.wiki = new WikiResource(request);
    this.news = new NewsResource(request);
    this.events = new EventsResource(request);
    this.comments = new CommentsResource(request);
    this.changelog = new ChangelogResource(request);
    this.matches = new MatchesResource(request);
    this.multiplayer = new MultiplayerResource(request);
    this.forum = new ForumResource(request);
    this.chat = new ChatResource(request);
    this.teams = new TeamsResource(request);
    this.spotlights = new SpotlightsResource(request);
    this.misc = new MiscResource(request);
  }

  /** The auth provider used for this client (for token refresh or revoke). */
  get auth(): AuthProvider {
    return this.http.authProvider;
  }

  /**
   * Low-level HTTP escape hatch for endpoints not wrapped by a resource.
   *
   * @param method - HTTP method (e.g. `"GET"`, `"POST"`)
   * @param path - Path relative to the API base (e.g. `"/users/2"`)
   * @param options - Optional query parameters and JSON body
   */
  request<T>(
    method: string,
    path: string,
    options: {
      query?: RequestOptions["query"];
      body?: unknown;
    } = {},
  ): Promise<T> {
    const requestOptions: RequestOptions = { method, path };
    if (options.query !== undefined) requestOptions.query = options.query;
    if (options.body !== undefined) requestOptions.body = options.body;

    return this.execute(() => this.http.request<T>(requestOptions));
  }

  private async execute<T>(fn: () => Promise<T>): Promise<T> {
    const run = async () => {
      await this.rateLimiter.acquire();
      return fn();
    };

    return withRetry(async () => {
      try {
        return await run();
      } catch (error) {
        if (error instanceof OsuAuthenticationError && this.http.authProvider.refresh) {
          await this.http.authProvider.refresh();
          return await run();
        }
        throw error;
      }
    }, this.retryOptions);
  }
}

/**
 * Create an {@link OsuClient} with the given options.
 *
 * @param options - Client configuration including auth provider
 */
export function createOsuClient(options: OsuClientOptions): OsuClient {
  return new OsuClient(options);
}

export { clientCredentials } from "./auth/client-credentials.js";
export { staticToken } from "./auth/static-token.js";
export { authorizationCode } from "./auth/authorization-code.js";
export { fileTokenStore, memoryTokenStore } from "./auth/index.js";
export { createAuthCallbackServer, generateOAuthState } from "./auth/dev-server.js";
export { buildAuthorizeUrl, OAUTH_URLS } from "./auth/oauth.js";
export type { AuthProvider } from "./auth/oauth.js";
export type { RateLimitOptions } from "./http/rate-limiter.js";
export type { RetryOptions } from "./http/retry.js";
