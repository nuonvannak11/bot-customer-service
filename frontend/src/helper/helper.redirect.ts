import { redirect } from "next/navigation";
import controller_user from "@/controller/controller_user";
import { cookies } from "next/headers";

export async function redirectPages(wantRedirect: string = "/dashboard") {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    if (token) {
        const check_auth = await controller_user.check_auth(token);
        if (check_auth.code == 200) {
            redirect(wantRedirect);
        }
    }
}