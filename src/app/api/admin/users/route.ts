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
          // Lookup messages for each user
          $lookup: {
            from: "communication",
            localField: "_id",
            foreignField: "user",
            as: "messages",
          },
        },
        {
          // Add fields: read and lastMessageAt
          $addFields: {
            read: {
              $cond: [
                {
                  $eq: [
                    {
                      $size: {
                        $filter: {
                          input: "$messages",
                          as: "m",
                          cond: { $eq: ["$$m.read", false] },
                        },
                      },
                    },
                    0,
                  ],
                },
                true,
                false,
              ],
            },
            lastMessageAt: {
              $cond: [
                { $gt: [{ $size: "$messages" }, 0] },
                { $max: "$messages.createdAt" },
                null,
              ],
            },
          },
        },
        {
          // Sort: unread users first, then by latest message descending
          $sort: { read: 1, lastMessageAt: -1 },
        },
        {
          // Project only needed fields
          $project: {
            _id: 0,
            name: 1,
            email: 1,
            userKey: 1,
            read: 1,
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
