import { NextRequest, NextResponse } from "next/server";
import controller_telegram from "@/controller/controller_telegram";
import { withTimeout } from "@/helper/helper";
export async function POST(req: NextRequest) {
    try {
        return await withTimeout(controller_telegram.save_setting_bot(req), 15);
    } catch (error: unknown) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Gateway timeout" },
            { status: 504 }
        );
    }
}
