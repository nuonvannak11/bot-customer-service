import { NextRequest, NextResponse } from "next/server";
import controller_telegram from "@/controller/controller_telegram";
import { withTimeout } from "@/helper/use_timeout";
export async function POST(req: NextRequest) {
    try {
        return await withTimeout(controller_telegram.save(req), 10);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 504 }
        );
    }
}