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

  // Extract key operational columns from nested answers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ans = (typeof payload.answers === "object" && payload.answers ? payload.answers : {}) as Record<string, Record<string, any>>;
  const pick = (section: string, key: string) => ans[section]?.[key] ?? "";
  const joinArr = (v: unknown) =>
    Array.isArray(v) ? v.filter(Boolean).join(", ") : String(v ?? "");

  const row = [
    timestamp,                                              // A
    String(payload.contactName ?? ""),                     // B
    String(payload.businessName ?? ""),                    // C
    String(payload.email ?? payload.phone ?? ""),          // D
    JSON.stringify(payload),                               // E — full payload preserved
    String(pick("general", "city")),                       // F ciudad
    joinArr(pick("products", "brands_managed")),           // G marcas
    joinArr(pick("priorities", "main_priorities")),        // H prioridades
    joinArr(pick("currentProblems", "first_improvement")), // I primer_dolor
    String(pick("digitalLevel", "digital_comfort")),       // J nivel_digital
    joinArr(pick("orders", "order_channel")),              // K canales_pedido
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Sheet1!A:K",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });

  // Send confirmation email — failure must not break the Sheets save
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;
  const recipientEmail = typeof payload.email === "string" ? payload.email.trim() : null;

  const summary = buildHumanSummary(payload as unknown as FormPayload);

  if (resendKey && fromEmail && recipientEmail) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: fromEmail,
        to: recipientEmail,
        subject: "Resumen de tu diagnóstico digital",
        html: summary.html,
      });
    } catch (e) {
      console.error("Email send failed (non-fatal):", e);
    }
  }

  // Send internal lead notification — failure must not break the response
  const internalEmail = process.env.INTERNAL_NOTIFICATION_EMAIL;

  if (resendKey && fromEmail && internalEmail) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: fromEmail,
        to: internalEmail,
        subject: `Nuevo diagnóstico recibido — ${String(payload.businessName ?? "sin nombre")}`,
        text: summary.text,
      });
    } catch (e) {
      console.error("Internal notification failed (non-fatal):", e);
    }
  }

  return res.status(200).json({ ok: true });
}
