import { NextRequest, NextResponse } from "next/server";
import { removeTokenCookie } from "@/app/lib/utils/auth";

export async function POST(req: NextRequest) {
  await removeTokenCookie();

  return NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );
}
