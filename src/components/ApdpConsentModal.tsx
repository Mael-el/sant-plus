import React from "react";
import { ShieldCheck, Lock, FileText, Check, X } from "lucide-react";
import { Sante3DButton } from "./CommonComponents";

interface ApdpConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApdpConsentModal: React.FC<ApdpConsentModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border-t-4 border-[#00A86B] p-6 space-y-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7F0] border border-[#00A86B]/30 flex items-center justify-center text-[#007048]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[#1B362B] font-display">
                Protection des Données de Santé
              </h3>
              <p className="text-xs text-[#406354]">
                Conformité APDP & Code du Numérique Bénin
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

        <div className="space-y-3.5 text-xs text-[#406354] leading-relaxed bg-[#F0F9F4] p-4 rounded-xl border border-[#C8E6D5]">
          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#007048] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1B362B] block">Chiffrement AES-256 de bout en bout</strong>
              Vos antécédents, constantes vitales et ordonnances sont chiffrés. Seuls les praticiens ONMB expressément autorisés par votre NPI peuvent y accéder.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-[#007048] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1B362B] block">Cadre Légal & Agrément</strong>
              Traitement opéré en conformité avec la Loi n° 2017-20 portant Code du numérique en République du Bénin sous le contrôle de l'Autorité de Protection des Données Personnelles (APDP).
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#007048] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1B362B] block">Hébergement Souverain</strong>
              Toutes les données sont conservées sur les infrastructures du Datacenter National et supervisées par l'ASIN Bénin.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#C8E6D5]">
          <div className="text-[11px] font-semibold text-[#688A7C]">
            Agrément APDP n° BJ-2026-SANTE-089
          </div>
          <Sante3DButton
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-5 text-xs"
          >
            J'ai compris
          </Sante3DButton>
        </div>
      </div>
    </div>
  );
};
