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

export async function GET(request: Request) {
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

    const client = await getClient();
    const db = client.db("Blog");

    const userCollection = db.collection("user");

    const users = await userCollection
      .aggregate([
        {
          $lookup: {
            from: "mail",
            localField: "userKey",
            foreignField: "userKey",
            as: "mails",
          },
        },
        {
          $addFields: {
            hasMail: { $cond: [{ $gt: [{ $size: "$mails" }, 0] }, 1, 0] },
            latestMailDate: { $max: "$mails.createdAt" },
          },
        },
        {
          $sort: {
            hasMail: -1, // users with mail first
            latestMailDate: -1, // most recent mail first
          },
        },
        {
          $project: {
            _id: 0,
            mails: 0,
            createdAt: 0,
            latestMailDate: 0,
            hasMail: 0,
          },
        },
      ])
      .toArray();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get message" },
      { status: 500 }
    );
  }
}
