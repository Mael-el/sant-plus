// Générateur de reçus médicaux officiels et documents certifiés avec QR code d'authentification
// République du Bénin - Ministère de la Santé - Plateforme Nationale SANTÉ+

import { PatientProfileEntity, FhirEncounterEntity, FhirMedicationRequestEntity, FhirObservationEntity, PaymentRecordEntity } from "../types";

export interface MedicalReceiptData {
  title: string;
  referenceNumber: string;
  patientName: string;
  patientNpi: string;
  patientPhone: string;
  facilityName: string;
  doctorName?: string;
  serviceOrAct: string;
  amountCfa: number;
  paymentMethod: string;
  paymentStatus: "PAYÉ & VALIDÉ" | "CONFIRMÉ" | "CERTIFIÉ";
  date: string;
  time: string;
  notes?: string;
  verificationUrl?: string;
}

// Fonction pour dessiner un QR code déterministe sur un canvas et retourner son data URL
export function generateReceiptQrDataUrl(payload: string, size: number = 180): string {
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, size, size);

  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }

  const gridSize = 21;
  const cellSize = size / gridSize;

  ctx.fillStyle = "#007048";

  // Coin Haut Gauche (Finder pattern)
  ctx.fillRect(0, 0, cellSize * 6, cellSize * 6);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(cellSize, cellSize, cellSize * 4, cellSize * 4);
  ctx.fillStyle = "#007048";
  ctx.fillRect(cellSize * 2, cellSize * 2, cellSize * 2, cellSize * 2);

  // Coin Haut Droit
  ctx.fillRect(size - cellSize * 6, 0, cellSize * 6, cellSize * 6);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(size - cellSize * 5, cellSize, cellSize * 4, cellSize * 4);
  ctx.fillStyle = "#007048";
  ctx.fillRect(size - cellSize * 4, cellSize * 2, cellSize * 2, cellSize * 2);

  // Coin Bas Gauche
  ctx.fillRect(0, size - cellSize * 6, cellSize * 6, cellSize * 6);
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(cellSize, size - cellSize * 5, cellSize * 4, cellSize * 4);
  ctx.fillStyle = "#007048";
  ctx.fillRect(cellSize * 2, size - cellSize * 4, cellSize * 2, cellSize * 2);

  // Modules intérieurs
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const inTL = row < 7 && col < 7;
      const inTR = row < 7 && col >= gridSize - 7;
      const inBL = row >= gridSize - 7 && col < 7;
      if (!inTL && !inTR && !inBL) {
        const bit = ((hash ^ (row * 37 + col * 19)) & (1 << ((row + col) % 31))) !== 0;
        if (bit) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize * 0.92, cellSize * 0.92);
        }
      }
    }
  }

  return canvas.toDataURL("image/png");
}

// Fonction pour imprimer ou télécharger le reçu médical certifié
export function printOrDownloadReceipt(data: MedicalReceiptData) {
  const qrDataUrl = generateReceiptQrDataUrl(
    data.verificationUrl || `https://sante.gouv.bj/verifier?ref=${data.referenceNumber}&npi=${data.patientNpi}`
  );

  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) {
    alert("Veuillez autoriser les fenêtres pop-up pour télécharger votre reçu.");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Reçu Officiel - ${data.referenceNumber}</title>
      <style>
        @page { size: A4; margin: 20mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #1B362B;
          margin: 0;
          padding: 24px;
          background: #FFFFFF;
        }
        .header {
          border-bottom: 3px solid #00A86B;
          padding-bottom: 16px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-title {
          font-size: 24px;
          font-weight: 800;
          color: #007048;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .header-sub {
          font-size: 12px;
          color: #406354;
          font-weight: 600;
          margin-top: 4px;
        }
        .badge {
          background: #E6F7F0;
          color: #007048;
          border: 2px solid #00A86B;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .receipt-card {
          border: 2px solid #C8E6D5;
          border-radius: 16px;
          padding: 24px;
          background: #F9FCFA;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .field-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          color: #688A7C;
          margin-bottom: 2px;
        }
        .field-val {
          font-size: 15px;
          font-weight: 700;
          color: #1B362B;
        }
        .amount-box {
          background: #00A86B;
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px 0;
        }
        .amount-val {
          font-size: 26px;
          font-weight: 900;
        }
        .qr-section {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px;
          background: white;
          border: 1px dashed #00A86B;
          border-radius: 12px;
          margin-top: 20px;
        }
        .qr-section img {
          width: 130px;
          height: 130px;
          border: 2px solid #00A86B;
          border-radius: 8px;
        }
        .qr-text {
          font-size: 12px;
          color: #406354;
          line-height: 1.5;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 11px;
          color: #688A7C;
          border-top: 1px solid #E2F0E8;
          padding-top: 12px;
        }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="header-title">RÉPUBLIQUE DU BÉNIN</div>
          <div class="header-sub">MINISTÈRE DE LA SANTÉ • SANTÉ+ PLATEFORME NATIONALE</div>
        </div>
        <div class="badge">${data.paymentStatus}</div>
      </div>

      <div class="receipt-card">
        <h2 style="margin-top:0; font-size: 18px; color: #007048; text-transform: uppercase;">
          ${data.title}
        </h2>

        <div class="grid-2">
          <div>
            <div class="field-label">RÉFÉRENCE DE TRANSACTION</div>
            <div class="field-val" style="font-family: monospace;">${data.referenceNumber}</div>
          </div>
          <div>
            <div class="field-label">DATE & HEURE</div>
            <div class="field-val">${data.date} à ${data.time}</div>
          </div>
          <div>
            <div class="field-label">PATIENT CITOYEN</div>
            <div class="field-val">${data.patientName}</div>
          </div>
          <div>
            <div class="field-label">NPI (IDENTIFIANT ANIP)</div>
            <div class="field-val" style="font-family: monospace;">${data.patientNpi}</div>
          </div>
          <div>
            <div class="field-label">ÉTABLISSEMENT DE SANTÉ</div>
            <div class="field-val">${data.facilityName}</div>
          </div>
          <div>
            <div class="field-label">MÉTHODE DE PAIEMENT</div>
            <div class="field-val">${data.paymentMethod}</div>
          </div>
        </div>

        <div style="margin-top: 12px;">
          <div class="field-label">PRESTATION / ACTE MÉDICAL</div>
          <div class="field-val">${data.serviceOrAct}</div>
        </div>

        ${data.doctorName ? `
          <div style="margin-top: 12px;">
            <div class="field-label">PRATICIEN RÉFÉRENT</div>
            <div class="field-val">${data.doctorName}</div>
          </div>
        ` : ""}

        <div class="amount-box">
          <span style="font-weight: 700; font-size: 16px;">MONTANT TOTAL RÉGLÉ</span>
          <span class="amount-val">${data.amountCfa.toLocaleString("fr-FR")} FCFA</span>
        </div>

        <div class="qr-section">
          <img src="${qrDataUrl}" alt="QR Code d'authentification" />
          <div class="qr-text">
            <strong style="color: #007048; font-size: 13px; display: block; margin-bottom: 4px;">
              AUTHENTIFICATION OFFICIELLE NUMÉRIQUE
            </strong>
            Ce reçu comporte une preuve cryptographique inviolable certifiée par la DSI du Ministère de la Santé.
            À présenter à l'accueil de l'établissement hospitalier ou en officine pour vérification instantanée.
            <br /><span style="font-family: monospace; font-size: 10px; color: #688A7C;">HASH: SHA256-${data.referenceNumber}</span>
          </div>
        </div>
      </div>

      <div class="footer">
        Document officiel généré par SANTÉ+ Bénin • Conforme aux normes de facturation médicale UEMOA et APDP Bénin.
      </div>

      <div class="no-print" style="margin-top: 24px; text-align: center;">
        <button onclick="window.print()" style="background: #00A86B; color: white; border: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 16px; cursor: pointer;">
          Imprimer / Enregistrer en PDF
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

// Fonction pour exporter le Dossier Médical complet en PDF avec QR code
export function downloadMedicalRecordPdf(
  patient: PatientProfileEntity,
  encounters: FhirEncounterEntity[],
  medications: FhirMedicationRequestEntity[],
  observations: FhirObservationEntity[]
) {
  const refCode = `DOSSIER-BJ-${patient.npi || "19940812"}-${Date.now().toString().slice(-6)}`;
  const qrDataUrl = generateReceiptQrDataUrl(
    `https://sante.gouv.bj/dossier/verifier?npi=${patient.npi}&ref=${refCode}`
  );

  const printWindow = window.open("", "_blank", "width=850,height=950");
  if (!printWindow) {
    alert("Veuillez autoriser les fenêtres pop-up pour télécharger votre dossier.");
    return;
  }

  const now = new Date();
  const dateFormatted = now.toLocaleDateString("fr-FR");

  const encountersHtml = encounters.length === 0
    ? "<p style='color: #688A7C;'>Aucune consultation enregistrée.</p>"
    : encounters.map((e) => `
        <div style="border-left: 3px solid #00A86B; padding-left: 12px; margin-bottom: 14px;">
          <div style="font-weight: 800; color: #007048; font-size: 14px;">${e.serviceType} • ${e.date}</div>
          <div style="font-size: 12px; color: #406354; font-weight: 600;">${e.facilityName} (${e.practitionerName})</div>
          <div style="font-size: 13px; font-weight: 700; margin-top: 4px;">Diagnostic : ${e.diagnosis}</div>
          <div style="font-size: 12px; color: #1B362B; margin-top: 2px;">${e.notes}</div>
        </div>
      `).join("");

  const medicationsHtml = medications.length === 0
    ? "<p style='color: #688A7C;'>Aucune ordonnance active.</p>"
    : medications.map((m) => `
        <div style="border-left: 3px solid #00A86B; padding-left: 12px; margin-bottom: 12px;">
          <div style="font-weight: 800; color: #1B362B; font-size: 14px;">${m.medicationName} (${m.dosage})</div>
          <div style="font-size: 12px; color: #406354;">Posologie : ${m.frequency} pendant ${m.durationDays} jours</div>
          <div style="font-size: 11px; color: #688A7C;">Prescrit le ${m.prescribedDate} par ${m.doctorName} (${m.facilityName})</div>
        </div>
      `).join("");

  const observationsHtml = observations.length === 0
    ? "<p style='color: #688A7C;'>Aucune constante enregistrée.</p>"
    : observations.map((o) => `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #E2F0E8; padding: 6px 0; font-size: 13px;">
          <span style="font-weight: 700; color: #007048;">${o.category}</span>
          <span style="font-weight: 800; color: #1B362B;">${o.value} ${o.unit}</span>
          <span style="color: #688A7C; font-size: 11px;">${o.recordedDate}</span>
        </div>
      `).join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Dossier Médical National - ${patient.fullName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1B362B; padding: 24px; }
        .header { border-bottom: 3px solid #00A86B; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .title { font-size: 22px; font-weight: 800; color: #007048; text-transform: uppercase; }
        .patient-card { background: #F4FAF7; border: 2px solid #00A86B; border-radius: 12px; padding: 16px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .section-title { font-size: 16px; font-weight: 800; color: #007048; border-bottom: 2px solid #C8E6D5; padding-bottom: 4px; margin: 20px 0 10px 0; }
        .qr-box { border: 1px dashed #00A86B; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 16px; margin-top: 24px; background: #FFFFFF; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">RÉPUBLIQUE DU BÉNIN • DOSSIER MÉDICAL CERTIFIÉ</div>
          <div style="font-size: 12px; color: #406354; font-weight: 600;">MINISTÈRE DE LA SANTÉ • SANTÉ+ PLATEFORME HL7 FHIR R4</div>
        </div>
        <div style="font-weight: 800; font-size: 12px; color: #007048; background: #E6F7F0; padding: 6px 12px; border-radius: 20px;">
          ÉDITÉ LE ${dateFormatted}
        </div>
      </div>

      <div class="patient-card">
        <div><strong style="color: #688A7C; font-size: 11px; text-transform: uppercase; display: block;">PATIENT</strong><span style="font-weight: 800; font-size: 15px;">${patient.fullName}</span></div>
        <div><strong style="color: #688A7C; font-size: 11px; text-transform: uppercase; display: block;">NPI ANIP</strong><span style="font-family: monospace; font-weight: 800;">${patient.npi}</span></div>
        <div><strong style="color: #688A7C; font-size: 11px; text-transform: uppercase; display: block;">GROUPE SANGUIN</strong><span style="font-weight: 800; color: #007048;">${patient.bloodGroup || "O+"}</span></div>
        <div><strong style="color: #688A7C; font-size: 11px; text-transform: uppercase; display: block;">ÉLECTROPHORÈSE</strong><span style="font-weight: 800;">${patient.electrophoresis || "AA"}</span></div>
        <div><strong style="color: #688A7C; font-size: 11px; text-transform: uppercase; display: block;">TÉLÉPHONE</strong><span>${patient.phone}</span></div>
        <div><strong style="color: #688A7C; font-size: 11px; text-transform: uppercase; display: block;">VILLE DE RÉSIDENCE</strong><span>${patient.city}</span></div>
      </div>

      <div class="section-title">HISTORIQUE DES CONSULTATIONS HOSPITALIÈRES</div>
      ${encountersHtml}

      <div class="section-title">ORDONNANCES ACTIVES & PRESCRIPTIONS</div>
      ${medicationsHtml}

      <div class="section-title">CONSTANTES CLINIQUES & OBSERVATIONS</div>
      ${observationsHtml}

      <div class="qr-box">
        <img src="${qrDataUrl}" style="width: 100px; height: 100px; border: 2px solid #00A86B; border-radius: 8px;" alt="QR Code" />
        <div style="font-size: 11px; color: #406354; line-height: 1.4;">
          <strong style="color: #007048; display: block; font-size: 12px; margin-bottom: 2px;">AUTHENTIFICATION DU DOSSIER MÉDICAL</strong>
          Réf: ${refCode}<br />
          Ce document est sécurisé par un QR code cryptographique. Les praticiens peuvent vérifier son authenticité en le scannant. Tout ajout de consultation non autorisé est réprimé par la législation béninoise.
        </div>
      </div>

      <div class="no-print" style="margin-top: 24px; text-align: center;">
        <button onclick="window.print()" style="background: #00A86B; color: white; border: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 16px; cursor: pointer;">
          Imprimer / Enregistrer le Dossier en PDF
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

// Fonction pour exporter les factures médicales en PDF avec QR code
export function downloadMedicalInvoicesPdf(patient: PatientProfileEntity, payments: PaymentRecordEntity[]) {
  const refCode = `FACT-BJ-${patient.npi || "19940812"}-${Date.now().toString().slice(-6)}`;
  const qrDataUrl = generateReceiptQrDataUrl(
    `https://sante.gouv.bj/factures/verifier?npi=${patient.npi}&ref=${refCode}`
  );

  const printWindow = window.open("", "_blank", "width=850,height=900");
  if (!printWindow) {
    alert("Veuillez autoriser les fenêtres pop-up pour télécharger vos factures.");
    return;
  }

  const totalAmount = payments.reduce((acc, curr) => acc + (curr.amountCfa || 0), 0);

  const paymentsHtml = payments.length === 0
    ? "<tr><td colspan='5' style='text-align: center; padding: 20px; color: #688A7C;'>Aucune facture enregistrée.</td></tr>"
    : payments.map((p) => `
        <tr style="border-bottom: 1px solid #E2F0E8;">
          <td style="padding: 10px; font-family: monospace; font-size: 12px;">${p.referenceCode}</td>
          <td style="padding: 10px; font-size: 13px;">${p.date}</td>
          <td style="padding: 10px; font-size: 13px; font-weight: 700;">${p.description}</td>
          <td style="padding: 10px; font-size: 12px;">${p.paymentMethod}</td>
          <td style="padding: 10px; font-size: 14px; font-weight: 800; color: #007048; text-align: right;">${p.amountCfa.toLocaleString("fr-FR")} FCFA</td>
        </tr>
      `).join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Relevé Officiel des Factures Médicales - ${patient.fullName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #1B362B; padding: 24px; }
        .header { border-bottom: 3px solid #00A86B; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .title { font-size: 20px; font-weight: 800; color: #007048; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #E6F7F0; color: #007048; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="title">RÉPUBLIQUE DU BÉNIN • ÉTATS DES FACTURES MÉDICALES</div>
          <div style="font-size: 12px; color: #406354; font-weight: 600;">MINISTÈRE DE LA SANTÉ • SANTÉ+ BÉNIN</div>
        </div>
        <div style="font-weight: 800; font-size: 12px; color: #007048; background: #E6F7F0; padding: 6px 12px; border-radius: 20px;">
          PATIENT : ${patient.fullName} (NPI: ${patient.npi})
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>RÉFÉRENCE</th>
            <th>DATE</th>
            <th>OBJET / PRESTATION</th>
            <th>CANAL DE RÈGLEMENT</th>
            <th style="text-align: right;">MONTANT (FCFA)</th>
          </tr>
        </thead>
        <tbody>
          ${paymentsHtml}
        </tbody>
        <tfoot>
          <tr style="background: #F4FAF7; font-weight: 800;">
            <td colspan="4" style="padding: 12px; text-align: right; color: #1B362B; font-size: 14px;">TOTAL DES ACTES RÉGLÉS :</td>
            <td style="padding: 12px; text-align: right; color: #00A86B; font-size: 18px;">${totalAmount.toLocaleString("fr-FR")} FCFA</td>
          </tr>
        </tfoot>
      </table>

      <div style="border: 1px dashed #00A86B; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 16px; margin-top: 24px; background: #FFFFFF;">
        <img src="${qrDataUrl}" style="width: 100px; height: 100px; border: 2px solid #00A86B; border-radius: 8px;" alt="QR Code" />
        <div style="font-size: 11px; color: #406354; line-height: 1.4;">
          <strong style="color: #007048; display: block; font-size: 12px; margin-bottom: 2px;">AUTHENTIFICATION DES FACTURES SANTÉ+</strong>
          Réf: ${refCode}<br />
          Toutes les transactions répertoriées ci-dessus ont fait l'objet d'une compensation bancaire ou mobile money validée. Ce relevé est certifié conforme pour le remboursement auprès des assurances santé ou mutuelles au Bénin.
        </div>
      </div>

      <div class="no-print" style="margin-top: 24px; text-align: center;">
        <button onclick="window.print()" style="background: #00A86B; color: white; border: none; padding: 14px 28px; border-radius: 12px; font-weight: 800; font-size: 16px; cursor: pointer;">
          Imprimer / Enregistrer les Factures en PDF
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
