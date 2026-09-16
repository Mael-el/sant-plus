// Page officielle Don de Sang & Alertes Transfusionnelles ANTS Bénin
// Création d'alertes in-page, notifications push (son + vibration), listes actives/passées/annulées, rappels de bilans et confirmation "Je donne" avec reçu certifié

import React, { useState, useEffect } from "react";
import {
  Droplet,
  Heart,
  AlertCircle,
  Phone,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowLeft,
  X,
  Bell,
  Volume2,
  Clock,
  Plus,
  Shield,
  Download,
  Check,
  Send,
  Sparkles,
} from "lucide-react";
import {
  SanteAsymmetricCard,
  Sante3DButton,
} from "../components/CommonComponents";
import { PatientProfileEntity, BloodAlertEntity } from "../types";
import { printOrDownloadReceipt, MedicalReceiptData } from "../utils/receiptGenerator";

export interface ExtendedBloodAlert {
  id: number;
  hospitalName: string;
  city: string;
  date: string;
  time: string;
  bloodGroup: string;
  urgency: "URGENT" | "TRÈS URGENT" | "CRITIQUE";
  unitsRequired: number;
  message: string;
  contactPhone: string;
  status: "ACTIVE" | "PASSEE" | "ANNULEE";
}

interface BloodDonationScreenProps {
  patient: PatientProfileEntity;
  alerts: BloodAlertEntity[];
  onBackToHome: () => void;
}

export const BloodDonationScreen: React.FC<BloodDonationScreenProps> = ({
  patient,
  alerts: initialAlerts,
  onBackToHome,
}) => {
  // Liste interne des alertes avec statuts
  const [bloodAlertsList, setBloodAlertsList] = useState<ExtendedBloodAlert[]>([
    {
      id: 1,
      hospitalName: "CNHU-HKM (Banque de Sang Centrale)",
      city: "Cotonou",
      date: "16/09/2026",
      time: "10:30",
      bloodGroup: "O+",
      urgency: "CRITIQUE",
      unitsRequired: 8,
      message: "Urgence vitale bloc obstétrique et traumatologie pédiatrique.",
      contactPhone: "+229 21 30 15 60",
      status: "ACTIVE",
    },
    {
      id: 2,
      hospitalName: "CHU-MEL (Maternité & Néonatalogie)",
      city: "Cotonou",
      date: "16/09/2026",
      time: "08:15",
      bloodGroup: "B+",
      urgency: "TRÈS URGENT",
      unitsRequired: 4,
      message: "Besoin transfusionnel femmes enceintes anémiques sévères.",
      contactPhone: "+229 21 31 23 88",
      status: "ACTIVE",
    },
    {
      id: 3,
      hospitalName: "CHD Ouémé (Porto-Novo)",
      city: "Porto-Novo",
      date: "15/09/2026",
      time: "14:00",
      bloodGroup: "A-",
      urgency: "URGENT",
      unitsRequired: 2,
      message: "Chirurgie viscérale programmée urgente.",
      contactPhone: "+229 20 21 27 10",
      status: "PASSEE",
    },
    {
      id: 4,
      hospitalName: "Hôpital de Zone d'Abomey-Calavi",
      city: "Abomey-Calavi",
      date: "14/09/2026",
      time: "09:00",
      bloodGroup: "AB+",
      urgency: "URGENT",
      unitsRequired: 3,
      message: "Stock de réserve complété par l'ANTS.",
      contactPhone: "+229 21 36 01 22",
      status: "ANNULEE",
    },
  ]);

  // Filtre d'onglet alertes
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "PASSEE" | "ANNULEE">("ACTIVE");

  // Modal création d'alerte
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);
  const [newAlertHospital, setNewAlertHospital] = useState("CNHU-HKM (Cotonou)");
  const [newAlertDate, setNewAlertDate] = useState("2026-09-17");
  const [newAlertTime, setNewAlertTime] = useState("10:00");
  const [newAlertBloodGroup, setNewAlertBloodGroup] = useState("O+");
  const [newAlertUnits, setNewAlertUnits] = useState(5);
  const [newAlertUrgency, setNewAlertUrgency] = useState<"URGENT" | "TRÈS URGENT" | "CRITIQUE">("CRITIQUE");
  const [newAlertMessage, setNewAlertMessage] = useState("Besoin immédiat en concentrés érythrocytaires.");

  // Modal de notification push simulée / reçue
  const [activePushNotification, setActivePushNotification] = useState<ExtendedBloodAlert | null>(null);

  // Modal de rendez-vous de don / engagement "Je donne"
  const [showPledgeSuccessModal, setShowPledgeSuccessModal] = useState(false);
  const [pledgedAlert, setPledgedAlert] = useState<ExtendedBloodAlert | null>(null);
  const [donationReceipt, setDonationReceipt] = useState<MedicalReceiptData | null>(null);

  // Configuration Rappels de Bilan de Santé
  const [checkupFrequency, setCheckupFrequency] = useState<"mensuel" | "trimestriel" | "annuel">("trimestriel");
  const [showCheckupConfigSaved, setShowCheckupConfigSaved] = useState(false);

  // Synthétiseur de carillon sonore Web Audio API
  const playAlertSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Double carillon harmonique de santé
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.55);
      osc2.stop(ctx.currentTime + 0.55);
    } catch {
      // Tolérance navigateur
    }
  };

  // Vibration de l'appareil
  const triggerVibration = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  };

  // Déclencher une notification Push réelle du navigateur si permission accordée
  const triggerNativePush = (alertItem: ExtendedBloodAlert) => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(`ALERTE DON DE SANG (${alertItem.bloodGroup})`, {
          body: `${alertItem.hospitalName} : ${alertItem.message}`,
          icon: "/favicon.ico",
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(`ALERTE DON DE SANG (${alertItem.bloodGroup})`, {
              body: `${alertItem.hospitalName} : ${alertItem.message}`,
            });
          }
        });
      }
    }
  };

  // Création d'une nouvelle alerte
  const handleCreateAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAlert: ExtendedBloodAlert = {
      id: Date.now(),
      hospitalName: newAlertHospital,
      city: "Cotonou",
      date: newAlertDate,
      time: newAlertTime,
      bloodGroup: newAlertBloodGroup,
      urgency: newAlertUrgency,
      unitsRequired: newAlertUnits,
      message: newAlertMessage,
      contactPhone: "+229 21 30 15 60",
      status: "ACTIVE",
    };

    setBloodAlertsList((prev) => [newAlert, ...prev]);
    setShowCreateAlertModal(false);

    // Déclencher immédiatement la notification push sur l'application avec son et vibration
    playAlertSound();
    triggerVibration();
    triggerNativePush(newAlert);
    setActivePushNotification(newAlert);
  };

  // Réponse "Je donne"
  const handleJeDonne = (alertItem: ExtendedBloodAlert) => {
    const txRef = `DON-ANTS-${alertItem.id}-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString("fr-FR");
    const timeFormatted = now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

    const receipt: MedicalReceiptData = {
      title: "Confirmation d'Engagement Don de Sang ANTS",
      referenceNumber: txRef,
      patientName: patient.fullName,
      patientNpi: patient.npi,
      patientPhone: patient.phone,
      facilityName: alertItem.hospitalName,
      serviceOrAct: `Don de sang volontaire et bénévole (Groupe ${alertItem.bloodGroup})`,
      amountCfa: 0,
      paymentMethod: "Don de Sang Bénévole Gratuit",
      paymentStatus: "CONFIRMÉ",
      date: alertItem.date,
      time: alertItem.time,
      notes: "À présenter au centre de transfusion sanguine pour passage prioritaire.",
      verificationUrl: `https://sante.gouv.bj/don/verifier?ref=${txRef}&npi=${patient.npi}`,
    };

    setPledgedAlert(alertItem);
    setDonationReceipt(receipt);
    setActivePushNotification(null);
    setShowPledgeSuccessModal(true);
  };

  const filteredAlerts = bloodAlertsList.filter((a) => a.status === activeTab);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <button
        type="button"
        onClick={onBackToHome}
        className="flex items-center gap-2 text-sm font-bold text-[#007048] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour à l'accueil</span>
      </button>

      {/* En-tête Don de Sang */}
      <div className="bg-white border-2 border-[#00A86B] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] border-2 border-[#00A86B] text-[#007048] flex items-center justify-center shrink-0">
            <Droplet className="w-9 h-9 fill-[#00A86B]" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#00A86B] uppercase tracking-wider block">
              AGENCE NATIONALE DE TRANSFUSION SANGUINE (ANTS)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B362B] font-display">
              Don de Sang & Alertes
            </h1>
            <p className="text-sm text-[#406354]">
              Alertes d'urgence en direct, notifications push et rappels de bilans
            </p>
          </div>
        </div>

        {/* Bouton pour créer une alerte */}
        <button
          type="button"
          onClick={() => setShowCreateAlertModal(true)}
          className="min-h-[56px] px-6 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Créer une alerte</span>
        </button>
      </div>

      {/* Carte Profil Donneur */}
      <SanteAsymmetricCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] border-2 border-[#00A86B] flex flex-col items-center justify-center text-[#007048]">
              <span className="text-[10px] font-bold uppercase text-[#406354]">Groupe</span>
              <span className="text-2xl font-black font-display">
                {patient.bloodGroup || "O+"}
              </span>
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-[#1B362B]">
                {patient.fullName}
              </h2>
              <p className="text-xs text-[#406354]">
                Électrophorèse : {patient.electrophoresis || "AA"} • NPI {patient.npi}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#007048] mt-1">
                <Heart className="w-4 h-4 fill-[#00A86B]" />
                <span>Donneur Citoyen Actif • Éligible au don</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={playAlertSound}
              className="min-h-[44px] px-3 bg-[#E6F7F0] hover:bg-[#D6F2E5] border border-[#00A86B] text-[#007048] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              title="Tester le signal sonore"
            >
              <Volume2 className="w-4 h-4" />
              <span>Tester sonnerie</span>
            </button>
          </div>
        </div>
      </SanteAsymmetricCard>

      {/* Section des Alertes : Filtres d'onglets (Actives / Passées / Annulées) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#C8E6D5] pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600 animate-pulse" />
            <h2 className="font-black text-xl text-[#1B362B] font-display">
              Alertes de Besoins Urgents
            </h2>
          </div>

          {/* Onglets */}
          <div className="flex items-center gap-1 bg-[#F4FAF7] p-1 rounded-xl border border-[#C8E6D5]">
            <button
              type="button"
              onClick={() => setActiveTab("ACTIVE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ACTIVE"
                  ? "bg-[#DC2626] text-white"
                  : "text-[#406354] hover:text-[#1B362B]"
              }`}
            >
              Actives ({bloodAlertsList.filter((a) => a.status === "ACTIVE").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("PASSEE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "PASSEE"
                  ? "bg-[#007048] text-white"
                  : "text-[#406354] hover:text-[#1B362B]"
              }`}
            >
              Passées ({bloodAlertsList.filter((a) => a.status === "PASSEE").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ANNULEE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ANNULEE"
                  ? "bg-gray-600 text-white"
                  : "text-[#406354] hover:text-[#1B362B]"
              }`}
            >
              Annulées
            </button>
          </div>
        </div>

        {/* Liste des alertes */}
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-[#C8E6D5] rounded-2xl p-8 text-center text-[#406354]">
            Aucune alerte dans cette catégorie.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlerts.map((al) => (
              <div
                key={al.id}
                className={`bg-white p-5 rounded-2xl border-2 shadow-xs space-y-3 ${
                  al.status === "ACTIVE"
                    ? "border-red-300"
                    : al.status === "PASSEE"
                    ? "border-[#C8E6D5]"
                    : "border-gray-200 opacity-75"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-12 h-12 rounded-xl bg-red-100 text-red-700 font-black text-xl flex items-center justify-center font-display border border-red-300">
                    {al.bloodGroup}
                  </span>
                  <span
                    className={`px-3 py-1 font-bold text-xs rounded-full uppercase tracking-wider ${
                      al.urgency === "CRITIQUE"
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {al.urgency}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-[#1B362B]">
                    {al.hospitalName}
                  </h3>
                  <p className="text-xs text-[#406354] mt-0.5">
                    {al.city} • Date : {al.date} à {al.time}
                  </p>
                  <p className="text-xs font-bold text-red-700 mt-1">
                    Besoin immédiat : {al.unitsRequired} poches
                  </p>
                  <p className="text-xs text-[#1B362B] mt-1.5 italic bg-[#F4FAF7] p-2 rounded-lg">
                    "{al.message}"
                  </p>
                </div>

                {/* Actions selon statut */}
                {al.status === "ACTIVE" ? (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2F0E8]">
                    <button
                      type="button"
                      onClick={() => handleJeDonne(al)}
                      className="min-h-[48px] bg-[#00A86B] hover:bg-[#00965F] text-white font-black text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-98"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Je donne</span>
                    </button>

                    <a
                      href={`tel:${al.contactPhone.replace(/\s+/g, "")}`}
                      className="min-h-[48px] bg-[#E6F7F0] hover:bg-[#D6F2E5] text-[#007048] border border-[#00A86B] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Appeler</span>
                    </a>
                  </div>
                ) : (
                  <div className="text-xs text-center font-bold text-[#688A7C] pt-2 border-t border-gray-100">
                    Alerte clôturée
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rappels de Bilan de Santé */}
      <div className="bg-white border-2 border-[#00A86B] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#E6F7F0] text-[#007048] flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-[#1B362B]">
                Rappels de Bilan de Santé & Prévention
              </h3>
              <p className="text-xs text-[#406354]">
                Notification automatique avec conseils de santé réguliers
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["mensuel", "trimestriel", "annuel"] as const).map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => {
                setCheckupFrequency(freq);
                setShowCheckupConfigSaved(true);
                setTimeout(() => setShowCheckupConfigSaved(false), 2500);
              }}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                checkupFrequency === freq
                  ? "border-[#00A86B] bg-[#E6F7F0] text-[#007048]"
                  : "border-[#C8E6D5] bg-white text-[#406354] hover:border-[#00A86B]"
              }`}
            >
              <span className="font-bold text-sm block capitalize">
                Bilan {freq}
              </span>
              <span className="text-[11px] block mt-1">
                {freq === "mensuel"
                  ? "Tension & Glycémie"
                  : freq === "trimestriel"
                  ? "Hémogramme & Don"
                  : "Bilan Complet & Imagerie"}
              </span>
            </button>
          ))}
        </div>

        {showCheckupConfigSaved && (
          <div className="p-3 bg-[#E6F7F0] border border-[#00A86B] rounded-xl text-xs font-bold text-[#007048] flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Fréquence configurée avec succès : Bilan {checkupFrequency} programmé.</span>
          </div>
        )}
      </div>

      {/* MODAL CRÉER UNE ALERTE DE DON */}
      {showCreateAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-[#00A86B] shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#C8E6D5]">
              <div className="flex items-center gap-2">
                <Droplet className="w-6 h-6 text-red-600 fill-red-600" />
                <h3 className="font-bold text-lg text-[#007048]">
                  Créer une Alerte de Don de Sang
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateAlertModal(false)}
                className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateAlertSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#1B362B] mb-1 uppercase">
                  Lieu (Hôpital ou centre de collecte)
                </label>
                <input
                  type="text"
                  value={newAlertHospital}
                  onChange={(e) => setNewAlertHospital(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2 rounded-xl border border-[#C8E6D5] text-sm font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B362B] mb-1 uppercase">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newAlertDate}
                    onChange={(e) => setNewAlertDate(e.target.value)}
                    className="w-full min-h-[46px] px-3.5 py-2 rounded-xl border border-[#C8E6D5] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B362B] mb-1 uppercase">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={newAlertTime}
                    onChange={(e) => setNewAlertTime(e.target.value)}
                    className="w-full min-h-[46px] px-3.5 py-2 rounded-xl border border-[#C8E6D5] text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B362B] mb-1 uppercase">
                    Groupe recherché
                  </label>
                  <select
                    value={newAlertBloodGroup}
                    onChange={(e) => setNewAlertBloodGroup(e.target.value)}
                    className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-[#C8E6D5] text-sm font-bold text-[#007048]"
                  >
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((g) => (
                      <option key={g} value={g}>
                        Groupe {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B362B] mb-1 uppercase">
                    Poches requises
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newAlertUnits}
                    onChange={(e) => setNewAlertUnits(parseInt(e.target.value) || 1)}
                    className="w-full min-h-[46px] px-3.5 py-2 rounded-xl border border-[#C8E6D5] text-sm font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B362B] mb-1 uppercase">
                  Niveau d'urgence
                </label>
                <select
                  value={newAlertUrgency}
                  onChange={(e) => setNewAlertUrgency(e.target.value as any)}
                  className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-[#C8E6D5] text-sm font-bold text-red-600"
                >
                  <option value="CRITIQUE">CRITIQUE (Urgence vitale immédiate)</option>
                  <option value="TRÈS URGENT">TRÈS URGENT (Dans les 4 heures)</option>
                  <option value="URGENT">URGENT (Dans les 24 heures)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B362B] mb-1 uppercase">
                  Message explicatif
                </label>
                <textarea
                  value={newAlertMessage}
                  onChange={(e) => setNewAlertMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#C8E6D5] text-xs"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-lg font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98"
                >
                  <Send className="w-5 h-5" />
                  <span>Créer l'alerte & Diffuser la notification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BANNIÈRE MODALE DE NOTIFICATION PUSH IN-APP (QUAND ALERTE CRÉÉE OU REÇUE) */}
      {activePushNotification && (
        <div className="fixed inset-x-4 top-20 z-50 max-w-lg mx-auto bg-white border-3 border-red-600 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-top-6 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Bell className="w-7 h-7 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                  NOTIFICATION PUSH EN DIRECT • ALERTE NATIONALE
                </span>
                <h3 className="font-black text-base text-[#1B362B]">
                  Urgence Sang {activePushNotification.bloodGroup} à {activePushNotification.hospitalName}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActivePushNotification(null)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-[#406354] mt-2 bg-red-50 p-2.5 rounded-xl border border-red-200">
            {activePushNotification.message}
          </p>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <button
              type="button"
              onClick={() => handleJeDonne(activePushNotification)}
              className="min-h-[48px] bg-[#00A86B] hover:bg-[#00965F] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-xs"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Je donne</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePushNotification(null)}
              className="min-h-[48px] bg-[#E6F7F0] text-[#007048] font-bold text-xs rounded-xl flex items-center justify-center"
            >
              Voir détails
            </button>

            <button
              type="button"
              onClick={() => setActivePushNotification(null)}
              className="min-h-[48px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center justify-center"
            >
              Ignorer
            </button>
          </div>
        </div>
      )}

      {/* MODAL SUCCÈS "JE DONNE" AVEC REÇU CERTIFIÉ TÉLÉCHARGEABLE */}
      {showPledgeSuccessModal && pledgedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-[#00A86B] shadow-2xl text-center space-y-4 animate-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-[#E6F7F0] border-2 border-[#00A86B] text-[#00A86B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-extrabold text-2xl text-[#007048] font-display">
                Merci pour votre don citoyen !
              </h3>
              <p className="text-xs text-[#406354] mt-1">
                L'hôpital <strong>{pledgedAlert.hospitalName}</strong> a été notifié de votre arrivée pour le groupe{" "}
                <strong>{pledgedAlert.bloodGroup}</strong>.
              </p>
            </div>

            <div className="p-3 bg-[#F4FAF7] rounded-2xl border border-[#C8E6D5] text-xs text-left space-y-1">
              <div><strong>Lieu :</strong> {pledgedAlert.hospitalName}</div>
              <div><strong>Date :</strong> {pledgedAlert.date} à {pledgedAlert.time}</div>
              <div><strong>Donneur :</strong> {patient.fullName} (NPI {patient.npi})</div>
            </div>

            {donationReceipt && (
              <button
                type="button"
                onClick={() => printOrDownloadReceipt(donationReceipt)}
                className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-xl font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98"
              >
                <Download className="w-6 h-6" />
                <span>Télécharger le Reçu de Don (PDF)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPledgeSuccessModal(false)}
              className="w-full min-h-[48px] bg-[#E6F7F0] text-[#007048] font-bold text-sm rounded-xl"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
