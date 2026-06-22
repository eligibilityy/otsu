export {
  createOsuClient,
  OsuClient,
  clientCredentials,
  staticToken,
  authorizationCode,
  fileTokenStore,
  memoryTokenStore,
  createAuthCallbackServer,
  generateOAuthState,
  buildAuthorizeUrl,
  OAUTH_URLS,
} from "./client.js";
export type { OsuClientOptions, AuthProvider, RateLimitOptions, RetryOptions } from "./client.js";

export { Ruleset } from "./types/enums.js";
export type { Ruleset as RulesetType, ScoreType, OsuScope } from "./types/enums.js";

// Core models (backward-compatible aliases included)
export type {
  UserCompact,
  UserStatistics,
  BeatmapCompact,
  BeatmapsetCompact,
  BeatmapsetSearchResult,
  ScoreCompact,
  User,
  UserExtended,
  Beatmap,
  BeatmapExtended,
  Beatmapset,
  BeatmapsetExtended,
  Score,
} from "./types/models.js";

export type {
  BeatmapsetSort,
  BeatmapsetSection,
  BeatmapsetGeneralFilter,
  BeatmapsetDiscussion,
  BeatmapsetDiscussionPost,
  BeatmapsetDiscussionVote,
  BeatmapsetDiscussionsResult,
  BeatmapsetDiscussionPostsResult,
  BeatmapsetDiscussionVotesResult,
  BeatmapsetEventsResult,
} from "./types/beatmapset.js";

export type {
  RankingType,
  RankingFilter,
  ManiaVariant,
  RankingEntry,
  CountryRankingEntry,
  RankingsResult,
  CountryRankingsResult,
  KudosuRankingEntry,
  KudosuRankingsResult,
  GetRankingsOptions,
} from "./types/rankings.js";

export type {
  SearchMode,
  SearchOptions,
  SearchResult,
  WikiPage,
  HomeSearchResponse,
} from "./types/search.js";

export type {
  Page,
  CursorString,
  SortOrder,
  ListOptions,
  Country,
  RichText,
} from "./types/common.js";

export type {
  ApiTimestamp,
  Mod,
  ScoreGrade,
  ChannelType,
  ForumTopicType,
  CommentableType,
  CommentSort,
  BeatmapsetDiscussionMessageType,
} from "./types/primitives.js";

export type {
  UserCover,
  UserKudosu,
  UserGroup,
  UserBadge,
  UserAccountHistory,
  UserKudosuHistoryEntry,
} from "./types/user.js";

export type {
  BeatmapFailtimes,
  BeatmapOwner,
  BeatmapDifficultyAttributes,
  BeatmapPack,
  BeatmapPlaycount,
  BeatmapUserTag,
  BeatmapPacksResult,
} from "./types/beatmap.js";

export type {
  BeatmapUserScore,
  BeatmapScoresResult,
  ScoresListResult,
  ScoreStatistics,
  ScoreBase,
  ScoreObjectType,
  SoloScore,
  MultiplayerScore,
  GenericScore,
} from "./types/score.js";
export { isSoloScore, isMultiplayerScore } from "./types/score-guards.js";

export type {
  Event,
  EventType,
  UnknownEvent,
  RecentActivityEvent,
  EventsResult,
  EventUser,
  EventBeatmap,
  EventBeatmapset,
  AchievementEvent,
  BeatmapPlaycountEvent,
  BeatmapsetApproveEvent,
  BeatmapsetDeleteEvent,
  BeatmapsetReviveEvent,
  BeatmapsetUpdateEvent,
  BeatmapsetUploadEvent,
  RankEvent,
  RankLostEvent,
  UserSupportEvent,
  UsernameChangeEvent,
} from "./types/event.js";
export {
  isEventType,
  isAchievementEvent,
  isBeatmapPlaycountEvent,
  isBeatmapsetApproveEvent,
  isBeatmapsetDeleteEvent,
  isBeatmapsetReviveEvent,
  isBeatmapsetUpdateEvent,
  isBeatmapsetUploadEvent,
  isRankEvent,
  isRankLostEvent,
  isUserSupportEvent,
  isUsernameChangeEvent,
  isRecentActivityEvent,
  isKnownEventType,
} from "./types/event-guards.js";

export type { Comment, CommentableMeta, CommentBundle } from "./types/comment.js";

export type {
  ChatChannel,
  ChatMessage,
  ChatChannelUserAttributes,
  UserSilence,
  PrivateMessageResult,
} from "./types/chat.js";

export type {
  Forum,
  ForumTopic,
  ForumPost,
  ForumPoll,
  ForumDetailResult,
  ForumTopicsResult,
  ForumTopicResult,
  CreateForumTopicResult,
  CreateForumTopicPollInput,
} from "./types/forum.js";

export type {
  Match,
  MatchDetail,
  MatchEvent,
  MatchGame,
  MatchesListResult,
} from "./types/match.js";

export type {
  MultiplayerRoom,
  MultiplayerPlaylistItem,
  MultiplayerLeaderboardEntry,
  MultiplayerLeaderboardResult,
  MultiplayerPlaylistScore,
  MultiplayerPlaylistScoresResult,
  MultiplayerRoomEvent,
  MultiplayerRoomEventsResult,
  MultiplayerRoomCategory,
  MultiplayerRoomStatus,
  MultiplayerRoomType,
} from "./types/multiplayer.js";

export type { Team, TeamExtended, TeamStatistics } from "./types/team.js";

export type {
  ChangelogBuild,
  ChangelogEntry,
  ChangelogUpdateStream,
  ChangelogGithubUser,
  ChangelogMessageFormat,
} from "./types/changelog.js";

export type { NewsPost, NewsPostSummary } from "./types/news.js";

export type { Spotlight, SpotlightRankingResult, SpotlightType } from "./types/spotlight.js";

export type { SeasonalBackground, SeasonalBackgroundsResult } from "./types/misc.js";

export { SEARCH_USER_RESULT_LIMIT } from "./types/search.js";

export type {
  GetUserOptions,
  GetUserScoresOptions,
  GetUserBeatmapsOptions,
  GetPassedBeatmapsOptions,
  GetUsersOptions,
  LookupUsersOptions,
  UserBeatmapsetType,
} from "./resources/users.js";
export type { GetMeOptions } from "./resources/me.js";
export type {
  GetBeatmapScoresOptions,
  LookupBeatmapOptions,
  GetBeatmapUserScoreOptions,
  GetBeatmapUserScoresOptions,
  GetDifficultyAttributesOptions,
  BeatmapPackType,
} from "./resources/beatmaps.js";
export type {
  SearchBeatmapsetsOptions,
  GetBeatmapsetDiscussionsOptions,
  GetBeatmapsetDiscussionPostsOptions,
  GetBeatmapsetDiscussionVotesOptions,
  GetBeatmapsetEventsOptions,
} from "./resources/beatmapsets.js";
export type { GetScoresOptions } from "./resources/scores.js";
export type { GetEventsOptions } from "./resources/events.js";
export type { GetCommentsOptions } from "./resources/comments.js";
export type { MatchInfo, GetMatchOptions, GetMatchesOptions } from "./resources/matches.js";
export type { RoomTypeGroup, RoomMode, RoomSort } from "./resources/multiplayer.js";

export {
  OsuApiError,
  OsuAuthenticationError,
  OsuForbiddenError,
  OsuNotFoundError,
  OsuValidationError,
  OsuRateLimitError,
  OsuResponseError,
} from "./errors/index.js";

export { paginateCursor, paginateJsonCursor } from "./pagination/cursor.js";
export type { PaginateCursorOptions, CursorPage, JsonCursorPage } from "./pagination/cursor.js";
export { paginatePage } from "./pagination/page.js";
export type { PaginatePageOptions, PageResult } from "./pagination/page.js";

export type {
  AuthorizationCodeOptions,
  GetAuthorizeUrlOptions,
  TokenStore,
  StoredOAuthTokens,
} from "./auth/index.js";

export { revokeAccessToken } from "./auth/oauth.js";

export {
  formatUserIdentifier,
  formatTeamIdentifier,
  encodePathSegment,
  buildPath,
} from "./utils/path.js";
export { serializeQuery } from "./utils/query.js";
export type { QueryRecord, QueryValue } from "./utils/query.js";
export {
  coerceApiTypes,
  getChatWebsocketHeaders,
  ChatWebsocketCommands,
  CHAT_WEBSOCKET_URL,
} from "./utils/coerce.js";

export { createChatWebsocket, createChatWebsocketFromClient } from "./chat/websocket.js";
export type { CreateChatWebsocketOptions } from "./chat/websocket.js";
