declare module "next-auth" {
  interface Session {
    googleIdToken?: string;
  }
}

export type AuthResponse<T = unknown> = {
  code: number;
  message: string;
  data: T;
};

export type DataLogin = {
  refreshToken: string;
  accessToken: string;
}

export type ResponseData = {
  code: number;
  message: string;
  data: unknown;
};

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type OTPResponse<T> = {
  code: number;
  message: string;
  token: T;
};