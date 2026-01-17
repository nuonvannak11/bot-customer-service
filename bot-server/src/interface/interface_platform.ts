export interface TelegramBot {
    bot_username?: string;
    bot_token_enc: string;
}

export interface TelegramUser {
    phone: string;
    api_id: string;
    api_hash_enc: string;
}

export interface FacebookPage {
    page_id: string;
    page_name?: string;
    page_access_token_enc: string;
    token_expire_at?: Date;
}

export interface TiktokData {
    tiktok_openid: string;
    tiktok_token_enc: string;
}

export interface IPlatform {
    user_id: string;
    facebook: {
        data: FacebookPage[];
    };
    telegram: {
        web_hook: string;
        bot: TelegramBot[];
        user: TelegramUser[];
    };
    tiktok: {
        data: TiktokData[];
    };
    active: boolean;
}