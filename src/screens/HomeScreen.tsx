import React, { useState } from "react";
import {
  Bell,
  Download,
  Share2,
  FolderHeart,
  FileText,
  Calendar,
  CreditCard,
  Droplet,
  Users,
  MessageSquare,
  AlertCircle,
  Check,
  X,
  PhoneCall,
  Building2,
  MapPin,
  Stethoscope,
} from "lucide-react";
import {
  SimulatedQrCodeView,
} from "../components/CommonComponents";
import { ApdpConsentModal } from "../components/ApdpConsentModal";
import { DigitalPrescriptionModal } from "../components/DigitalPrescriptionModal";
import {
  PatientProfileEntity,
  FhirEncounterEntity,
  FhirMedicationRequestEntity,
  FhirObservationEntity,
  SanteScreen,
} from "../types";

interface HomeScreenProps {
  patient: PatientProfileEntity;
  encounters: FhirEncounterEntity[];
  medications: FhirMedicationRequestEntity[];
  observations: FhirObservationEntity[];
  onNavigate: (screen: SanteScreen) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  patient,
  encounters,
  medications,
  observations,
  onNavigate,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showUrgenceModal, setShowUrgenceModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [showApdpModal, setShowApdpModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  // Extraire le prénom pour "Bonjour, Jean"
  const firstName = patient.fullName
    ? patient.fullName.split(" ")[0]
    : "Jean";

  const qrPayload = `SANTE_BJ_PATIENT:${patient.npi || "1994081290123456"}:${patient.fullName}`;

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://sante.bj/patient/${patient.npi || "1994081290123456"}`);
    }
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-10">
      {/* En-tête : SANTÉ+ et Salutation */}
      <div className="flex items-center justify-between bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs">
        <div>
          <span className="text-sm font-bold text-[#00A86B] tracking-wider uppercase block">
            SANTÉ+
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B362B] font-display">
            Bonjour, {firstName}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowNotifModal(true)}
          className="relative w-14 h-14 rounded-2xl bg-[#E6F7F0] border border-[#C8E6D5] text-[#007048] flex items-center justify-center hover:bg-[#D6F2E5] transition-colors"
          title="Notifications"
        >
          <Bell className="w-7 h-7" />
          <span className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-[#00A86B] ring-2 ring-white" />
        </button>
      </div>

      {/* 1. MON QR CODE */}
      <div className="bg-white border-2 border-[#00A86B] rounded-2xl p-6 shadow-sm text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-[#007048] uppercase tracking-wide font-display mb-4">
          MON QR CODE
        </h2>

        <div className="flex justify-center my-3">
          <SimulatedQrCodeView dataPayload={qrPayload} size={200} />
        </div>

        <p className="text-lg font-mono text-[#406354] font-bold mt-2">
          {patient.npi || "1994 0812 9012 3456"}
        </p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            type="button"
            onClick={handleDownload}
            className="min-h-[64px] bg-[#E6F7F0] border-2 border-[#00A86B] text-[#007048] hover:bg-[#D6F2E5] font-bold text-xl rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-6 h-6 text-[#00A86B]" />
                <span>Téléchargé</span>
              </>
            ) : (
              <>
                <Download className="w-6 h-6" />
                <span>Télécharger</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="min-h-[64px] bg-[#E6F7F0] border-2 border-[#00A86B] text-[#007048] hover:bg-[#D6F2E5] font-bold text-xl rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            {shareSuccess ? (
              <>
                <Check className="w-6 h-6 text-[#00A86B]" />
                <span>Copié</span>
              </>
            ) : (
              <>
                <Share2 className="w-6 h-6" />
                <span>Partager</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. SECTION PRIORITAIRE : HÔPITAUX ET PHARMACIES DU BÉNIN */}
      <div className="bg-white border-2 border-[#00A86B] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] border border-[#00A86B] text-[#007048] flex items-center justify-center shrink-0">
            <Building2 className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#00A86B] uppercase tracking-wider">
                RÉSEAU NATIONAL DE SANTÉ
              </span>
              <span className="text-[11px] font-extrabold bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full">
                70 de garde
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B362B] font-display">
              Hôpitaux et Pharmacies
            </h2>
            <p className="text-sm text-[#406354]">
              Carte interactive, pharmacies de garde ouvertes, numéros directs et itinéraires
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate(SanteScreen.IASO_MAP)}
          className="w-full sm:w-auto min-h-[64px] px-8 bg-[#00A86B] hover:bg-[#00965F] text-white text-xl font-bold rounded-2xl flex items-center justify-center gap-3 shadow-sm transition-all active:scale-98 shrink-0"
        >
          <MapPin className="w-6 h-6" />
          <span>Ouvrir la carte</span>
        </button>
      </div>

      {/* 3. GRILLE DE CARTES 3 COLONNES - ACTIONS SIMPLES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* DOSSIER */}
        <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] text-[#007048] flex items-center justify-center mb-3">
            <FolderHeart className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-bold text-[#1B362B] font-display mb-4">
            DOSSIER
          </h3>
          <button
            type="button"
            onClick={() => onNavigate(SanteScreen.DOSSIER)}
            className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-xl font-bold rounded-2xl flex items-center justify-center shadow-xs transition-all active:scale-98"
          >
            Voir
          </button>
        </div>

        {/* ASSISTANCE MÉDICALE (Remplaçant Ordonnances) */}
        <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] text-[#007048] flex items-center justify-center mb-3">
            <Stethoscope className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-bold text-[#1B362B] font-display mb-4">
            ASSISTANCE MÉDICALE
          </h3>
          <button
            type="button"
            onClick={() => onNavigate(SanteScreen.TRIAGE_AI)}
            className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-xl font-bold rounded-2xl flex items-center justify-center shadow-xs transition-all active:scale-98"
          >
            Consulter
          </button>
        </div>

        {/* RENDEZ-VOUS */}
        <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] text-[#007048] flex items-center justify-center mb-3">
            <Calendar className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-bold text-[#1B362B] font-display mb-4">
            RENDEZ-VOUS
          </h3>
          <button
            type="button"
            onClick={() => onNavigate(SanteScreen.APPOINTMENTS)}
            className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-xl font-bold rounded-2xl flex items-center justify-center shadow-xs transition-all active:scale-98"
          >
            Prendre RDV
          </button>
        </div>

        {/* PAIEMENT */}
        <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] text-[#007048] flex items-center justify-center mb-3">
            <CreditCard className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-bold text-[#1B362B] font-display mb-4">
            PAIEMENT
          </h3>
          <button
            type="button"
            onClick={() => onNavigate(SanteScreen.PAYMENTS)}
            className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-xl font-bold rounded-2xl flex items-center justify-center shadow-xs transition-all active:scale-98"
          >
            Payer
          </button>
        </div>

        {/* DON DE SANG */}
        <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] text-[#007048] flex items-center justify-center mb-3">
            <Droplet className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-bold text-[#1B362B] font-display mb-4">
            DON DE SANG
          </h3>
          <button
            type="button"
            onClick={() => onNavigate(SanteScreen.BLOOD_BANK)}
            className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-xl font-bold rounded-2xl flex items-center justify-center shadow-xs transition-all active:scale-98"
          >
            Donner
          </button>
        </div>

        {/* HÔPITAUX DU BÉNIN */}
        <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs flex flex-col justify-between items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] text-[#007048] flex items-center justify-center mb-3">
            <Building2 className="w-9 h-9" />
          </div>
          <h3 className="text-xl font-bold text-[#1B362B] font-display mb-4">
            HÔPITAUX DU BÉNIN
          </h3>
          <button
            type="button"
            onClick={() => onNavigate(SanteScreen.HOSPITALS)}
            className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-xl font-bold rounded-2xl flex items-center justify-center shadow-xs transition-all active:scale-98"
          >
            Consulter
          </button>
        </div>
      </div>

      {/* 3. ASSISTANT */}
      <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs text-center">
        <h3 className="text-xl font-bold text-[#007048] font-display mb-3">
          ASSISTANT
        </h3>
        <button
          type="button"
          onClick={() => onNavigate(SanteScreen.TRIAGE_AI)}
          className="w-full min-h-[64px] bg-[#E6F7F0] border-2 border-[#00A86B] text-[#007048] hover:bg-[#D6F2E5] text-xl font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-98"
        >
          <MessageSquare className="w-7 h-7" />
          <span>Poser une question</span>
        </button>
      </div>

      {/* 4. URGENCE (BOUTON TRÈS GRAND) */}
      <button
        type="button"
        onClick={() => setShowUrgenceModal(true)}
        className="w-full min-h-[72px] bg-[#007048] hover:bg-[#005a39] text-white text-2xl font-black rounded-2xl flex items-center justify-center gap-3 shadow-md transition-all active:scale-98 select-none"
      >
        <AlertCircle className="w-8 h-8 text-white animate-pulse" />
        <span>URGENCE (SAMU 15)</span>
      </button>

      {/* 5. CERTIFICATION & SÉCURITÉ NATIONALE */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={() => setShowPrescriptionModal(true)}
          className="min-h-[56px] px-3 bg-white border border-[#C8E6D5] hover:border-[#00A86B] rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#007048] shadow-xs transition-colors"
        >
          <FileText className="w-4 h-4 text-[#00A86B]" />
          <span>Ordonnance Sécurisée</span>
        </button>

        <button
          type="button"
          onClick={() => setShowApdpModal(true)}
          className="min-h-[56px] px-3 bg-white border border-[#C8E6D5] hover:border-[#00A86B] rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#007048] shadow-xs transition-colors"
        >
          <FolderHeart className="w-4 h-4 text-[#00A86B]" />
          <span>Agrément APDP</span>
        </button>
      </div>

      {/* MODAL NOTIFICATIONS */}
      {showNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#C8E6D5] shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#C8E6D5]">
              <h3 className="font-bold text-xl text-[#007048] font-display">
                Notifications
              </h3>
              <button
                onClick={() => setShowNotifModal(false)}
                className="p-2 text-[#406354] hover:bg-[#E6F7F0] rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <div className="p-3 bg-[#E6F7F0] rounded-xl">
                <p className="font-bold text-[#1B362B]">Rappel consultation</p>
                <p className="text-sm text-[#406354]">Demain à 10h00</p>
              </div>
              <div className="p-3 bg-[#E6F7F0] rounded-xl">
                <p className="font-bold text-[#1B362B]">Ordonnance active</p>
                <p className="text-sm text-[#406354]">Valable en pharmacie</p>
              </div>
            </div>
            <button
              onClick={() => setShowNotifModal(false)}
              className="w-full min-h-[64px] bg-[#00A86B] text-white text-lg font-bold rounded-2xl mt-2"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* MODAL URGENCE SAMU */}
      {showUrgenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#C8E6D5] shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-[#E6F7F0] text-[#007048] flex items-center justify-center mx-auto mb-3">
              <PhoneCall className="w-9 h-9 animate-pulse" />
            </div>
            <h3 className="font-bold text-2xl text-[#1B362B] font-display mb-1">
              Appel d'Urgence
            </h3>
            <p className="text-lg text-[#406354] mb-5">
              Service gratuit 24h/24
            </p>

            <div className="space-y-3">
              <a
                href="tel:15"
                className="w-full min-h-[64px] bg-[#007048] text-white text-xl font-black rounded-2xl flex items-center justify-center gap-3 shadow-sm"
              >
                <PhoneCall className="w-6 h-6" />
                <span>Appeler SAMU (15)</span>
              </a>

              <a
                href="tel:118"
                className="w-full min-h-[64px] bg-[#E6F7F0] border-2 border-[#007048] text-[#007048] text-xl font-bold rounded-2xl flex items-center justify-center gap-3"
              >
                <PhoneCall className="w-6 h-6" />
                <span>Pompiers (118)</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => setShowUrgenceModal(false)}
              className="w-full min-h-[56px] text-[#406354] font-bold text-lg rounded-xl mt-4 hover:bg-gray-100"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* MODAL APDP */}
      <ApdpConsentModal
        isOpen={showApdpModal}
        onClose={() => setShowApdpModal(false)}
      />

      {/* MODAL ORDONNANCE SÉCURISÉE */}
      <DigitalPrescriptionModal
        isOpen={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
      />
    </div>
  );
};
