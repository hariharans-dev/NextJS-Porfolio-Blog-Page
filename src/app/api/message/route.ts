import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { sendMail } from "@/utilities/mail";

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

function generateUserKey() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const randomWord = () =>
    Array.from(
      { length: 3 },
      () => letters[Math.floor(Math.random() * letters.length)]
    ).join("");

  return `${randomWord()}-${randomWord()}-${randomWord()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;
    var userKey = body.userKey;

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required." },
        { status: 400 }
      );
    }

    const client = await getClient();
    const db = client.db("Blog");

    const userCollection = db.collection("user");
    const communicationCollection = db.collection("communication");
    const mailCollection = db.collection("mail");

    var user;

    if (userKey) {
      user = await userCollection.findOne({ userKey });
    }
    if (!user) {
      userKey = generateUserKey();
      const userResponse = await userCollection.insertOne({
        userKey,
        email,
        name,
        createdAt: new Date(),
      });

      const subject = "Thank you for chatting with me!";
      const text = "your first chat";
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #f9fafb;">
          <h2 style="color: #2563eb; text-align: center;">Thank You for Chatting with Me!</h2>
          <p style="font-size: 16px; text-align: center;">
            It was a pleasure interacting with you. To continue your chat on other devices, please use the chat key below:
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="display: inline-block; padding: 10px 20px; font-size: 18px; font-weight: bold; background-color: #2563eb; color: #fff; border-radius: 6px;">${userKey}</span>
          </div>
          <p style="font-size: 14px; color: #555; text-align: center;">
            Keep this key safe. It allows you to continue your conversation securely.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">
            © ${new Date().getFullYear()} Hariharan. All rights reserved.
          </p>
        </div>
      `;

      try {
        await sendMail(email, subject, text, htmlContent);
        await mailCollection.insertOne({
          userKey,
          from: "admin",
          subject,
          text,
          html: htmlContent,
          createdAt: new Date(),
        });
      } catch (error) {}
      user = { _id: userResponse.insertedId, name, email };
    }

    await communicationCollection.insertOne({
      user: user._id,
      from: "user",
      message,
      read: false,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, userKey }, { status: 201 });
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
    const userKey = searchParams.get("userKey");

    if (!userKey)
      return NextResponse.json(
        { error: "userKey is required" },
        { status: 400 }
      );

    const client = await getClient();
    const db = client.db("Blog");

    const userCollection = await db.collection("user");
    const communicationCollection = await db.collection("communication");

    const user = await userCollection.findOne({ userKey });
    if (!user)
      return NextResponse.json({ error: "user not found" }, { status: 400 });

    const communications = await communicationCollection
      .find({ user: user._id }, { projection: { _id: 0, user: 0 } })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json({ communications }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get message" },
      { status: 500 }
    );
  }
}
function send_Mail() {
  throw new Error("Function not implemented.");
}
