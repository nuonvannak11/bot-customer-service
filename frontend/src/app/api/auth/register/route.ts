import { NextRequest, NextResponse } from "next/server";
import controller_user from "@/controller/controller_user";
import { withTimeout } from "@/helper/use_timeout";
export async function POST(req: NextRequest) {
    try {
        return await withTimeout(controller_user.register(req), 10);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 504 }
        );
    }
}