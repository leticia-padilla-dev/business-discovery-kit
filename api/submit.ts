import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";
import { Resend } from "resend";
import { buildHumanSummary, type FormPayload } from "../src/lib/formExport";

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

  if (!clientEmail || !privateKey || !sheetId) {
    console.error("Missing env vars: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY or GOOGLE_SHEET_ID");
    return res.status(500).json({ error: "Server misconfiguration" });
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

  // Extract key operational columns from nested answers (F:K)
  const ans = (
    typeof payload.answers === "object" && payload.answers ? payload.answers : {}
  ) as Record<string, Record<string, unknown>>;
  const pick = (section: string, key: string) => ans[section]?.[key] ?? "";
  const joinArr = (v: unknown) =>
    Array.isArray(v) ? v.filter(Boolean).join(", ") : String(v ?? "");

  const row = [
    timestamp,
    String(payload.contactName ?? ""),
    String(payload.businessName ?? ""),
    String(payload.email ?? payload.phone ?? ""),
    JSON.stringify(payload),
    String(pick("general", "city")),
    joinArr(pick("products", "brands_managed")),
    joinArr(pick("priorities", "main_priorities")),
    joinArr(pick("currentProblems", "first_improvement")),
    String(pick("digitalLevel", "digital_comfort")),
    joinArr(pick("orders", "order_channel")),
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A:K",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });

  // Email notifications — any failure here must not affect the 200 response
  try {
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;

    if (resendKey && fromEmail) {
      const resend = new Resend(resendKey);
      const summary = buildHumanSummary(payload as unknown as FormPayload);
      const recipientEmail = typeof payload.email === "string" ? payload.email.trim() : null;
      const internalEmail = process.env.INTERNAL_NOTIFICATION_EMAIL;

      if (recipientEmail) {
        await resend.emails.send({
          from: fromEmail,
          to: recipientEmail,
          subject: "Resumen de tu diagnóstico digital",
          html: summary.html,
        });
      }

      if (internalEmail) {
        await resend.emails.send({
          from: fromEmail,
          to: internalEmail,
          subject: `Nuevo diagnóstico recibido — ${String(payload.businessName ?? "sin nombre")}`,
          text: summary.text,
        });
      }
    }
  } catch (e) {
    console.error("Email notification failed (non-fatal):", e);
  }

  return res.status(200).json({ ok: true });
}
