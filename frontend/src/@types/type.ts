declare module "next-auth" {
  interface Session {
    googleIdToken?: string;
  }
}

export interface SocketPayload {
  token: string;
  socket_url: string;
}

export type AuthResponse<T = unknown> = {
  code: number;
  message: string;
  data: T;
};

export type LoginResponse = AuthResponse & {
  token: string;
}

// 2. Change 'any' to 'unknown' to fix the explicit-any error
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