import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { verifyAuthKey } from "@/utilities/keySignAuthentication";
import {
  getGoogleAuthUrl,
  getGoogleAuthUrlForModify,
  getMailsFrom,
  getRefreshToken,
  sendMail,
} from "@/utilities/mail";

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

    const { searchParams } = new URL(request.url);
    const userKey = searchParams.get("userKey");

    if (!userKey) {
      return NextResponse.json(
        { error: "userKey is required" },
        { status: 400 }
      );
    }

    const client = await getClient();
    const db = client.db("Blog");

    const userCollection = db.collection("user");
    const mailCollection = db.collection("mail");

    var user;

    if (userKey) {
      user = await userCollection.findOne({ userKey });
    }
    if (!user) {
      return NextResponse.json({ response: "user not found" }, { status: 400 });
    }

    const messages = await getMailsFrom(String(user.email));

    const newMail = messages.map((msg) => ({
      userKey,
      from: "user",
      subject: msg.subject,
      text: msg.from,
      html: msg.body,
      createdAt: new Date(msg.date),
    }));

    if (newMail.length > 0) {
      await mailCollection.insertMany(newMail);
    }

    const mail = await mailCollection
      .find({ userKey }, { projection: { _id: 0 } })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({ mail }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
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
    var { userKey, subject, text, html } = body;

    if (!userKey || !html) {
      return NextResponse.json(
        { error: "userKey and html are required." },
        { status: 400 }
      );
    }

    const client = await getClient();
    const db = client.db("Blog");

    const userCollection = db.collection("user");
    const mailCollection = db.collection("mail");

    var user;

    if (userKey) {
      user = await userCollection.findOne({ userKey });
    }
    if (!user) {
      return NextResponse.json({ response: "user not found" }, { status: 400 });
    }

    html += `
    <br>
    <table style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
        <tr>
            <td>
            <p>Best regards,  </p>
            <strong style="font-size: 16px; color: #000;">Hariharan S</strong><br>
            <span style="color: #555;">Software Engineer | Business Enthusiast</span><br>
            ✉️ <a href="mailto:admim.developer@gmail.com" style="color:#1a73e8; text-decoration:none;">admim.developer@gmail.com</a><br>
            🌐 <a href="https://admim.cloud" style="color:#1a73e8; text-decoration:none;">admim.cloud</a>
            </td>
        </tr>
    </table>
    `;

    await sendMail(user.email, subject, text, html);

    await mailCollection.insertOne({
      userKey: user.userKey,
      from: "admin",
      subject,
      text,
      html,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { response: "mail sent successful" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
