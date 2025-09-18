import { NextResponse } from "next/server";
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userKey = searchParams.get("userKey");

    if (!userKey)
      return NextResponse.json(
        { error: "userKey is required" },
        { status: 400 }
      );

    const client = await getClient();
    const db = client.db("Blog");

    const userCollection = await db.collection("user");
    const user = await userCollection.findOne({ userKey });

    if (!user)
      return NextResponse.json({ error: "user not found" }, { status: 400 });

    return NextResponse.json(
      { name: user.name, email: user.email },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get message" },
      { status: 500 }
    );
  }
}
