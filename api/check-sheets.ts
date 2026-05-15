import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const results: Record<string, string> = {};

  // 1. Check env vars presence
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL ?? "";
  const rawKey = process.env.GOOGLE_PRIVATE_KEY ?? "";
  const sheetId = process.env.GOOGLE_SHEET_ID ?? "";

  results.GOOGLE_CLIENT_EMAIL = clientEmail
    ? `✅ set (${clientEmail})`
    : "❌ missing";

  results.GOOGLE_PRIVATE_KEY = rawKey
    ? `✅ set (${rawKey.length} chars, starts: ${rawKey.slice(0, 28).replace(/\n/g, "\\n")})`
    : "❌ missing";

  results.GOOGLE_SHEET_ID = sheetId ? `✅ set (${sheetId})` : "❌ missing";

  if (!clientEmail || !rawKey || !sheetId) {
    return res.status(200).json({ status: "missing_env", results });
  }

  // 2. Normalize private key (handle literal \n)
  const privateKey = rawKey.replace(/\\n/g, "\n");
  results.key_normalized = privateKey.includes("-----BEGIN PRIVATE KEY-----")
    ? "✅ PEM header found"
    : "❌ PEM header NOT found — key may be malformed";

  // 3. Try auth
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    await auth.getClient();
    results.auth = "✅ Google auth OK";
  } catch (e) {
    results.auth = `❌ Auth failed: ${(e as Error).message}`;
    return res.status(200).json({ status: "auth_error", results });
  }

  // 4. Try reading Sheet metadata
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetNames = meta.data.sheets?.map((s) => s.properties?.title) ?? [];
    results.sheet_access = `✅ Sheet accessible — tabs: ${sheetNames.join(", ")}`;
    results.sheet1_exists = sheetNames.includes("Sheet1")
      ? "✅ Tab 'Sheet1' found"
      : `❌ Tab 'Sheet1' NOT found — existing tabs: ${sheetNames.join(", ")}`;
  } catch (e) {
    results.sheet_access = `❌ Cannot access sheet: ${(e as Error).message}`;
    return res.status(200).json({ status: "sheet_error", results });
  }

  return res.status(200).json({ status: "ok", results });
}
