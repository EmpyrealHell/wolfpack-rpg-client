export interface EventSubMetadata {
  message_type: 'session_welcome' | 'notification' | 'session_reconnect';
  subscription_type?: 'user.whisper.message' | 'channel.chat.message';
}

export interface EventSubPayload {
  session?: {
    id: string;
  };
  event?: {
    from_user_id?: string;
    whisper?: {
      text: string;
    };
    broadcaster_login?: string;
    chatter_login?: string;
    message?: {
      text: string;
    };
  };
}

export interface EventSubMessage {
  metadata: EventSubMetadata;
  payload: EventSubPayload;
}

export interface EventSubSubscription {
  type: EventSubMetadata['subscription_type'];
  version: string;
  condition: {
    user_id?: string;
    broadcaster_id?: string;
  };
  transport: {
    method: 'websocket';
    session_id: string | null;
  };
}
