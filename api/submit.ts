import type { VercelRequest, VercelResponse } from "@vercel/node";
import { google } from "googleapis";
import { buildHumanSummary, type FormPayload } from "../src/lib/formExport";

async function sendEmail(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
}): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      subject: params.subject,
      ...(params.html ? { html: params.html } : { text: params.text }),
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log("[submit] request received");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload = req.body as Record<string, any>;
  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ error: "Invalid payload" });
  }
  console.log("[submit] payload validated");

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
  console.log("[submit] auth created");

  const sheets = google.sheets({ version: "v4", auth });
  console.log("[submit] sheets client created");

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
  console.log("[submit] row prepared", { rowLength: row.length });

  try {
    console.log("[submit] before sheets append");
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A:K",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });
    console.log("[submit] sheets append ok");
  } catch (e) {
    console.error("[submit] sheets append failed", e);
    return res.status(500).json({
      ok: false,
      stage: "sheets_append",
    });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;

  if (resendKey && fromEmail) {
    let summary: { html: string; text: string } | null = null;

    try {
      console.log("[submit] before buildHumanSummary");
      summary = buildHumanSummary(payload as unknown as FormPayload);
      console.log("[submit] summary built");
    } catch (e) {
      console.error("[submit] summary build failed", e);
    }

    const recipientEmail = typeof payload.email === "string" ? payload.email.trim() : null;
    const internalEmail = process.env.INTERNAL_NOTIFICATION_EMAIL;

    if (summary && recipientEmail) {
      try {
        console.log("[submit] before client email");
        await sendEmail({
          apiKey: resendKey,
          from: fromEmail,
          to: recipientEmail,
          subject: "Resumen de tu diagnóstico digital",
          html: summary.html,
        });
        console.log("[submit] client email ok");
      } catch (e) {
        console.error("[submit] client email failed", e);
      }
    }

    if (summary && internalEmail) {
      try {
        console.log("[submit] before internal email");
        await sendEmail({
          apiKey: resendKey,
          from: fromEmail,
          to: internalEmail,
          subject: `Nuevo diagnóstico recibido — ${String(payload.businessName ?? "sin nombre")}`,
          text: summary.text,
        });
        console.log("[submit] internal email ok");
      } catch (e) {
        console.error("[submit] internal email failed", e);
      }
    }
  }

  console.log("[submit] returning 200");
  return res.status(200).json({ ok: true });
}
