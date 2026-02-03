import { redirect } from "next/navigation";
import controller_user from "@/controller/controller_user";
import { cookies } from "next/headers";
import { checkJwtToken } from "@/hooks/use_check_jwt";

export async function valid_token(): Promise<string | null> {
    const cookieStore = await cookies();
    const get_token = cookieStore.get("authToken")?.value;
    if (!get_token) return null;
    const check_auth = await checkJwtToken(get_token);
    if (!check_auth.status) {
        return null;
    }
    return get_token;
}

export async function redirectPages(wantRedirect: string = "/dashboard") {
    const get_token = await valid_token();
    if (get_token) {
        const check_auth = await controller_user.check_auth(get_token);
        if (check_auth.code == 200) {
            redirect(wantRedirect);
        }
    }
}

export async function redirectLogin(): Promise<{ token: string, data: any } | null> {
    const get_token = await valid_token();
    if (get_token) {
        const check_auth = await controller_user.check_auth(get_token);
        if (check_auth.code != 200) {
            return null;
        } else {
            return { token: get_token, data: check_auth.data };
        }
    } else {
        return null;
    }
}