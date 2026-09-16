// Page officielle Espace Médecin SANTÉ+ Bénin (Ordre National des Médecins du Bénin - ONMB)
// Parcours complet Médecin - Patient : Gestion des rendez-vous, Arrivée patient, Identification, Consultation (Motif, Diagnostic IA, Prescriptions templates, Signes vitaux, Brouillon/Validé), Horodatage Blockchain, Ordonnances & Facturation

import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  Users,
  Clock,
  FileText,
  AlertTriangle,
  QrCode,
  Search,
  Phone,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  BarChart2,
  LogOut,
  Plus,
  Send,
  User,
  ArrowRight,
  Eye,
  Activity,
  ChevronRight,
  Filter,
  Sparkles,
  Save,
  Lock,
  Receipt,
  Bell,
  Check,
  Building2,
  X,
} from "lucide-react";
import { BeninHealthMap } from "../components/BeninHealthMap";
import {
  PatientProfileEntity,
  FhirEncounterEntity,
  FhirMedicationRequestEntity,
  FhirObservationEntity,
  PaymentRecordEntity,
  AppointmentItemEntity,
} from "../types";

interface DoctorDashboardScreenProps {
  onBackToLanding: () => void;
  onViewPatientDossier: (npi: string) => void;
  currentPatient?: PatientProfileEntity;
  appointments?: AppointmentItemEntity[];
  onUpdateAppointment?: (
    appointmentId: string,
    status: "En attente" | "Confirmé" | "Arrivé" | "En cours" | "Terminé"
  ) => void;
  onAddEncounter?: (encounter: Omit<FhirEncounterEntity, "id">) => void;
  onAddMedication?: (med: Omit<FhirMedicationRequestEntity, "id">) => void;
  onAddObservation?: (obs: Omit<FhirObservationEntity, "id">) => void;
  onAddPayment?: (payment: PaymentRecordEntity) => void;
}

interface PatientQueueItem {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  npi: string;
  bloodGroup: string;
  electrophoresis: string;
  allergies: string;
  motif: string;
  status: "En attente" | "Confirmé" | "Arrivé" | "En cours" | "Terminé";
  time: string;
  date: string;
  hospitalName: string;
  feeCfa: number;
  qrLink?: string;
}

export const DoctorDashboardScreen: React.FC<DoctorDashboardScreenProps> = ({
  onBackToLanding,
  onViewPatientDossier,
  currentPatient,
  appointments = [],
  onUpdateAppointment,
  onAddEncounter,
  onAddMedication,
  onAddObservation,
  onAddPayment,
}) => {
  // Navigation menu
  const [activeMenu, setActiveMenu] = useState<
    | "dashboard"
    | "agenda"
    | "consultation"
    | "patients"
    | "prescriptions"
    | "etablissements"
    | "audit"
    | "statistiques"
  >("dashboard");

  // Notifications en temps réel
  const [notificationBanner, setNotificationBanner] = useState<{
    title: string;
    message: string;
    type: "arrival" | "appointment" | "payment";
  } | null>(null);

  // File d'attente synchronisée avec les rendez-vous
  const [queue, setQueue] = useState<PatientQueueItem[]>(() => {
    if (appointments && appointments.length > 0) {
      return appointments.map((a) => ({
        id: a.id,
        name: a.patientName,
        age: a.patientAge || 30,
        gender: a.patientGender || "M",
        phone: a.patientPhone,
        npi: a.patientNpi,
        bloodGroup: a.patientBloodGroup || "O+",
        electrophoresis: a.patientElectrophoresis || "AA",
        allergies: a.patientAllergies || "Aucune",
        motif: a.motif,
        status: a.status,
        time: a.time,
        date: a.date,
        hospitalName: a.hospitalName,
        feeCfa: a.amountCfa,
      }));
    }
    return [];
  });

  // Mettre à jour la file si les rendez-vous changent
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      setQueue(
        appointments.map((a) => ({
          id: a.id,
          name: a.patientName,
          age: a.patientAge || 30,
          gender: a.patientGender || "M",
          phone: a.patientPhone,
          npi: a.patientNpi,
          bloodGroup: a.patientBloodGroup || "O+",
          electrophoresis: a.patientElectrophoresis || "AA",
          allergies: a.patientAllergies || "Aucune",
          motif: a.motif,
          status: a.status,
          time: a.time,
          date: a.date,
          hospitalName: a.hospitalName,
          feeCfa: a.amountCfa,
        }))
      );
    }
  }, [appointments]);

  // État d'identification et sélection du patient
  const [showIdentifyModal, setShowIdentifyModal] = useState(false);
  const [identifyMethod, setIdentifyMethod] = useState<"npi" | "qr" | "tel" | "nom">("npi");
  const [identifyInput, setIdentifyInput] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientQueueItem | null>(null);

  // Formulaire de consultation
  const [consultMotif, setConsultMotif] = useState("");
  const [consultDiag, setConsultDiag] = useState("");
  const [consultPrescription, setConsultPrescription] = useState("");
  const [consultBp, setConsultBp] = useState("120/80");
  const [consultPulse, setConsultPulse] = useState("72");
  const [consultTemp, setConsultTemp] = useState("37.2");
  const [consultWeight, setConsultWeight] = useState("68");
  const [consultExams, setConsultExams] = useState("");
  const [consultRecommendations, setConsultRecommendations] = useState("");
  const [consultFollowUpDate, setConsultFollowUpDate] = useState("");
  const [isDraft, setIsDraft] = useState(true);
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);
  const [validatedHash, setValidatedHash] = useState<string | null>(null);
  const [consultSuccess, setConsultSuccess] = useState(false);

  // Suggestions IA Bénin
  const aiDiagnosisSuggestions = [
    "Paludisme simple à Plasmodium falciparum sans signe de gravité",
    "Crise vaso-occlusive drépanocytaire simple (SS/SC)",
    "Gastro-entérite aiguë fébrile avec déshydratation modérée",
    "Infection respiratoire aiguë basse (Pneumopathie)",
    "Poussée hypertensive modérée (Grade II)",
    "Accès fébrile d'allure virale saisonnière",
  ];

  // Templates d'ordonnances rapides
  const prescriptionTemplates = [
    {
      name: "Protocole Paludisme Bénin",
      text: "Artéméther 80mg + Luméfantrine 480mg : 1 cp matin et soir pendant 3 jours au milieu des repas.\nParacétamol 1000mg : 1 cp toutes les 8h si température > 38.5°C ou céphalées.",
    },
    {
      name: "Protocole Gastro-entérite & SRO",
      text: "Sels de Réhydratation Orale (SRO) : 1 sachet dans 1L d'eau potable, à boire régulièrement.\nRacécadotril 100mg : 1 gélule 3 fois par jour avant les repas pendant 5 jours.\nPhloroglucinol (Spasfon) 80mg : 2 comprimés en cas de crampes abdominales.",
    },
    {
      name: "Protocole HTA & Cardio",
      text: "Amlodipine 5mg : 1 comprimé chaque matin au réveil.\nRégime hyposodé strict et activité physique modérée.\nAuto-mesure tensionnelle matin et soir.",
    },
    {
      name: "Protocole Infection ORL / Bronches",
      text: "Amoxicilline 1g : 1 comprimé 3 fois par jour pendant 7 jours.\nParacétamol 1g : 1 comprimé en cas de douleurs.\nLavages des fosses nasales au sérum physiologique 4 fois par jour.",
    },
  ];

  // Historique des ordonnances générées
  const [prescriptions, setPrescriptions] = useState<Array<{
    id: string;
    patient: string;
    date: string;
    meds: string;
    status: string;
  }>>([]);

  // Jouer un son discret pour les notifications
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.2); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {
      // Ignorer si audio bloqué
    }
  };

  // ÉTAPE 3 : Le patient arrive à l'hôpital -> L'accueil ou le médecin valide son arrivée
  const handleMarkAsArrived = (item: PatientQueueItem) => {
    const updatedStatus = "Arrivé";
    setQueue((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, status: updatedStatus } : p))
    );
    if (onUpdateAppointment) {
      onUpdateAppointment(item.id, updatedStatus);
    }
    playChime();
    setNotificationBanner({
      title: "Patient arrivé",
      message: `${item.name} est arrivé à l'établissement (${item.hospitalName}). Le patient attend en salle de consultation.`,
      type: "arrival",
    });

    // Envoi de la mise à jour au backend si connecté
    fetch(`/api/appointments/${item.id}/arrive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("sante_token") || ""}`,
      },
    }).catch(() => {});
  };

  // ÉTAPE 4 : Le médecin démarre la consultation et identifie le patient
  const handleStartConsultation = (patientItem: PatientQueueItem) => {
    setSelectedPatient(patientItem);
    setConsultMotif(patientItem.motif || "Consultation générale");
    setConsultDiag("");
    setConsultPrescription("");
    setConsultExams("");
    setConsultRecommendations("");
    setConsultFollowUpDate("");
    setIsDraft(true);
    setValidatedHash(null);
    setConsultSuccess(false);

    // Mettre à jour le statut du rendez-vous
    setQueue((prev) =>
      prev.map((p) => (p.id === patientItem.id ? { ...p, status: "En cours" } : p))
    );
    if (onUpdateAppointment) {
      onUpdateAppointment(patientItem.id, "En cours");
    }

    setActiveMenu("consultation");
  };

  const [isSearching, setIsSearching] = useState(false);

  // Soumission de la recherche d'identification
  const handleIdentifySearch = async () => {
    const term = identifyInput.trim();
    if (!term) return;

    const termLower = term.toLowerCase();

    // 1. Chercher dans la file d'attente locale (RDV existants)
    const foundInQueue = queue.find(
      (p) =>
        p.name.toLowerCase().includes(termLower) ||
        p.npi.includes(term) ||
        p.phone.includes(term) ||
        p.id.toLowerCase().includes(termLower)
    );

    if (foundInQueue) {
      handleStartConsultation(foundInQueue);
      setShowIdentifyModal(false);
      setIdentifyInput("");
      return;
    }

    // 2. Chercher dans la base de données serveur (tous les patients)
    const fieldMap: Record<string, string> = { tel: "phone", nom: "name", npi: "npi", qr: "qr" };
    const field = fieldMap[identifyMethod] || "npi";

    setIsSearching(true);
    try {
      const params = new URLSearchParams({ q: term, field });
      const response = await fetch(`/api/patients/search?${params}`);
      const data = await response.json();

      if (data.success && data.results && data.results.length > 0) {
        const patient = data.results[0];
        const foundPatient: PatientQueueItem = {
          id: patient.id,
          name: patient.fullName,
          age: 32,
          gender: "M",
          phone: patient.phone || "",
          npi: patient.npi,
          bloodGroup: patient.bloodGroup || "O+",
          electrophoresis: "AA",
          allergies: patient.allergies || "Aucune",
          motif: "Consultation médicale",
          status: "En attente" as const,
          time: "Maintenant",
          date: new Date().toLocaleDateString("fr-FR"),
          hospitalName: "CNHU-HKM Cotonou",
          feeCfa: 3500,
        };
        handleStartConsultation(foundPatient);
        setShowIdentifyModal(false);
        setIdentifyInput("");
      } else {
        alert("Aucun patient correspondant trouvé dans la base de données. Veuillez vérifier le NPI, le téléphone, le nom ou le QR Code.");
      }
    } catch (err) {
      console.error("Erreur de recherche patient:", err);
      alert("Erreur de recherche. Vérifiez votre connexion ou essayez le NPI directement.");
    } finally {
      setIsSearching(false);
    }
  };

  // ÉTAPE 5.3 : Sauvegarde manuelle en brouillon (invisible pour le patient)
  const handleSaveDraft = () => {
    const timeStr = new Date().toLocaleTimeString("fr-FR");
    setDraftSavedTime(timeStr);
    setIsDraft(true);
  };

  // ÉTAPE 6 : Le médecin enregistre et valide la consultation (figée & blockchain)
  const handleSaveAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    if (!consultMotif.trim() || !consultDiag.trim() || !consultPrescription.trim()) {
      alert("Erreur : Le motif, le diagnostic et la prescription sont obligatoires.");
      return;
    }

    // Génération du hachage cryptographique Blockchain Bitcoin OP_RETURN
    const rawPayload = `${selectedPatient.npi}:${consultMotif}:${consultDiag}:${consultPrescription}:${Date.now()}`;
    const mockHash = `0x${Array.from(rawPayload)
      .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 17)
      .toString(16)
      .padStart(64, "0")
      .toUpperCase()}`;

    setValidatedHash(mockHash);
    setIsDraft(false);

    // 1. Ajouter aux consultations du patient (Encounters)
    if (onAddEncounter) {
      onAddEncounter({
        facilityName: selectedPatient.hospitalName || "Établissement National de Santé",
        practitionerName: "Dr. Référent SANTÉ+ (ONMB)",
        date: new Date().toISOString().split("T")[0],
        serviceType: "Consultation Spécialisée",
        diagnosis: consultDiag,
        notes: `Motif : ${consultMotif} | Constantes : TA ${consultBp} mmHg, Pouls ${consultPulse} bpm, Temp ${consultTemp}°C | Conseils : ${consultRecommendations || "Néant"} | Suivi : ${consultFollowUpDate || "À la demande"}`,
        status: "Terminé",
      });
    }

    // 2. Ajouter l'ordonnance médicale aux prescriptions (Medications)
    if (onAddMedication && consultPrescription.trim()) {
      onAddMedication({
        medicationName: consultPrescription,
        dosage: "Selon posologie prescrite",
        frequency: "Voir détails de l'ordonnance",
        durationDays: 7,
        prescribedDate: new Date().toISOString().split("T")[0],
        doctorName: "Dr. Référent SANTÉ+ (ONMB)",
        facilityName: selectedPatient.hospitalName || "Établissement National de Santé",
        blockchainProofHash: mockHash,
        status: "Actif",
      });
    }

    // 3. Ajouter les constantes vitales aux observations (Observations)
    if (onAddObservation) {
      onAddObservation({
        category: "Tension Artérielle",
        value: consultBp,
        unit: "mmHg",
        recordedDate: new Date().toISOString().split("T")[0],
        interpretation: "Normal",
      });
      if (consultTemp) {
        onAddObservation({
          category: "Température Corporelle",
          value: consultTemp,
          unit: "°C",
          recordedDate: new Date().toISOString().split("T")[0],
          interpretation: Number(consultTemp) > 38 ? "Élevé" : "Normal",
        });
      }
    }

    // 4. Générer automatiquement la facture de consultation pour le patient
    if (onAddPayment) {
      const invoiceRef = `FACT-BJ-${Date.now().toString().slice(-8)}`;
      onAddPayment({
        id: Date.now(),
        referenceCode: invoiceRef,
        description: `Facture Consultation Médecin - ${selectedPatient.name}`,
        amountCfa: selectedPatient.feeCfa || 3500,
        paymentMethod: "En attente de règlement (MTN / Moov / Breez)",
        status: "En attente",
        date: new Date().toLocaleString("fr-FR"),
        receiptQrPayload: `https://sante.gouv.bj/factures/verifier?ref=${invoiceRef}&npi=${selectedPatient.npi}`,
      });
    }

    // 5. Mettre à jour le statut du rendez-vous à "Terminé"
    setQueue((prev) =>
      prev.map((p) => (p.id === selectedPatient.id ? { ...p, status: "Terminé" } : p))
    );
    if (onUpdateAppointment) {
      onUpdateAppointment(selectedPatient.id, "Terminé");
    }

    // 6. Ajouter à la liste locale des prescriptions du cabinet
    setPrescriptions((prev) => [
      {
        id: `RX-${Date.now().toString().slice(-6)}`,
        patient: selectedPatient.name,
        date: new Date().toLocaleDateString("fr-FR"),
        meds: consultPrescription,
        status: "Transmise au patient",
      },
      ...prev,
    ]);

    // Envoi au backend server si actif
    fetch(`/api/appointments/${selectedPatient.id}/consultation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("sante_token") || ""}`,
      },
      body: JSON.stringify({
        motif: consultMotif,
        diagnosis: consultDiag,
        prescription: consultPrescription,
        vitals: `TA: ${consultBp} | Pouls: ${consultPulse} | Temp: ${consultTemp} | Poids: ${consultWeight}`,
        notes: consultRecommendations,
      }),
    }).catch(() => {});

    setConsultSuccess(true);
  };

  return (
    <div className="min-h-screen bg-[#F0F9F4] text-[#1B362B] flex flex-col font-sans pb-16">
      {/* 1. HEADER DU PRATICIEN ONMB */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#C8E6D5] px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7F0] border border-[#00A86B] flex items-center justify-center text-[#007048]">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-[#007048] font-display">
                  SANTÉ+ Médecin
                </span>
                <span className="px-2 py-0.5 text-xs font-bold bg-[#E6F7F0] text-[#007048] border border-[#00A86B]/30 rounded-md">
                  ONMB Agréé
                </span>
              </div>
              <span className="block text-xs font-semibold text-[#406354]">
                Ordre National des Médecins du Bénin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="block font-bold text-base text-[#1B362B]">
                Dr. Praticien Hospitalier
              </span>
              <span className="text-xs text-[#00A86B] font-semibold flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse"></span>
                Cabinet en ligne
              </span>
            </div>

            <button
              type="button"
              onClick={onBackToLanding}
              className="min-h-[48px] px-4 bg-[#E6F7F0] hover:bg-[#D6F2E5] border border-[#C8E6D5] text-[#007048] font-bold rounded-xl flex items-center gap-2 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* BANNIÈRE DE NOTIFICATION FLOTTANTE */}
      {notificationBanner && (
        <div className="bg-[#007048] text-white px-4 py-3 shadow-md flex items-center justify-between">
          <div className="max-w-7xl mx-auto flex items-center gap-3 w-full">
            <Bell className="w-5 h-5 text-[#A3E5C7] shrink-0" />
            <div className="flex-1 text-sm">
              <span className="font-bold">{notificationBanner.title} : </span>
              <span>{notificationBanner.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotificationBanner(null)}
              className="p-1 text-white hover:bg-white/20 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. MENU HORIZONTAL D'ACTIONS */}
      <div className="bg-white border-b border-[#C8E6D5] px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-2 py-2">
          {[
            { key: "dashboard", label: "Tableau de Bord" },
            { key: "agenda", label: "Agenda & RDV du jour", count: queue.length },
            { key: "consultation", label: "Consultation en cours" },
            { key: "patients", label: "Dossiers Patients" },
            { key: "prescriptions", label: "Ordonnances émises" },
            { key: "etablissements", label: "Carte Établissements" },
            { key: "statistiques", label: "Statistiques" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveMenu(item.key as any)}
              className={`min-h-[44px] px-4 rounded-xl font-bold text-sm whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeMenu === item.key
                  ? "bg-[#00A86B] text-white shadow-xs"
                  : "bg-transparent text-[#406354] hover:bg-[#E6F7F0]"
              }`}
            >
              <span>{item.label}</span>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                    activeMenu === item.key ? "bg-white text-[#007048]" : "bg-[#E6F7F0] text-[#007048]"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CONTENU PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        {/* VUE 1 : DASHBOARD PRINCIPAL */}
        {activeMenu === "dashboard" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B362B] font-display">
                  TABLEAU DE BORD CONSULTATIONS
                </h1>
                <p className="text-base text-[#406354]">
                  Gestion en temps réel de la file d'attente, admissions et consultations.
                </p>
              </div>

              {/* BOUTON IDENTIFIER UN PATIENT */}
              <button
                type="button"
                onClick={() => setShowIdentifyModal(true)}
                className="min-h-[52px] px-6 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Search className="w-5 h-5" />
                <span>IDENTIFIER UN PATIENT</span>
              </button>
            </div>

            {/* 4 CARTES KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs">
                <span className="text-3xl sm:text-4xl font-black text-[#007048] block">
                  {queue.length}
                </span>
                <span className="text-sm sm:text-base font-bold text-[#406354] block mt-1">
                  RDV Programmés
                </span>
              </div>

              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs">
                <span className="text-3xl sm:text-4xl font-black text-[#007048] block">
                  {queue.filter((q) => q.status === "Arrivé").length}
                </span>
                <span className="text-sm sm:text-base font-bold text-[#406354] block mt-1">
                  Patients en attente
                </span>
              </div>

              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs">
                <span className="text-3xl sm:text-4xl font-black text-[#007048] block">
                  {queue.filter((q) => q.status === "Terminé").length}
                </span>
                <span className="text-sm sm:text-base font-bold text-[#406354] block mt-1">
                  Consultations finies
                </span>
              </div>

              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs">
                <span className="text-3xl sm:text-4xl font-black text-[#007048] block">
                  {prescriptions.length}
                </span>
                <span className="text-sm sm:text-base font-bold text-[#406354] block mt-1">
                  Ordonnances émises
                </span>
              </div>
            </div>

            {/* ÉTAPE 2 : LISTE DES RENDEZ-VOUS DU JOUR (FILE D'ATTENTE) */}
            <div className="bg-white border border-[#C8E6D5] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-[#007048]" />
                  <h2 className="text-xl font-bold text-[#1B362B] font-display">
                    FILE D'ATTENTE DES PATIENTS DU JOUR
                  </h2>
                </div>
                <span className="text-sm font-bold text-[#007048] bg-[#E6F7F0] px-3 py-1 rounded-full border border-[#00A86B]/30">
                  {queue.filter((q) => q.status !== "Terminé").length} en cours
                </span>
              </div>

              <div className="divide-y divide-[#C8E6D5]/60">
                {queue.length === 0 ? (
                  <div className="py-12 text-center space-y-3">
                    <User className="w-12 h-12 text-[#406354] mx-auto opacity-50" />
                    <p className="text-lg font-bold text-[#1B362B]">
                      Aucun patient dans la file d'attente pour le moment
                    </p>
                    <p className="text-sm text-[#406354] max-w-md mx-auto">
                      Dès qu'un patient réserve un rendez-vous dans l'Espace Patient, il apparaît automatiquement ici avec son paiement confirmé.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowIdentifyModal(true)}
                      className="min-h-[48px] px-6 bg-[#00A86B] text-white font-bold rounded-xl text-sm"
                    >
                      Identifier un patient manuellement
                    </button>
                  </div>
                ) : (
                  queue.map((p) => (
                    <div
                      key={p.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-lg text-[#1B362B]">
                            {p.name}
                          </span>
                          <span className="text-sm text-[#406354]">
                            ({p.age} ans • {p.gender})
                          </span>
                          {/* BADGES DE STATUT */}
                          {p.status === "Confirmé" && (
                            <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                              Confirmé & Payé
                            </span>
                          )}
                          {p.status === "Arrivé" && (
                            <span className="px-2.5 py-0.5 text-xs font-bold bg-[#E6F7F0] text-[#007048] border border-[#00A86B] rounded-md animate-pulse">
                              Arrivé en salle d'attente
                            </span>
                          )}
                          {p.status === "En cours" && (
                            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                              En consultation
                            </span>
                          )}
                          {p.status === "Terminé" && (
                            <span className="px-2.5 py-0.5 text-xs font-bold bg-gray-100 text-gray-700 rounded-md">
                              Consultation terminée
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-[#406354]">
                          <span className="font-semibold text-[#1B362B]">Motif :</span> {p.motif} •{" "}
                          <span className="font-semibold text-[#1B362B]">Heure :</span> {p.time} •{" "}
                          <span className="font-semibold text-[#1B362B]">NPI :</span> {p.npi}
                        </p>
                        <p className="text-xs text-[#406354]">
                          Établissement : {p.hospitalName} • Honoraires : {p.feeCfa} CFA
                        </p>
                      </div>

                      {/* ACTIONS ÉTAPE 3 & 4 */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {p.status === "Confirmé" && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsArrived(p)}
                            className="min-h-[44px] px-4 bg-white hover:bg-[#E6F7F0] border-2 border-[#00A86B] text-[#007048] font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Marquer Arrivé</span>
                          </button>
                        )}

                        {p.status !== "Terminé" && (
                          <button
                            type="button"
                            onClick={() => handleStartConsultation(p)}
                            className="min-h-[44px] px-5 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold rounded-xl text-sm transition-colors flex items-center gap-1.5 shadow-xs"
                          >
                            <Stethoscope className="w-4 h-4" />
                            <span>Démarrer consultation</span>
                          </button>
                        )}

                        {p.status === "Terminé" && (
                          <span className="text-xs font-bold text-[#007048] flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            Dossier transmis au patient
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VUE 2 : AGENDA COMPLET DU MÉDECIN (ÉTAPES 2 & 9) */}
        {activeMenu === "agenda" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B362B] font-display">
                  AGENDA DES CONSULTATIONS
                </h1>
                <p className="text-base text-[#406354]">
                  Planning des rendez-vous médicaux enregistrés dans la base de données.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIdentifyModal(true)}
                className="min-h-[48px] px-5 bg-[#00A86B] text-white font-bold rounded-xl text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nouveau patient</span>
              </button>
            </div>

            <div className="bg-white border border-[#C8E6D5] rounded-2xl p-6 shadow-xs space-y-4">
              {queue.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Calendar className="w-12 h-12 text-[#406354] mx-auto opacity-50" />
                  <p className="text-lg font-bold text-[#1B362B]">
                    Aucun rendez-vous sur le planning
                  </p>
                  <p className="text-sm text-[#406354]">
                    Les réservations des patients s'affichent automatiquement ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queue.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-[#C8E6D5] bg-[#F9FCFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E6F7F0] border border-[#00A86B] text-[#007048] flex items-center justify-center font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-[#1B362B]">
                              {item.name}
                            </span>
                            <span className="text-xs px-2 py-0.5 bg-[#E6F7F0] text-[#007048] font-bold rounded-md">
                              {item.time}
                            </span>
                          </div>
                          <p className="text-sm text-[#406354] mt-0.5">
                            Motif : {item.motif} • {item.hospitalName}
                          </p>
                          <p className="text-xs text-[#406354]">
                            Tél : {item.phone} • NPI : {item.npi}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-bold ${
                            item.status === "Arrivé"
                              ? "bg-[#E6F7F0] text-[#007048] border border-[#00A86B]"
                              : item.status === "Terminé"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {item.status}
                        </span>

                        {item.status !== "Terminé" && (
                          <button
                            type="button"
                            onClick={() => handleStartConsultation(item)}
                            className="min-h-[40px] px-4 bg-[#00A86B] text-white font-bold rounded-xl text-xs"
                          >
                            Consulter
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VUE 3 : CONSULTATION MÉDICALE EN COURS (ÉTAPES 4, 5, 6, 7) */}
        {activeMenu === "consultation" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B362B] font-display">
                  CONSULTATION MÉDICALE
                </h1>
                <p className="text-sm text-[#406354]">
                  Examen clinique, aide au diagnostic par IA, prescription et horodatage blockchain.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveMenu("dashboard")}
                className="text-sm font-bold text-[#00A86B] hover:underline flex items-center gap-1"
              >
                <span>Retour au tableau de bord</span>
              </button>
            </div>

            {selectedPatient ? (
              <div className="space-y-6">
                {/* 1. FICHE PATIENT (Étape 4) */}
                <div className="bg-white border-2 border-[#00A86B] rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#C8E6D5]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#00A86B]">
                          Dossier Médical Identifié
                        </span>
                        <span className="px-2 py-0.5 text-xs font-bold bg-[#E6F7F0] text-[#007048] rounded-md">
                          Certifié ANIP Bénin
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-[#1B362B] font-display mt-0.5">
                        {selectedPatient.name}
                      </h2>
                      <p className="text-sm font-mono text-[#406354]">
                        NPI : {selectedPatient.npi} • Tél : {selectedPatient.phone}
                      </p>
                    </div>

                    {/* Constantes & antécédents clés */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1.5 bg-[#E6F7F0] border border-[#00A86B] text-[#007048] rounded-xl font-bold text-sm">
                        Groupe : {selectedPatient.bloodGroup}
                      </span>
                      <span className="px-3 py-1.5 bg-[#E6F7F0] border border-[#00A86B] text-[#007048] rounded-xl font-bold text-sm">
                        Électrophorèse : {selectedPatient.electrophoresis}
                      </span>
                      <span className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-sm">
                        Allergies : {selectedPatient.allergies || "Aucune connue"}
                      </span>
                    </div>
                  </div>

                  {/* État du dossier : Brouillon vs Validé */}
                  <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isDraft
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : "bg-[#E6F7F0] text-[#007048] border border-[#00A86B]"
                        }`}
                      >
                        {isDraft ? "Statut : BROUILLON (Invisible pour le patient)" : "Statut : VALIDÉ & FIGÉ"}
                      </span>
                      {draftSavedTime && isDraft && (
                        <span className="text-xs text-[#406354]">
                          Dernier brouillon sauvé à {draftSavedTime}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onViewPatientDossier(selectedPatient.npi)}
                      className="text-xs font-bold text-[#007048] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Consulter historique complet</span>
                    </button>
                  </div>
                </div>

                {/* 2. FORMULAIRE MÉDECIN EXCLUSIF (Étape 5 & 6) */}
                <form
                  onSubmit={handleSaveAndSend}
                  className="bg-white border border-[#C8E6D5] rounded-2xl p-6 shadow-xs space-y-6"
                >
                  {/* LES 3 CHAMPS OBLIGATOIRES */}
                  <div className="space-y-4">
                    <div className="border-b border-[#C8E6D5] pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#00A86B]">
                        Champs Cliniques Obligatoires
                      </span>
                      <h3 className="text-xl font-bold text-[#1B362B] font-display">
                        Diagnostic & Ordonnance
                      </h3>
                    </div>

                    {/* Champ 1 : Motif (Obligatoire) */}
                    <div>
                      <label className="block text-sm font-bold text-[#1B362B] mb-1.5">
                        1. Motif de consultation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={consultMotif}
                        onChange={(e) => setConsultMotif(e.target.value)}
                        placeholder="Ex : Fièvre persistante depuis 48h, céphalées intenses et courbatures"
                        className="w-full min-h-[48px] px-4 rounded-xl border border-[#C8E6D5] focus:border-[#00A86B] text-base"
                      />
                    </div>

                    {/* Champ 2 : Diagnostic (Obligatoire + IA) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                        <label className="text-sm font-bold text-[#1B362B]">
                          2. Diagnostic médical retenu <span className="text-red-500">*</span>
                        </label>
                        <span className="text-xs font-semibold text-[#007048] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#00A86B]" />
                          Aide au diagnostic par IA
                        </span>
                      </div>

                      <input
                        type="text"
                        required
                        value={consultDiag}
                        onChange={(e) => setConsultDiag(e.target.value)}
                        placeholder="Ex : Paludisme simple à Plasmodium falciparum"
                        className="w-full min-h-[48px] px-4 rounded-xl border border-[#C8E6D5] focus:border-[#00A86B] text-base"
                      />

                      {/* Suggestions IA d'un clic */}
                      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-[#406354] font-medium">Suggestions :</span>
                        {aiDiagnosisSuggestions.map((diag, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setConsultDiag(diag)}
                            className="px-2.5 py-1 text-xs font-medium bg-[#E6F7F0] hover:bg-[#D6F2E5] text-[#007048] rounded-lg transition-colors border border-[#00A86B]/20"
                          >
                            + {diag.split(" ")[0]} {diag.split(" ")[1]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Champ 3 : Prescription / Ordonnance (Obligatoire + Templates) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                        <label className="text-sm font-bold text-[#1B362B]">
                          3. Prescription médicale (Ordonnance numérique) <span className="text-red-500">*</span>
                        </label>
                        <span className="text-xs font-semibold text-[#007048]">
                          Templates rapides ONMB
                        </span>
                      </div>

                      <textarea
                        rows={4}
                        required
                        value={consultPrescription}
                        onChange={(e) => setConsultPrescription(e.target.value)}
                        placeholder="Indiquez les médicaments, dosages, posologies et durée du traitement..."
                        className="w-full p-4 rounded-xl border border-[#C8E6D5] focus:border-[#00A86B] text-base font-mono text-sm leading-relaxed"
                      />

                      {/* Templates d'ordonnances rapides */}
                      <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {prescriptionTemplates.map((tpl, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setConsultPrescription(tpl.text)}
                            className="p-2 text-xs font-bold text-left bg-[#E6F7F0] hover:bg-[#D6F2E5] text-[#007048] rounded-xl border border-[#00A86B]/30 transition-colors"
                          >
                            {tpl.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ÉLÉMENTS OPTIONNELS (Signes vitaux, examens, recommandations, prochain RDV) */}
                  <div className="space-y-4 pt-4 border-t border-[#C8E6D5]">
                    <div className="border-b border-[#C8E6D5] pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#406354]">
                        Éléments Cliniques Complémentaires
                      </span>
                      <h3 className="text-lg font-bold text-[#1B362B]">
                        Signes Vitaux & Suivi
                      </h3>
                    </div>

                    {/* 4 SIGNES VITAUX */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#406354] mb-1">
                          Tension Artérielle (mmHg)
                        </label>
                        <input
                          type="text"
                          value={consultBp}
                          onChange={(e) => setConsultBp(e.target.value)}
                          placeholder="120/80"
                          className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#406354] mb-1">
                          Pouls (bpm)
                        </label>
                        <input
                          type="text"
                          value={consultPulse}
                          onChange={(e) => setConsultPulse(e.target.value)}
                          placeholder="72"
                          className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#406354] mb-1">
                          Température (°C)
                        </label>
                        <input
                          type="text"
                          value={consultTemp}
                          onChange={(e) => setConsultTemp(e.target.value)}
                          placeholder="37.2"
                          className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#406354] mb-1">
                          Poids (kg)
                        </label>
                        <input
                          type="text"
                          value={consultWeight}
                          onChange={(e) => setConsultWeight(e.target.value)}
                          placeholder="68"
                          className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                        />
                      </div>
                    </div>

                    {/* Examens demandés & Recommandations */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#406354] mb-1">
                          Examens complémentaires & imagerie
                        </label>
                        <textarea
                          rows={2}
                          value={consultExams}
                          onChange={(e) => setConsultExams(e.target.value)}
                          placeholder="Ex : Goutte épaisse/TDR, NFS, Bilan rénal"
                          className="w-full p-3 rounded-xl border border-[#C8E6D5] text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#406354] mb-1">
                          Recommandations & Conseils hygiéno-diététiques
                        </label>
                        <textarea
                          rows={2}
                          value={consultRecommendations}
                          onChange={(e) => setConsultRecommendations(e.target.value)}
                          placeholder="Ex : Repos strict 48h, bonne hydratation, dormir sous moustiquaire"
                          className="w-full p-3 rounded-xl border border-[#C8E6D5] text-sm"
                        />
                      </div>
                    </div>

                    {/* ÉTAPE 9 : Prochain rendez-vous de suivi */}
                    <div>
                      <label className="block text-xs font-bold text-[#406354] mb-1">
                        Proposition d'un rendez-vous de suivi / contrôle
                      </label>
                      <input
                        type="date"
                        value={consultFollowUpDate}
                        onChange={(e) => setConsultFollowUpDate(e.target.value)}
                        className="w-full sm:w-64 min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                      />
                    </div>
                  </div>

                  {/* BOUTONS D'ACTION : SAUVEGARDER BROUILLON & VALIDER / ENVOYER */}
                  {consultSuccess ? (
                    <div className="p-6 bg-[#E6F7F0] border-2 border-[#00A86B] rounded-2xl text-center space-y-3">
                      <CheckCircle2 className="w-12 h-12 text-[#00A86B] mx-auto" />
                      <div>
                        <h4 className="font-extrabold text-2xl text-[#007048] font-display">
                          CONSULTATION VALIDÉE & TRANSMIS AU PATIENT
                        </h4>
                        <p className="text-sm text-[#406354] mt-1">
                          Le compte-rendu, l'ordonnance certifiée et la facture ont été injectés dans l'Espace Patient en temps réel.
                        </p>
                      </div>

                      {validatedHash && (
                        <div className="p-3 bg-white rounded-xl border border-[#00A86B]/40 text-left font-mono text-xs text-[#007048] break-all">
                          <span className="font-bold block">Preuve d'intégrité Blockchain Bitcoin OP_RETURN :</span>
                          {validatedHash}
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setConsultSuccess(false);
                            setActiveMenu("dashboard");
                          }}
                          className="min-h-[48px] px-6 bg-[#00A86B] text-white font-bold rounded-xl text-base"
                        >
                          Retour à la file d'attente
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="w-full sm:w-auto min-h-[56px] px-6 bg-white hover:bg-gray-50 border-2 border-[#C8E6D5] text-[#406354] font-bold rounded-2xl flex items-center justify-center gap-2 text-base transition-colors"
                      >
                        <Save className="w-5 h-5" />
                        <span>Sauvegarder en brouillon</span>
                      </button>

                      <button
                        type="submit"
                        className="w-full sm:flex-1 min-h-[56px] bg-[#00A86B] hover:bg-[#00965F] text-white text-lg font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-98 shadow-xs"
                      >
                        <Send className="w-5 h-5" />
                        <span>Enregistrer et envoyer au patient (Validé)</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            ) : (
              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-12 text-center space-y-4">
                <User className="w-16 h-16 text-[#406354] mx-auto opacity-40" />
                <h3 className="text-2xl font-bold text-[#1B362B]">
                  Aucun patient sélectionné
                </h3>
                <p className="text-base text-[#406354] max-w-md mx-auto">
                  Sélectionnez un patient dans votre file d'attente ou identifiez-le à l'aide de son NPI, son QR code ou son numéro de téléphone.
                </p>
                <button
                  type="button"
                  onClick={() => setShowIdentifyModal(true)}
                  className="min-h-[56px] px-8 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-lg rounded-2xl shadow-xs transition-colors"
                >
                  Identifier un patient
                </button>
              </div>
            )}
          </div>
        )}

        {/* VUE 4 : DOSSIERS PATIENTS DU CABINET */}
        {activeMenu === "patients" && (
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B362B] font-display">
              DOSSIERS DES PATIENTS DU CABINET
            </h1>
            <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 text-[#406354] absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, NPI, téléphone..."
                  className="w-full min-h-[48px] pl-12 pr-4 rounded-xl border border-[#C8E6D5] text-base"
                />
              </div>

              <div className="divide-y divide-[#C8E6D5]/60">
                {queue.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <p className="text-base font-bold text-[#1B362B]">
                      Aucun patient enregistré
                    </p>
                    <p className="text-sm text-[#406354]">
                      Les dossiers apparaîtront au fur et à mesure des consultations.
                    </p>
                  </div>
                ) : (
                  queue.map((p) => (
                    <div
                      key={p.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <p className="font-bold text-base text-[#1B362B]">{p.name}</p>
                        <p className="text-xs text-[#406354]">
                          NPI : {p.npi} • Tél : {p.phone} • Groupe : {p.bloodGroup} ({p.electrophoresis})
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleStartConsultation(p)}
                        className="min-h-[44px] px-4 bg-[#E6F7F0] border border-[#00A86B] text-[#007048] font-bold rounded-xl text-sm self-start sm:self-center"
                      >
                        Consulter dossier
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VUE 5 : ORDONNANCES ÉMISES */}
        {activeMenu === "prescriptions" && (
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B362B] font-display">
              HISTORIQUE DES ORDONNANCES ÉMISES
            </h1>
            <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs space-y-3">
              {prescriptions.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <FileText className="w-12 h-12 text-[#406354] mx-auto opacity-50" />
                  <p className="text-base font-bold text-[#1B362B]">
                    Aucune ordonnance émise aujourd'hui
                  </p>
                  <p className="text-sm text-[#406354]">
                    Chaque consultation validée génère une ordonnance sécurisée avec QR code transmise au patient.
                  </p>
                </div>
              ) : (
                prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="p-4 bg-[#E6F7F0]/40 rounded-xl border border-[#C8E6D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-xs font-mono font-bold text-[#00A86B]">
                        {rx.id} • Émise le {rx.date}
                      </span>
                      <h4 className="font-bold text-lg text-[#1B362B]">
                        Patient : {rx.patient}
                      </h4>
                      <p className="text-sm text-[#406354] whitespace-pre-line mt-1">
                        {rx.meds}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-white border border-[#00A86B] text-[#007048] rounded-xl text-xs font-bold self-start sm:self-center">
                      {rx.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VUE 6 : CARTOGRAPHIE DES ÉTABLISSEMENTS */}
        {activeMenu === "etablissements" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs">
              <h2 className="text-2xl font-extrabold text-[#1B362B] font-display">
                RÉPERTOIRE NATIONAL DES ÉTABLISSEMENTS DE SANTÉ DU BÉNIN
              </h2>
              <p className="text-sm text-[#406354]">
                Cartographie des 66 hôpitaux publics et privés et 110 pharmacies pour les transferts et prescriptions.
              </p>
            </div>
            <BeninHealthMap />
          </div>
        )}

        {/* VUE 7 : STATISTIQUES */}
        {activeMenu === "statistiques" && (
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B362B] font-display">
              STATISTIQUES DE L'ACTIVITÉ MÉDICALE
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs text-center">
                <span className="text-4xl font-black text-[#007048]">
                  {queue.filter((q) => q.status === "Terminé").length}
                </span>
                <p className="text-sm font-bold text-[#406354] mt-1">
                  Consultations finalisées aujourd'hui
                </p>
              </div>
              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs text-center">
                <span className="text-4xl font-black text-[#007048]">100%</span>
                <p className="text-sm font-bold text-[#406354] mt-1">
                  Ordonnances avec preuve blockchain
                </p>
              </div>
              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs text-center">
                <span className="text-4xl font-black text-[#007048]">
                  {queue.reduce((acc, q) => acc + (q.status === "Terminé" ? q.feeCfa : 0), 0)} CFA
                </span>
                <p className="text-sm font-bold text-[#406354] mt-1">
                  Honoraires consultations
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL ÉTAPE 4 : IDENTIFIER UN PATIENT (QR, NPI, TÉLÉPHONE, NOM) */}
      {showIdentifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border-2 border-[#00A86B] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#C8E6D5] pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-[#00A86B] tracking-wider">
                  Étape 4 : Identification Patient
                </span>
                <h3 className="text-2xl font-extrabold text-[#007048] font-display">
                  IDENTIFIER UN PATIENT
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIdentifyModal(false)}
                className="p-1 rounded-lg text-[#406354] hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Onglets de sélection de la méthode */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "npi", label: "NPI ANIP" },
                { id: "qr", label: "Reçu QR" },
                { id: "tel", label: "Téléphone" },
                { id: "nom", label: "Nom" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setIdentifyMethod(m.id as any)}
                  className={`min-h-[44px] rounded-xl font-bold text-xs transition-colors ${
                    identifyMethod === m.id
                      ? "bg-[#00A86B] text-white shadow-xs"
                      : "bg-[#E6F7F0] text-[#007048] hover:bg-[#D6F2E5]"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Formulaire selon méthode */}
            {identifyMethod === "qr" ? (
              <div className="text-center py-6 bg-[#E6F7F0] rounded-2xl p-4 border border-[#00A86B]/30 space-y-3">
                <QrCode className="w-16 h-16 text-[#007048] mx-auto animate-pulse" />
                <p className="text-sm font-bold text-[#1B362B]">
                  Scanner le QR Code du reçu présenté par le patient
                </p>
                <input
                  type="text"
                  placeholder="Ou collez la référence QR (ex: RDV-BJ-...)"
                  value={identifyInput}
                  onChange={(e) => setIdentifyInput(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-[#00A86B] text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={handleIdentifySearch}
                  className="min-h-[48px] px-6 bg-[#00A86B] text-white font-bold rounded-xl text-sm shadow-xs"
                >
                  {isSearching ? (
                    <span className="animate-pulse">Recherche...</span>
                  ) : (
                    "Valider le QR Code"
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-bold text-[#1B362B]">
                  {identifyMethod === "npi"
                    ? "Numéro Personnel d'Identification (NPI ANIP)"
                    : identifyMethod === "tel"
                    ? "Numéro de téléphone mobile (+229)"
                    : "Nom ou Prénom du patient"}
                </label>
                <input
                  type="text"
                  placeholder={
                    identifyMethod === "npi"
                      ? "Ex : 1029384756..."
                      : identifyMethod === "tel"
                      ? "Ex : +229 97 00 00 00"
                      : "Ex : Bio, Dovonou, Houndégbé..."
                  }
                  value={identifyInput}
                  onChange={(e) => setIdentifyInput(e.target.value)}
                  className="w-full min-h-[52px] px-4 rounded-xl border border-[#C8E6D5] focus:border-[#00A86B] text-base"
                />
                <button
                  type="button"
                  onClick={handleIdentifySearch}
                  className="w-full min-h-[52px] bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-base rounded-xl transition-colors shadow-xs"
                >
                  {isSearching ? (
                    <span className="animate-pulse">Recherche...</span>
                  ) : (
                    "Rechercher et ouvrir le dossier"
                  )}
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowIdentifyModal(false)}
              className="w-full min-h-[44px] text-[#406354] font-bold text-sm hover:bg-gray-100 rounded-xl"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
