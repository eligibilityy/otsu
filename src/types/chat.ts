import type { ApiTimestamp } from "./primitives.js";
import type { ChannelType } from "./primitives.js";
import type { User } from "./user.js";

/** Current user's permissions and read state for a chat channel. */
export interface ChatChannelUserAttributes {
  can_list_users?: boolean;
  can_message: boolean;
  can_message_error: string | null;
  last_read_id: number | null;
}

/** Chat channel with optional recent messages and participant IDs. */
export interface ChatChannel {
  channel_id: number;
  name: string;
  description: string | null;
  icon: string | null;
  type: ChannelType;
  message_length_limit: number;
  moderated: boolean;
  uuid: string | null;
  current_user_attributes?: ChatChannelUserAttributes;
  last_read_id?: number | null;
  last_message_id?: number | null;
  recent_messages?: ChatMessage[];
  users?: number[];
}

/** Single message in a chat channel. */
export interface ChatMessage {
  channel_id: number;
  content: string;
  is_action: boolean;
  message_id: number;
  sender_id: number;
  timestamp: ApiTimestamp;
  type: string;
  uuid?: string | null;
  sender?: User;
}

/** Active silence restriction on a user. */
export interface UserSilence {
  id: number;
  user_id: number;
}

/** Newly created PM channel and its first message. */
export interface PrivateMessageResult {
  channel: ChatChannel;
  message: ChatMessage;
}
