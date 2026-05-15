import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = req.body as Record<string, any>;
  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const sheetId = process.env.GOOGLE_SHEET_ID;

  // Fallback: if Sheets is not configured, log the full payload and return success
  // so the form UX works. Data is recoverable from Vercel function logs.
  if (!clientEmail || !privateKey || !sheetId) {
    console.warn("[submit] Google Sheets not configured — logging payload:");
    console.log(JSON.stringify(payload));
    return res.status(200).json({ ok: true, warn: "sheets_not_configured" });
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const timestamp = payload.submittedAt
    ? new Date(payload.submittedAt as string).toLocaleString("es-MX", {
        timeZone: "America/Tijuana",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("es-MX", { timeZone: "America/Tijuana" });

  const row = [
    timestamp,
    String(payload.contactName ?? ""),
    String(payload.businessName ?? ""),
    String(payload.email ?? payload.phone ?? ""),
    JSON.stringify(payload),
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });
  } catch (err) {
    // Sheets call failed — log payload so it's recoverable, still return success
    console.error("[submit] Sheets append failed:", err);
    console.log("[submit] payload:", JSON.stringify(payload));
    return res.status(200).json({ ok: true, warn: "sheets_error" });
  }

  return res.status(200).json({ ok: true });
}
