interface ConnectedSocial {
    facebook: number;
    tiktok: number;
    telegram: number;
}

export interface IUser {
    user_id: string;
    email?: string | null;
    phone?: string | null;
    name: string;
    bio: string;
    point: number;
    avatar?: string;
    password?: string;
    phone_verified: boolean;
    google_id?: string | null;
    access_token_hash?: string;
    refresh_token_hash?: string;
    plan: "free" | "basic" | "pro";
    role: "owner" | "admin" | "user";
    connectedAccountsCount: ConnectedSocial;
    createdAt?: Date;
    updatedAt?: Date;
}
