import { NextResponse } from "next/server";
import { verifyAuthKey } from "@/utilities/keySignAuthentication";
import { MongoClient } from "mongodb";

let client: MongoClient | null = null;

async function getClient() {
  if (!client) {
    const uri = process.env.MONGODB_URI;
    if (!uri)
      throw new Error("MONGODB_URI is not defined in environment variables");
    client = new MongoClient(uri);
    await client.connect();
  }
  return client;
}

export async function POST(request: Request) {
  try {
    const authHeader =
      request.headers.get("Authorization") ||
      request.headers.get("authorization");

    let token: string | null = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }


    if (!token)
      return NextResponse.json(
        { error: "authentication is missing" },
        { status: 400 }
      );

    const hashKey = process.env.HASH_KEY;

    const status = verifyAuthKey(String(hashKey), token);
    if (!status)
      return NextResponse.json(
        { response: "session expired" },
        { status: 401 }
      );

    const body = await request.json();
    const userKey = body.userKey;

    if (!userKey) {
      return NextResponse.json(
        { error: "userKey is required" },
        { status: 400 }
      );
    }

    const client = await getClient();
    const db = client.db("Blog");

    const userCollection = db.collection("user");
    const communicationCollection = db.collection("communication");

    const user = await userCollection.findOne({ userKey: userKey });
    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 400 });
    }

    // Update all messages of this user to read: true
    const result = await communicationCollection.updateMany(
      { user: user._id, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json(
      {
        response: `Marked ${result.modifiedCount} message(s) as read for user:${user.name}`,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get message" },
      { status: 500 }
    );
  }
}
