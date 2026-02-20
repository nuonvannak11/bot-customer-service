import { redirect } from "next/navigation";
import controller_user from "@/controller/controller_user";
import jwtService from "@/libs/jwt";
import { CheckAuthResponse } from "@/interface";
import { getServerToken } from "@/libs/lib";

export async function valid_token(): Promise<{ token: string; newToken?: string } | null> {
    const token = await getServerToken();
    if (!token) return null;
    const ensureToken = await jwtService.verifyToken(token);
    if (!ensureToken) return null;
    const newToken = ensureToken?.newToken;
    return { token, newToken };
}

export async function redirectPages(wantRedirect: string = "/dashboard") {
    const get_token = await valid_token();
    if (get_token) {
        const { token, newToken } = get_token;
        const pickToken = newToken ? newToken : token;
        const check_auth = await controller_user.check_auth(pickToken);
        if (!check_auth) return;
        if (newToken) await controller_user.setAccessToken(newToken);
        redirect(wantRedirect);
    }
}

export async function redirectLogin(): Promise<{ token: string, data: CheckAuthResponse } | null> {
    const get_token = await valid_token();
    if (get_token) {
        const { token, newToken } = get_token;
        const pickToken = newToken ? newToken : token;
        const check_auth = await controller_user.check_auth(pickToken);
        if (!check_auth) return null;
        if (newToken) await controller_user.setAccessToken(newToken);
        return { token: pickToken, data: check_auth };
    } else {
        return null;
    }
}