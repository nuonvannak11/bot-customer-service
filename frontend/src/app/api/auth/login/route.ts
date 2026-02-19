import { NextRequest, NextResponse } from "next/server";
import controller_user from "@/controller/controller_user";
import { withTimeout } from "@/helper/helper";
export async function POST(req: NextRequest) {
    try {
        return await withTimeout(controller_user.login(req), 15);
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Gateway timeout" },
            { status: 504 }
        );
    }
}
