import { NextResponse } from "next/server";
import { z } from "zod";

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

export type ProtectSuccess<TData> = { ok: true; data: TData; form: FormData | null; };
export type ProtectFailure = { ok: false; response: NextResponse };
export type ShapeRecord = Record<string, z.ZodType>;
export type ShapeOutput<T extends ShapeRecord> = { [K in keyof T]: z.output<T[K]> };
export type ProtectData<T extends ShapeRecord> = ShapeOutput<T> & { hash_key: string; token?: string; };
export type ProtectDataSchema<TSchema extends z.ZodObject<z.ZodRawShape>> = z.output<TSchema> & { hash_key: string; token?: string; };
export type ProtectDataFor<T> = T extends z.ZodObject<z.ZodRawShape> ? ProtectDataSchema<T> : T extends ShapeRecord ? ProtectData<T> : never;
export type ProtectResult<TData> = ProtectSuccess<TData> | ProtectFailure;
export type ProtectDataWithToken<T> = ProtectDataFor<T> & { token: string; };