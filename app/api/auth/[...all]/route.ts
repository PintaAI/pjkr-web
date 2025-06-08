import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "../../../../lib/auth";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

export async function GET(request: NextRequest) {
  try {
    return await handler.GET(request);
  } catch (error) {
    console.error("Auth GET Error:", error);
    return NextResponse.json(
      { error: "Authentication error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Auth POST request:", request.url);
    const result = await handler.POST(request);
    console.log("Auth POST result status:", result.status);
    return result;
  } catch (error) {
    console.error("Auth POST Error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      { error: "Authentication error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
