import { Response } from "express";

export interface OpenCloseBotRequest {
    token: string;
    bot_token: string;
    user_id: string;
    hash_key: string;
    method: string;
}

export interface GetBotSettingRequest {
    token: string;
    user_id: string;
    session_id: string;
}

export interface ConfirmGroupChanelProps {
    server_ip: string;
    port: string;
    user_id: string;
    confirm_key: string;
}

export interface TelegramGetChatMemberResponse {
    ok: boolean;
    result: {
        user: {
            id: number;
            is_bot: boolean;
            first_name: string;
            username: string;
        };
        status: string;
        can_be_edited: boolean;
        can_manage_chat: boolean;
        can_delete_messages: boolean;
        can_manage_video_chats: boolean;
        can_restrict_members: boolean;
        can_promote_members: boolean;
        can_change_info: boolean;
        can_invite_users: boolean;
        can_post_messages: boolean;
        can_edit_messages: boolean;
        can_pin_messages: boolean;
    };
}

export interface GetBotRoleRequest {
    user_id: string;
    token: string;
    bot_token: string;
    chat_id: string;
}

export interface SaveTgBotRequest {
    user_id: string;
    botToken: string;
    is_process: boolean;
    webhookUrl?: string;
    webhookEnabled?: boolean;
    notifyEnabled?: boolean;
    silentMode?: boolean;
    hash_key: string;
    exceptionLinks?: string[];
    exceptionFiles?: string[];
}

export interface TelegramFile {
    file_name: string;
    mime_type: string;
    file_id: string;
    file_unique_id: string;
    file_size: number;
}

export interface HandleOpenCloseBotProps {
    res: Response;
    bot_token: string;
    bot_token_enc: string;
    bot_token_hash: string;
    user_id: string;
    url: string;
}


export interface User {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: true;
    added_to_attachment_menu?: true;
}

export interface BotInfo {
    is_bot: true;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
    can_connect_to_business: boolean;
    has_main_web_app: boolean;
    has_topics_enabled?: boolean;
}

export interface OpenCloseBotResponse extends BotInfo{
    id?: number;
    first_name: string;
    last_name?: string;
 };