import { NextRequest, NextResponse } from "next/server";
import controller_user from "@/controller/controller_user";
import { withTimeout } from "@/helper/use_timeout";
export async function POST(req: NextRequest) {
    try {
        return await withTimeout(controller_user.update_user_profile(req), 15);
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Gateway timeout" },
            { status: 504 }
        );
    }
}
