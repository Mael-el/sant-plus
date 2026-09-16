import React, { useState } from "react";
import { QrCode, ShieldCheck, CheckCircle2, FileCheck, X, Copy, Check } from "lucide-react";
import { Sante3DButton } from "./CommonComponents";

interface DigitalPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicationName?: string;
  dosage?: string;
  doctorName?: string;
  doctorLicense?: string;
}

export const DigitalPrescriptionModal: React.FC<DigitalPrescriptionModalProps> = ({
  isOpen,
  onClose,
  medicationName = "Coartem Dispersible 20/120mg",
  dosage = "1 comprimé matin et soir pendant 3 jours",
  doctorName = "Dr. Dossou-Yovo Chantal",
  doctorLicense = "ONMB-BJ-2025-3108",
}) => {
  const [copied, setCopied] = useState(false);
  const prescriptionId = "ORD-2026-0916-4421";
  const digitalHash = "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(digitalHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border-t-4 border-[#00A86B] p-6 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7F0] border border-[#00A86B]/30 flex items-center justify-center text-[#007048]">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[#1B362B] font-display">
                Ordonnance Sécurisée ONMB
              </h3>
              <p className="text-xs text-[#406354]">
                Certificat de validité pharmaceutique
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CADRE QR CODE & IDENTITÉ MÉDICALE */}
        <div className="bg-[#F0F9F4] border border-[#C8E6D5] rounded-xl p-4 text-center space-y-3">
          <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border-2 border-[#00A86B] flex items-center justify-center shadow-xs">
            {/* Simulation de QR Code officiel de santé avec emblème vert */}
            <div className="w-full h-full border border-dashed border-[#00A86B]/40 rounded-lg flex flex-col items-center justify-center p-2 text-[#007048]">
              <QrCode className="w-16 h-16 text-[#007048]" />
              <span className="text-[9px] font-bold mt-1 font-mono">SCAN PHARMACIE</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="font-mono text-xs font-bold text-[#007048] bg-white px-2.5 py-1 rounded-md border border-[#C8E6D5] inline-block">
              {prescriptionId}
            </span>
            <p className="font-bold text-sm text-[#1B362B]">{medicationName}</p>
            <p className="text-xs text-[#406354]">{dosage}</p>
          </div>
        </div>

        {/* DÉTAILS PRATICIEN & CACHET NUMÉRIQUE */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-[#C8E6D5]/60">
            <span className="text-[#406354]">Praticien Prescripteur</span>
            <span className="font-bold text-[#1B362B]">{doctorName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#C8E6D5]/60">
            <span className="text-[#406354]">Licence Ordre (ONMB)</span>
            <span className="font-mono font-bold text-[#007048]">{doctorLicense}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#C8E6D5]/60">
            <span className="text-[#406354]">Statut Délivery</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Valide en officine
            </span>
          </div>
        </div>

        {/* HASH SHA-256 */}
        <div className="bg-[#E6F7F0]/60 p-2.5 rounded-lg border border-[#C8E6D5] flex items-center justify-between text-[10px]">
          <div className="truncate mr-2">
            <span className="font-bold text-[#007048] block">Signature Numérique SHA-256 :</span>
            <span className="font-mono text-[#406354]">{digitalHash.slice(0, 32)}...</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 bg-white hover:bg-neutral-100 rounded-md border border-[#C8E6D5] text-[#007048] shrink-0"
            title="Copier le hash"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="pt-2">
          <Sante3DButton
            type="button"
            onClick={onClose}
            className="w-full min-h-[42px] text-xs"
          >
            Fermer le certificat
          </Sante3DButton>
        </div>
      </div>
    </div>
  );
};
