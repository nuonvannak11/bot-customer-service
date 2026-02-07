import { NextRequest, NextResponse } from "next/server";
import controller_telegram from "@/controller/controller_telegram";
import { withTimeout } from "@/helper/use_timeout";
export async function POST(req: NextRequest) {
    try {
        return await withTimeout(controller_telegram.handleProtect(req), 15);
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Gateway timeout" },
            { status: 504 }
        );
    }
}
