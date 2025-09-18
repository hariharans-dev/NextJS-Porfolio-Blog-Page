import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { verifyAuthKey } from "@/utilities/keySignAuthentication";

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
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
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
    const { userKey, message } = body;

    if (!userKey || !message) {
      return NextResponse.json(
        { error: "userKey and message are required." },
        { status: 400 }
      );
    }

    const client = await getClient();
    const db = client.db("Blog");

    const userCollection = db.collection("user");
    const communicationCollection = db.collection("communication");

    var user;

    if (userKey) {
      user = await userCollection.findOne({ userKey });
    }
    if (!user) {
      return NextResponse.json({ response: "user not found" }, { status: 400 });
    }

    await communicationCollection.insertOne({
      user: user._id,
      form: "admin",
      message,
      read: true,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
