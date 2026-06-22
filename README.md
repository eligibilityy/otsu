# otsu

A typed, zero-dependency [osu! API v2](https://osu.ppy.sh/docs/index.html) client for Node.js 20+.

## Requirements

- **Node.js 20+** (uses native `fetch`)
- An [OAuth application](https://osu.ppy.sh/home/account/edit#oauth) for API access

## Install

```bash
npm install otsuapi
```

## Quick start

```typescript
import { createOsuClient, clientCredentials, Ruleset } from "otsuapi";

const client = createOsuClient({
  auth: clientCredentials({
    clientId: Number(process.env.OSU_CLIENT_ID),
    clientSecret: process.env.OSU_CLIENT_SECRET!,
    scopes: ["public"],
  }),
});

const user = await client.users.get("@peppy", { mode: Ruleset.Osu });
const scores = await client.users.getScores(user.id, {
  type: "best",
  mode: Ruleset.Osu,
  limit: 10,
});
```

Set credentials in your environment:

```bash
# PowerShell
$env:OSU_CLIENT_ID = "your_client_id"
$env:OSU_CLIENT_SECRET = "your_client_secret"
```

## Authentication

### Client credentials (scripts & bots)

```typescript
import { clientCredentials } from "otsuapi";

const auth = clientCredentials({
  clientId: 12345,
  clientSecret: "your_secret",
  scopes: ["public"],
});
```

Tokens are fetched automatically and refreshed before expiry. Concurrent requests share a single refresh.

### Static token (tests & manual OAuth)

When you already have an access token:

```typescript
import { staticToken } from "otsuapi";

const auth = staticToken(process.env.OSU_ACCESS_TOKEN!);
```

### Authorization code (user-facing apps)

For endpoints that need a logged-in user (`/me`, friends, replays, etc.).

**1. Register a callback URL** in your [OAuth app settings](https://osu.ppy.sh/home/account/edit#oauth) (e.g. `http://127.0.0.1:3914/callback` for local scripts).

**2. Redirect the user to osu! for consent:**

```typescript
import { createOsuClient, authorizationCode, fileTokenStore, generateOAuthState } from "otsuapi";

const auth = authorizationCode({
  clientId: 12345,
  clientSecret: "your_secret",
  redirectUri: "https://your-app.com/callback",
  scopes: ["public", "identify", "friends.read"],
  store: fileTokenStore(".osu-tokens.json"),
});

const url = auth.getAuthorizeUrl({ state: generateOAuthState() });
// redirect the user to `url`
```

**3. Exchange the callback code for tokens:**

```typescript
await auth.exchangeCode(codeFromCallback);
```

**4. Use the client — tokens refresh automatically:**

```typescript
const client = createOsuClient({ auth });
const me = await client.me.get();
```

#### Local CLI login

For scripts, use the built-in callback server:

```typescript
import { createAuthCallbackServer } from "otsuapi";

const callback = await createAuthCallbackServer({ port: 3914 });
const auth = authorizationCode({
  clientId: 12345,
  clientSecret: "your_secret",
  redirectUri: callback.redirectUri,
  scopes: ["public", "identify"],
  store: fileTokenStore(".osu-tokens.json"),
});

console.log(auth.getAuthorizeUrl());
const code = await callback.waitForCode();
await auth.exchangeCode(code);
await callback.close();
```

Or run: `npm run example:auth`

Auth utilities are also available from the `otsu/auth` subpath.

## Client options

```typescript
const client = createOsuClient({
  auth,
  apiVersion: "20220705", // x-api-version header
  acceptLanguage: "en", // Accept-Language header
  debug: true, // log requests
  logger: (msg) => console.log(msg), // custom debug logger
  rateLimit: {
    requestsPerMinute: 60, // osu! documented limit
    minIntervalMs: 1000, // default: 1 req/s
    onThrottled: (ms) => console.warn(`waiting ${ms}ms`),
  },
  retry: {
    maxAttempts: 3,
    baseDelayMs: 500,
  },
});
```

## API reference

User ids and `@usernames` are handled automatically. Numeric strings like `"12345"` are treated as ids.

Scopes noted below are required for authorization-code flows. Client-credentials (`public` scope) covers most read endpoints.

### `client.users`

| Method                                 | Endpoint                                    | Notes                                 |
| -------------------------------------- | ------------------------------------------- | ------------------------------------- |
| `get(user, options?)`                  | `GET /users/{user}`                         | By id or `@username`; optional `mode` |
| `getMany(ids, options?)`               | `GET /users`                                | Bulk fetch by ids                     |
| `lookup(ids, options?)`                | `GET /users/lookup`                         | Lookup with optional `ruleset`        |
| `getScores(user, options?)`            | `GET /users/{user}/scores/{type}`           | `type`: `best`, `firsts`, `recent`    |
| `getBeatmapsets(user, type, options?)` | `GET /users/{user}/beatmapsets/{type}`      | `favourite`, `ranked`, `loved`, etc.  |
| `getMostPlayed(user, options?)`        | `GET /users/{user}/beatmapsets/most_played` |                                       |
| `getRecentActivity(user, options?)`    | `GET /users/{user}/recent_activity`         | Returns `RecentActivityEvent[]`       |
| `getPassedBeatmaps(user, options)`     | `GET /users/{user}/beatmaps-passed`         | Requires `beatmapsetIds`              |
| `getKudosuHistory(user, options?)`     | `GET /users/{user}/kudosu`                  |                                       |
| `getFriends()`                         | `GET /friends`                              | Scope: `friends.read`                 |

### `client.beatmaps`

| Method                                         | Endpoint                                          |
| ---------------------------------------------- | ------------------------------------------------- |
| `get(beatmapId)`                               | `GET /beatmaps/{beatmap}`                         |
| `getMany(ids)`                                 | `GET /beatmaps`                                   |
| `lookup(options)`                              | `GET /beatmaps/lookup`                            |
| `getScores(beatmapId, options?)`               | `GET /beatmaps/{beatmap}/scores`                  |
| `getUserScore(beatmapId, user, options?)`      | `GET /beatmaps/{beatmap}/scores/users/{user}`     |
| `getUserScores(beatmapId, user, options?)`     | `GET /beatmaps/{beatmap}/scores/users/{user}/all` |
| `getDifficultyAttributes(beatmapId, options?)` | `POST /beatmaps/{beatmap}/attributes`             |
| `getUserTags()`                                | `GET /tags`                                       |
| `getPacks(type?, cursor_string?)`              | `GET /beatmaps/packs`                             |
| `getPack(packTag, legacy_only?)`               | `GET /beatmaps/packs/{pack}`                      |

### `client.beatmapsets`

| Method                         | Endpoint                             |
| ------------------------------ | ------------------------------------ |
| `search(options?)`             | `GET /beatmapsets/search`            |
| `searchAll(options?)`          | Auto-paginates via `cursor_string`   |
| `get(beatmapsetId)`            | `GET /beatmapsets/{beatmapset}`      |
| `lookup(beatmapId)`            | `GET /beatmapsets/lookup`            |
| `getDiscussions(options?)`     | `GET /beatmapsets/discussions`       |
| `getDiscussionPosts(options?)` | `GET /beatmapsets/discussions/posts` |
| `getDiscussionVotes(options?)` | `GET /beatmapsets/discussions/votes` |
| `getEvents(options?)`          | `GET /beatmapsets/events`            |

Throws `OsuResponseError` if search returns HTTP 200 with an `error` field.

### `client.scores`

| Method               | Endpoint                       | Notes             |
| -------------------- | ------------------------------ | ----------------- |
| `get(scoreId)`       | `GET /scores/{score}`          |                   |
| `getMany(options?)`  | `GET /scores`                  | Global score feed |
| `getReplay(scoreId)` | `GET /scores/{score}/download` | Scope: `delegate` |

### `client.rankings`

| Method                         | Endpoint                                |
| ------------------------------ | --------------------------------------- |
| `get(mode, type, options?)`    | `GET /rankings/{mode}/{type}`           |
| `getAll(mode, type, options?)` | Auto-paginates performance/score/charts |
| `getKudosu(options?)`          | `GET /rankings/kudosu`                  |

Types: `performance`, `score`, `country`, `charts`.

### `client.me`

| Method                        | Endpoint                        | Scopes     |
| ----------------------------- | ------------------------------- | ---------- |
| `get(options?)`               | `GET /me/{mode?}`               | `identify` |
| `getFavouriteBeatmapsetIds()` | `GET /me/beatmapset-favourites` | `identify` |

### `client.home`

| Method                      | Endpoint                                |
| --------------------------- | --------------------------------------- |
| `search(options)`           | `GET /search`                           |
| `searchUsers(query, page?)` | `GET /search?mode=user`                 |
| `searchWiki(query, page?)`  | `GET /search?mode=wiki_page`            |
| `searchUsersAll(options)`   | Paginated user search (max 100 results) |
| `searchWikiAll(options)`    | Paginated wiki search                   |

### `client.wiki`

| Method               | Endpoint                    |
| -------------------- | --------------------------- |
| `get(path, locale?)` | `GET /wiki/{locale}/{path}` |

### `client.news`

| Method        | Endpoint                            |
| ------------- | ----------------------------------- |
| `get(post)`   | `GET /news/{slug}` or by numeric id |
| `list(year?)` | `GET /news`                         |

### `client.events`

| Method          | Endpoint      |
| --------------- | ------------- |
| `get(options?)` | `GET /events` |

### `client.comments`

| Method           | Endpoint                  |
| ---------------- | ------------------------- |
| `get(commentId)` | `GET /comments/{comment}` |
| `list(options?)` | `GET /comments`           |

### `client.changelog`

| Method                        | Endpoint                          |
| ----------------------------- | --------------------------------- | ------- |
| `getStreams()`                | `GET /changelog`                  |
| `getBuilds(options?)`         | `GET /changelog`                  |
| `getBuild(stream, build)`     | `GET /changelog/{stream}/{build}` |
| `lookup(changelog, formats?)` | `GET /changelog/{id               | build}` |

### `client.matches`

| Method                   | Endpoint               |
| ------------------------ | ---------------------- |
| `get(matchId, options?)` | `GET /matches/{match}` |
| `list(options?)`         | `GET /matches`         |

### `client.multiplayer`

| Method                                            | Endpoint                                   |
| ------------------------------------------------- | ------------------------------------------ |
| `list(type, mode, options?)`                      | `GET /rooms`                               |
| `get(roomId)`                                     | `GET /rooms/{room}`                        |
| `getLeaderboard(roomId)`                          | `GET /rooms/{room}/leaderboard`            |
| `getEvents(roomId)`                               | `GET /rooms/{room}/events`                 |
| `getPlaylistItemScores(roomId, itemId, options?)` | `GET /rooms/{room}/playlist/{item}/scores` |

`type`: `playlists` `realtime`. `mode`: `active`, `all`, `ended`, `participated`, `owned`.

### `client.forum`

| Method                                     | Endpoint                            | Notes                |
| ------------------------------------------ | ----------------------------------- | -------------------- |
| `list()`                                   | `GET /forums`                       |                      |
| `get(forumId)`                             | `GET /forums/{forum}`               |                      |
| `listTopics(options?)`                     | `GET /forums/topics`                |                      |
| `getTopic(topicId, options?)`              | `GET /forums/topics/{topic}`        |                      |
| `createTopic(forumId, title, text, poll?)` | `POST /forums/topics`               | Scope: `forum.write` |
| `reply(topicId, body)`                     | `POST /forums/topics/{topic}/reply` | Scope: `forum.write` |
| `editTopicTitle(topicId, title)`           | `PUT /forums/topics/{topic}`        | Scope: `forum.write` |
| `editPost(postId, body)`                   | `PUT /forums/posts/{post}`          | Scope: `forum.write` |
| `lockTopic(topicId, lock?)`                | `POST /forums/topics/{topic}/lock`  | Scope: `forum.write` |
| `pinTopic(topicId, pin)`                   | `POST /forums/topics/{topic}/pin`   | Scope: `forum.write` |

### `client.chat`

| Method                                                | Endpoint                                              | Notes                      |
| ----------------------------------------------------- | ----------------------------------------------------- | -------------------------- |
| `keepAlive(options?)`                                 | `POST /chat/ack`                                      | Scope: `chat.write`        |
| `listChannels()`                                      | `GET /chat/channels`                                  | Scope: `chat.read`         |
| `getChannel(channelId)`                               | `GET /chat/channels/{channel}`                        | Scope: `chat.read`         |
| `markAsRead(channelId, messageId)`                    | `PUT /chat/channels/{channel}/mark-as-read/{message}` | Scope: `chat.write`        |
| `createPrivateChannel(targetUserId)`                  | `POST /chat/channels`                                 | Scope: `chat.write_manage` |
| `createAnnouncement(body)`                            | `POST /chat/channels`                                 | Scope: `chat.write_manage` |
| `joinChannel(channelId, userId)`                      | `PUT /chat/channels/{channel}/users/{user}`           | Scope: `chat.write_manage` |
| `leaveChannel(channelId, userId)`                     | `DELETE /chat/channels/{channel}/users/{user}`        | Scope: `chat.write_manage` |
| `getMessages(channelId, options?)`                    | `GET /chat/channels/{channel}/messages`               | Scope: `chat.read`         |
| `sendMessage(channelId, message, isAction?)`          | `POST /chat/channels/{channel}/messages`              | Scope: `chat.write`        |
| `sendPrivateMessage(targetUserId, message, options?)` | `POST /chat/new`                                      | Scope: `chat.write`        |

WebSocket helpers: `createChatWebsocket`, `createChatWebsocketFromClient`, `CHAT_WEBSOCKET_URL`.

### `client.teams`

| Method             | Endpoint            |
| ------------------ | ------------------- |
| `get(team, mode?)` | `GET /teams/{team}` |

### `client.spotlights`

| Method                                   | Endpoint                      |
| ---------------------------------------- | ----------------------------- |
| `list()`                                 | `GET /spotlights`             |
| `getRanking(mode, spotlightId, filter?)` | `GET /rankings/{mode}/charts` |

### `client.misc`

| Method                     | Endpoint                    |
| -------------------------- | --------------------------- |
| `getSeasonalBackgrounds()` | `GET /seasonal-backgrounds` |

### Type narrowing

Discriminated unions and guards help narrow events and scores at runtime:

```typescript
import { isEventType, isAchievementEvent, isSoloScore, isMultiplayerScore } from "otsuapi";

const events = await client.events.get();
for (const event of events.events) {
  if (isAchievementEvent(event)) {
    console.log(event.achievement.name);
  } else if (isEventType(event, "rank")) {
    console.log(event.beatmap.title);
  }
}

const scores = await client.users.getScores(2, { type: "best", limit: 10 });
for (const score of scores) {
  if (isMultiplayerScore(score)) {
    console.log(score.room_id);
  } else if (isSoloScore(score)) {
    console.log(score.ranked);
  }
}
```

### Escape hatch

```typescript
await client.request("GET", "/wiki/{path}", {
  query: { locale: "en" },
});
```

## Pagination

Three pagination styles are used across the osu! API:

| Style                | Used by           | Helper                           |
| -------------------- | ----------------- | -------------------------------- |
| `cursor_string`      | Beatmapset search | `client.beatmapsets.searchAll()` |
| JSON `cursor` object | Rankings          | `client.rankings.getAll()`       |
| `page` number        | Home search       | `client.home.searchUsersAll()`   |

Low-level helpers are exported if you need them:

```typescript
import { paginateCursor, paginateJsonCursor, paginatePage } from "otsuapi";
```

All iterators guard against duplicate cursors and unbounded loops (default max 100 pages).

## Error handling

Import error classes from the main package or the `otsu/errors` subpath:

```typescript
import {
  OsuNotFoundError,
  OsuRateLimitError,
  OsuAuthenticationError,
  OsuResponseError,
} from "otsuapi";

try {
  await client.users.get(999999999);
} catch (error) {
  if (error instanceof OsuNotFoundError) {
    // 404
  } else if (error instanceof OsuRateLimitError) {
    await sleep(error.retryAfterMs ?? 60_000);
  } else if (error instanceof OsuAuthenticationError) {
    // bad credentials or expired token
  }
}
```

| Class                    | When                                |
| ------------------------ | ----------------------------------- |
| `OsuAuthenticationError` | HTTP 401, OAuth failures            |
| `OsuForbiddenError`      | HTTP 403 (missing scope)            |
| `OsuNotFoundError`       | HTTP 404                            |
| `OsuValidationError`     | HTTP 422                            |
| `OsuRateLimitError`      | HTTP 429 — check `retryAfterMs`     |
| `OsuResponseError`       | HTTP 200 with logical error payload |
| `OsuApiError`            | Other HTTP errors                   |

All errors expose `status`, `request`, and `response` for debugging.

## Examples

Runnable examples are in `examples/` (require `OSU_CLIENT_ID` and `OSU_CLIENT_SECRET`):

```bash
npm run example              # fetch a user + scores
npm run example:search -- "freedom dive"
npm run example:rankings -- US
npm run example:home -- peppy
npm run example:auth           # interactive OAuth login
```

## Development

```bash
npm install
npm test                    # unit tests (mocked fetch) — runs in CI
npm run test:guest          # live API, client credentials (public scope)
npm run test:authenticated  # live API, user token (scoped endpoints)
npm run test:all            # everything
npm run build
npm run typecheck
npm run format              # format with Prettier
npm run format:check        # CI check
```

### Test layout

Tests mirror the [osu-api-v2-js](https://github.com/TTTaevas/osu-api-v2-js) structure:

| Directory              | Purpose                                            | Credentials                          |
| ---------------------- | -------------------------------------------------- | ------------------------------------ |
| `tests/unit/`          | Mocked tests (client, auth, pagination, resources) | None                                 |
| `tests/guest/`         | Live API with client credentials                   | `OSU_CLIENT_ID`, `OSU_CLIENT_SECRET` |
| `tests/authenticated/` | Live API with user OAuth token                     | `OSU_ACCESS_TOKEN`                   |

Copy `.env.example` to `.env` for local guest/authenticated runs. CI runs unit tests only; guest and authenticated suites skip when credentials are unset.

```bash
# PowerShell — guest (public) tests
$env:OSU_CLIENT_ID = "your_client_id"
$env:OSU_CLIENT_SECRET = "your_client_secret"
npm run test:guest

# Authenticated tests (after `npm run example:auth`)
$env:OSU_ACCESS_TOKEN = "your_access_token"
npm run test:authenticated
```

> **Types are partial** — model interfaces cover documented fields; the API may return more. Use type guards (`isSoloScore`, `isEventType`, etc.) for runtime narrowing

## License

`otsu` is under the MIT License. See [LICENSE](LICENSE).
