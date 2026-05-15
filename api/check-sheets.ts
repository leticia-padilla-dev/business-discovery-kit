import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.ADMIN_DEBUG_TOKEN;
  if (!token || req.headers.authorization !== `Bearer ${token}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const results: Record<string, string> = {};

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL ?? "";
  const rawKey = process.env.GOOGLE_PRIVATE_KEY ?? "";
  const sheetId = process.env.GOOGLE_SHEET_ID ?? "";

  results.GOOGLE_CLIENT_EMAIL = clientEmail ? "✅ present" : "❌ missing";
  results.GOOGLE_PRIVATE_KEY = rawKey ? "✅ present" : "❌ missing";
  results.GOOGLE_SHEET_ID = sheetId ? "✅ present" : "❌ missing";

  if (!clientEmail || !rawKey || !sheetId) {
    return res.status(200).json({ status: "missing_env", results });
  }

  const privateKey = rawKey.replace(/\\n/g, "\n");
  results.key_pem_header = privateKey.includes("-----BEGIN PRIVATE KEY-----")
    ? "✅ PEM header found"
    : "❌ PEM header NOT found — key may be malformed";

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

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    const sheetNames = meta.data.sheets?.map((s) => s.properties?.title) ?? [];
    results.sheet_access = "✅ Sheet accessible";
    results.sheet1_exists = sheetNames.includes("Sheet1")
      ? "✅ Tab 'Sheet1' found"
      : `❌ Tab 'Sheet1' NOT found — found ${sheetNames.length} tab(s)`;
  } catch (e) {
    results.sheet_access = `❌ Cannot access sheet: ${(e as Error).message}`;
    return res.status(200).json({ status: "sheet_error", results });
  }

  return res.status(200).json({ status: "ok", results });
}
