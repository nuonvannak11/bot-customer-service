interface ConnectedSocial {
    facebook: number;
    tiktok: number;
    telegram: number;
}

export interface IUser {
    user_id: string;
    email?: string;
    email_hash?: string;
    phone?: string;
    phone_hash?: string;
    name: string;
    bio: string;
    point: number;
    avatar?: string;
    password?: string;
    phone_verified: boolean;
    google_id?: string;
    google_id_hash?: string;
    refresh_token_hash?: string;
    plan: "free" | "basic" | "pro";
    role: "owner" | "admin" | "user";
    connectedAccountsCount: ConnectedSocial;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface GetSeverRequest {
    server_ip?: string;
    user_id?: string;
    session_id?: string;
    token?: string;
    hash_key?: string;
}

export interface LoginRequest {
    phone: string;
    password: string;
    hash_key: string;
}

export interface VerifyPhoneRequest {
    phone: string;
    code: string;
    hash_key: string;
}

export interface GoogleLoginRequest {
    google_token: string;
    hash_key: string;
}

export interface RegisterRequest {
    username: string;
    phone: string;
    password: string;
    hash_key: string;
}

export interface ResendCodeRequest {
    phone: string;
    hash_key: string;
}