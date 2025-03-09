import { NextResponse } from "next/server";
import { removeTokenCookie } from "@/app/lib/utils/auth";

export async function POST() {
  await removeTokenCookie();

  return NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );
}
