// =====================================================================
// ROUTEUR DE WEBHOOKS RÉELS SANTÉ+ BÉNIN
// 1. Webhook MTN Mobile Money Bénin (HMAC SHA-256)
// 2. Webhook Moov Money Bénin (HMAC SHA-256 via agrégateur)
// 3. Webhook Breez / LNbits (Lightning Network)
// =====================================================================

import { Router, Request, Response } from "express";
import crypto from "node:crypto";
import { PaymentService } from "../services/paymentService.ts";
import { NotificationService } from "../services/notificationService.ts";

export const webhookRouter = Router();

/**
 * Vérification d'une signature HMAC SHA-256
 */
function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  const computed = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(computed, "hex"));
  } catch {
    return signature === computed;
  }
}

// ---------------------------------------------------------------------
// 1. WEBHOOK MTN MOBILE MONEY BÉNIN
// ---------------------------------------------------------------------
webhookRouter.post("/mtn", async (req: Request, res: Response) => {
  const signature = (req.headers["x-signature"] || req.headers["x-callback-signature"]) as string;
  const secret = process.env.MTN_WEBHOOK_SECRET || "mtn_webhook_secret_key_benin_2026";
  const rawBody = JSON.stringify(req.body);

  console.log("[WEBHOOK-MTN] Notification reçue:", req.body);

  // Vérification de signature si fournie
  if (signature) {
    const isValid = verifyHmacSignature(rawBody, signature, secret);
    if (!isValid) {
      console.warn("[WEBHOOK-MTN] Signature HMAC invalide rejetée.");
      return res.status(401).json({ error: "Invalid HMAC signature" });
    }
  }

  const { externalId, referenceId, status } = req.body;
  const txId = externalId || referenceId || req.body.financialTransactionId;

  if (!txId) {
    return res.status(400).json({ error: "Missing transaction identifier" });
  }

  const processed = PaymentService.processWebhookPayment(txId, status || "SUCCESSFUL", req.body);

  if (processed) {
    console.log(`[WEBHOOK-MTN] Transaction ${txId} validée et enregistrée.`);
  }

  return res.status(200).json({ status: "SUCCESS", transactionId: txId });
});

// ---------------------------------------------------------------------
// 2. WEBHOOK MOOV MONEY (BÉNIN)
// ---------------------------------------------------------------------
webhookRouter.post("/moov", async (req: Request, res: Response) => {
  const signature = (req.headers["x-token"] || req.headers["c-token"]) as string;
  const secret = process.env.MOOV_SECRET_KEY || "moov_webhook_secret_key_benin_2026";
  const rawBody = JSON.stringify(req.body);

  console.log("[WEBHOOK-MOOV] Notification reçue:", req.body);

  if (signature) {
    const isValid = verifyHmacSignature(rawBody, signature, secret);
    if (!isValid) {
      console.warn("[WEBHOOK-MOOV] Signature HMAC invalide rejetée.");
      return res.status(401).json({ error: "Invalid HMAC token" });
    }
  }

  const { cpm_trans_id, transaction_id, cpm_result } = req.body;
  const txId = transaction_id || cpm_trans_id;

  if (!txId) {
    return res.status(400).json({ error: "Missing Moov transaction ID" });
  }

  const status = cpm_result === "00" ? "SUCCESSFUL" : req.body.status || "PENDING";
  PaymentService.processWebhookPayment(txId, status, req.body);

  return res.status(200).json({ status: "RECEIVED", transactionId: txId });
});

// ---------------------------------------------------------------------
// 3. WEBHOOK BREEZ / LNBITS (LIGHTNING NETWORK)
// ---------------------------------------------------------------------
webhookRouter.post("/breez", async (req: Request, res: Response) => {
  console.log("[WEBHOOK-BREEZ] Notification Lightning reçue:", req.body);

  const { payment_hash, extra } = req.body;
  const txId = extra?.transaction_id || req.body.transaction_id;

  if (payment_hash) {
    // Si transaction_id n'est pas fourni dans extra, retrouver la transaction par payment_hash
    const status = "SUCCESSFUL";
    if (txId) {
      PaymentService.processWebhookPayment(txId, status, req.body);
    }
  }

  return res.status(200).json({ status: "PAID", payment_hash });
});
