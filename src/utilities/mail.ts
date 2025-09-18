import nodemailer from "nodemailer";
import { gmail_v1, google } from "googleapis";
import { auth } from "googleapis/build/src/apis/abusiveexperiencereport";

export async function sendMail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Hari Blog." <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export async function getRefreshToken(authCode: string) {
  if (
    !process.env.CLIENT_ID ||
    !process.env.CLIENT_SECRET ||
    !process.env.CLIENT_CALLBACK
  ) {
    throw new Error("Missing CLIENT_ID, CLIENT_SECRET, or CLIENT_CALLBACK");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.CLIENT_CALLBACK
  );

  // Exchange authorization code for tokens
  const { tokens } = await oauth2Client.getToken(authCode);

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expiry_date,
    idToken: tokens.id_token,
    scope: tokens.scope,
  };
}

export function getGoogleAuthUrl() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.CLIENT_CALLBACK
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.modify"],
  });

  return authUrl; // You can also redirect directly: res.redirect(authUrl)
}

export function getGoogleAuthUrlForModify(): string {
  const { CLIENT_ID, CLIENT_SECRET, CLIENT_CALLBACK } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET || !CLIENT_CALLBACK) {
    throw new Error(
      "Missing environment variables: CLIENT_ID, CLIENT_SECRET, or CLIENT_CALLBACK"
    );
  }

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    CLIENT_CALLBACK
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", // Required to get a refresh token
    prompt: "consent", // Force Google to show consent again
    scope: ["https://www.googleapis.com/auth/gmail.modify"], // Read + modify emails
  });

  return authUrl;
}

export interface GmailMessage {
  id: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  body: string; // full message content
}

function getMessageBody(message: gmail_v1.Schema$Message): string {
  const decode = (data?: string) =>
    data ? Buffer.from(data, "base64").toString("utf-8") : "";

  // If message is simple (not multipart)
  if (message.payload?.body?.data) {
    return decode(message.payload.body.data);
  }

  // Multipart messages
  const parts = message.payload?.parts || [];
  for (const part of parts) {
    if (part.mimeType === "text/plain" && part.body?.data) {
      return decode(part.body.data);
    }
    if (part.mimeType === "text/html" && part.body?.data) {
      const html = decode(part.body.data);
      return html.replace(/<[^>]+>/g, ""); // strip HTML tags
    }
  }

  return "";
}

export async function getMailsFrom(sender: string): Promise<GmailMessage[]> {
  if (
    !process.env.CLIENT_ID ||
    !process.env.CLIENT_SECRET ||
    !process.env.CLIENT_CALLBACK
  ) {
    throw new Error("Missing CLIENT_ID, CLIENT_SECRET, or CLIENT_CALLBACK");
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.CLIENT_CALLBACK
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.CLIENT_REFRESH_TOKEN,
  });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const res = await gmail.users.messages.list({
    userId: "me",
    q: `is:unread from:${sender}`,
  });

  const messages: GmailMessage[] = [];

  if (res.data.messages && res.data.messages.length > 0) {
    for (const msg of res.data.messages) {
      if (!msg.id) continue;

      const fullMsg: gmail_v1.Schema$Message = (
        await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full", // fetch full message content
        })
      ).data;

      const headers = fullMsg.payload?.headers ?? [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
          ?.value ?? "";

      messages.push({
        id: msg.id,
        snippet: fullMsg.snippet ?? "",
        subject: getHeader("Subject"),
        from: getHeader("From"),
        date: getHeader("Date"),
        body: getMessageBody(fullMsg), // full message content
      });

      // Mark as read
      await gmail.users.messages.modify({
        userId: "me",
        id: msg.id,
        requestBody: {
          removeLabelIds: ["UNREAD"],
        },
      });
    }
  }

  return messages;
}

// const url = getGoogleAuthUrl();
// console.log("Visit this URL in browser:", url);

// const url = getGoogleAuthUrlForModify();
// console.log("Visit this URL in browser:", url);

// const refreshToken = await getRefreshToken(
//   "4/0AVMBsJivhbcdEaCtPuBEOvZbMbekIWtliJfR8fVFoCc-U7rTs56hbYPV0TrCOlY2Qla_Jg"
// );
// console.log(refreshToken);
