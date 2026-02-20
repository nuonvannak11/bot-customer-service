import { getRefreshToken } from "@/libs/lib";
import { NextResponse } from "next/server";
import userController from "@/controller/controller_user";
import { setTokenCookie } from "@/helper/helper";

export async function POST() {
    const refresh_token = await getRefreshToken();
    if (!refresh_token) {
        return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }
    const newAccessToken = await userController.ensureAcessToken(refresh_token);
    if (!newAccessToken) {
        return NextResponse.json({ error: "Invalid refresh" }, { status: 401 });
    }
    const secure = process.env.NODE_ENV === "production";
    const res = NextResponse.json({ success: true });
    setTokenCookie({ res, name: "access_token", value: newAccessToken, maxAge: userController.expireAt(1), secure });
    return res;
}