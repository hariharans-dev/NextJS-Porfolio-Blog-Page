import { NextResponse } from "next/server";
import {
  generateAuthKey,
  verifyAuthKey,
} from "@/utilities/keySignAuthentication";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, key } = body;

    if (!email || !key) {
      return NextResponse.json(
        { error: "Email and key are required." },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminKey = process.env.ADMIN_KEY;
    const hashKey = process.env.HASH_KEY;

    if (email == adminEmail && key == adminKey) {
      const session = generateAuthKey(String(hashKey));
      return NextResponse.json({ session }, { status: 200 });
    }

    return NextResponse.json(
      { error: "invalid authentication" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get("session");
    if (!session)
      return NextResponse.json(
        { error: "session is required" },
        { status: 400 }
      );

    const hashKey = process.env.HASH_KEY;

    const status = verifyAuthKey(String(hashKey), session);
    if (status)
      return NextResponse.json(
        { response: "session is active" },
        { status: 200 }
      );
    return NextResponse.json({ response: "session expired" }, { status: 401 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get message" },
      { status: 500 }
    );
  }
}
