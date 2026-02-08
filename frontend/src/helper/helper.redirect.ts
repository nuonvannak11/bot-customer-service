import { redirect } from "next/navigation";
import controller_user from "@/controller/controller_user";
import { CheckAuthResponse } from "@/interface";
import { getServerToken } from "@/libs/lib";
import check_jwt from "./check_jwt";

export async function valid_token(): Promise<string | null> {
    const token = await getServerToken();
    if (!token) return null;
    const ensureToken = check_jwt.verifyToken(token);
    if (!ensureToken) return null;
    return token;
}

export async function redirectPages(wantRedirect: string = "/dashboard") {
    const get_token = await valid_token();
    if (get_token) {
        const check_auth = await controller_user.check_auth(get_token);
        if (!check_auth) return;
        redirect(wantRedirect);
    }
}

export async function redirectLogin(): Promise<{ token: string, data: CheckAuthResponse } | null> {
    const get_token = await valid_token();
    if (get_token) {
        const check_auth = await controller_user.check_auth(get_token);
        if (!check_auth) return null;
        return { token: get_token, data: check_auth };
    } else {
        return null;
    }
}