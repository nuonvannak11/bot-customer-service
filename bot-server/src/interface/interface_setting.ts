interface TelegramBot {
    bot_token?: string;
    process?: boolean;
    enable_web_hook?: boolean;
    push_notifications?: boolean;
    silent_mode?: boolean;
}

interface TelegramUser {
    phone?: string;
    api_id?: string;
    process?: boolean;
    enable_web_hook?: boolean;
    push_notifications?: boolean;
    silent_mode?: boolean;
}

interface UserSetting {
    emailNotifications?: boolean;
    twoFactor?: boolean;
}

export interface ISetting {
    user_id: string;
    user: UserSetting;
    facebook: any;
    telegram: {
        bot: TelegramBot[];
        user: TelegramUser[];
    };
    tiktok: any;
    google: any;
    other: any;
    active: boolean;
}
