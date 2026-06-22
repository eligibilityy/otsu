import type { RequestFn } from "../http/types.js";
import type { ChatChannel, ChatMessage, PrivateMessageResult, UserSilence } from "../types/chat.js";
import { buildPath } from "../utils/path.js";

/** In-game chat channels and messages. */
export class ChatResource {
  constructor(private readonly request: RequestFn) {}

  /**
   * Acknowledge chat activity and return active silences for the authenticated user.
   *
   * @param options - `history_since` and `since` timestamps for incremental updates.
   *
   * @remarks OAuth scope: `chat.write`. API: `POST /chat/ack`
   */
  async keepAlive(
    options: {
      history_since?: number;
      since?: number;
    } = {},
  ): Promise<UserSilence[]> {
    const response = await this.request<{ silences: UserSilence[] }>({
      method: "POST",
      path: buildPath("chat", "ack"),
      body: {
        history_since: options.history_since,
        since: options.since,
      },
    });
    return response.silences;
  }

  /**
   * List chat channels for the authenticated user.
   *
   * @remarks OAuth scope: `chat.read`. API: `GET /chat/channels`
   */
  listChannels(): Promise<ChatChannel[]> {
    return this.request<ChatChannel[]>({ path: buildPath("chat", "channels") });
  }

  /**
   * Get a chat channel by id.
   *
   * @param channelId - Channel id.
   *
   * @remarks OAuth scope: `chat.read`. API: `GET /chat/channels/{channel}`
   */
  async getChannel(channelId: number): Promise<ChatChannel> {
    const response = await this.request<{ channel: ChatChannel }>({
      path: buildPath("chat", "channels", channelId),
    });
    return response.channel;
  }

  /**
   * Mark messages in a channel as read up to a given message id.
   *
   * @param channelId - Channel id.
   * @param messageId - Last read message id.
   *
   * @remarks OAuth scope: `chat.write`. API: `PUT /chat/channels/{channel}/mark-as-read/{message}`
   */
  markAsRead(channelId: number, messageId: number): Promise<void> {
    return this.request({
      method: "PUT",
      path: buildPath("chat", "channels", channelId, "mark-as-read", messageId),
      body: { channel_id: channelId, message_id: messageId },
    });
  }

  /**
   * Create a private message channel with another user.
   *
   * @param targetUserId - User id to open a PM channel with.
   *
   * @remarks OAuth scope: `chat.write_manage`. API: `POST /chat/channels`
   */
  createPrivateChannel(targetUserId: number): Promise<ChatChannel> {
    return this.request<ChatChannel>({
      method: "POST",
      path: buildPath("chat", "channels"),
      body: { type: "PM", target_id: targetUserId },
    });
  }

  /**
   * Create an announcement channel and send an initial message to target users.
   *
   * @param body - Channel metadata, target user ids, and announcement message.
   *
   * @remarks OAuth scope: `chat.write_manage`. API: `POST /chat/channels`
   */
  createAnnouncement(body: {
    channel: { name: string; description: string };
    target_ids: number[];
    message: string;
  }): Promise<ChatChannel> {
    return this.request<ChatChannel>({
      method: "POST",
      path: buildPath("chat", "channels"),
      body: { type: "ANNOUNCE", ...body },
    });
  }

  /**
   * Add a user to a chat channel.
   *
   * @param channelId - Channel id.
   * @param userId - User id to add.
   *
   * @remarks OAuth scope: `chat.write_manage`. API: `PUT /chat/channels/{channel}/users/{user}`
   */
  joinChannel(channelId: number, userId: number): Promise<ChatChannel> {
    return this.request<ChatChannel>({
      method: "PUT",
      path: buildPath("chat", "channels", channelId, "users", userId),
    });
  }

  /**
   * Remove a user from a chat channel.
   *
   * @param channelId - Channel id.
   * @param userId - User id to remove.
   *
   * @remarks OAuth scope: `chat.write_manage`. API: `DELETE /chat/channels/{channel}/users/{user}`
   */
  leaveChannel(channelId: number, userId: number): Promise<void> {
    return this.request({
      method: "DELETE",
      path: buildPath("chat", "channels", channelId, "users", userId),
    });
  }

  /**
   * Get messages from a chat channel.
   *
   * @param channelId - Channel id.
   * @param options - Limit and `since`/`until` message id bounds.
   *
   * @remarks OAuth scope: `chat.read`. API: `GET /chat/channels/{channel}/messages`
   */
  getMessages(
    channelId: number,
    options: { limit?: number; since?: number; until?: number } = {},
  ): Promise<ChatMessage[]> {
    return this.request<ChatMessage[]>({
      path: buildPath("chat", "channels", channelId, "messages"),
      query: {
        limit: options.limit ?? 20,
        since: options.since,
        until: options.until,
      },
    });
  }

  /**
   * Send a message to a chat channel.
   *
   * @param channelId - Channel id.
   * @param message - Message text.
   * @param is_action - When `true`, sends as a `/me` action message.
   *
   * @remarks OAuth scope: `chat.write`. API: `POST /chat/channels/{channel}/messages`
   */
  sendMessage(channelId: number, message: string, is_action = false): Promise<ChatMessage> {
    return this.request<ChatMessage>({
      method: "POST",
      path: buildPath("chat", "channels", channelId, "messages"),
      body: { message, is_action },
    });
  }

  /**
   * Send a private message to a user (creates the PM channel if needed).
   *
   * @param targetUserId - Recipient user id.
   * @param message - Message text.
   * @param options - Optional action flag and client-side uuid.
   *
   * @remarks OAuth scope: `chat.write`. API: `POST /chat/new`
   */
  sendPrivateMessage(
    targetUserId: number,
    message: string,
    options: { is_action?: boolean; uuid?: string } = {},
  ): Promise<PrivateMessageResult> {
    return this.request<PrivateMessageResult>({
      method: "POST",
      path: buildPath("chat", "new"),
      body: {
        target_id: targetUserId,
        message,
        is_action: options.is_action ?? false,
        uuid: options.uuid,
      },
    });
  }
}
