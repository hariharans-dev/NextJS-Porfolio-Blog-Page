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
import { generateEmailPreview } from "@/lib/posts";
import { sub } from "date-fns";

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

    const client = await getClient();
    const db = client.db("Blog");

    const userCollection = db.collection("user");
    const mailCollection = db.collection("mail");

    const users = await userCollection
      .find({}, { projection: { _id: 0, email: 1, userKey: 1 } })
      .toArray();

    const hostHeader = request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") || "https";
    const origin = `${proto}://${hostHeader}`;
    var html = generateEmailPreview(origin);

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

    console.log(html);

    const BATCH_SIZE = 20;

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);

      // map each user to a Promise and await them in Promise.all
      await Promise.all(
        batch.map(async (user: any) => {
          const subject = "New Post from Hariharan";
          const text = "New post from your communication";
          const html = generateEmailPreview(); // or your html content

          // await sending mail
          await sendMail(user.email, subject, text, html);

          // await inserting into MongoDB
          await mailCollection.insertOne({
            userKey: user.userKey,
            from: "admin",
            subject,
            text,
            html,
            createdAt: new Date(),
          });
        })
      );
    }

    return NextResponse.json(
      { response: "mail sent successfully", count: users.length },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}
