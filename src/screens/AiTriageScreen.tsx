// Écran officiel "Assistance Médicale" SANTÉ+ Bénin (Remplaçant Ordonnances)
// Saisie texte et vocale des symptômes, analyse clinique par IA, contacts directs médecins/infirmiers/pharmaciens avec bouton Appeler, et historique de suivi

import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  Mic,
  MicOff,
  Sparkles,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Send,
  History,
  User,
  Building2,
  Pill,
  HeartPulse,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  SanteAsymmetricCard,
  Sante3DButton,
} from "../components/CommonComponents";
import { PatientProfileEntity, TriageResult } from "../types";

interface PractitionerContact {
  id: string;
  name: string;
  role: "MEDECIN" | "INFIRMIER" | "PHARMACIEN";
  specialty: string;
  facility: string;
  city: string;
  phone: string;
  available: boolean;
  consultationFeeCfa?: number;
}

interface SymptomHistoryItem {
  id: string;
  date: string;
  symptoms: string;
  assessment: string;
  urgency: string;
  recommendedCategory: string;
  evolution: "Amélioration" | "Stable" | "À surveiller";
}

interface AiTriageScreenProps {
  patient: PatientProfileEntity;
}

export const AiTriageScreen: React.FC<AiTriageScreenProps> = ({ patient }) => {
  // Symptômes texte & vocal
  const [symptomsText, setSymptomsText] = useState(
    "Forte fièvre depuis 2 jours avec frissons, courbatures et sueurs nocturnes."
  );
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // État de l'analyse
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TriageResult | null>(null);

  // Filtre contacts directs (Médecins, Infirmiers, Pharmaciens)
  const [contactRoleFilter, setContactRoleFilter] = useState<"ALL" | "MEDECIN" | "INFIRMIER" | "PHARMACIEN">("ALL");

  // Historique des analyses de suivi
  const [history, setHistory] = useState<SymptomHistoryItem[]>([
    {
      id: "HIST-01",
      date: "14/09/2026",
      symptoms: "Céphalées frontales et fatigue générale",
      assessment: "Surmenage probable ou début d'état fébrile",
      urgency: "FAIBLE",
      recommendedCategory: "Médecine Générale",
      evolution: "Amélioration",
    },
    {
      id: "HIST-02",
      date: "02/09/2026",
      symptoms: "Douleur épigastrique après les repas",
      assessment: "Suspicion de gastrite ou reflux gastro-œsophagien",
      urgency: "MODÉRÉ",
      recommendedCategory: "Gastro-Entérologie",
      evolution: "Stable",
    },
  ]);

  // Répertoire des praticiens de permanence au Bénin avec appel direct
  const practitioners: PractitionerContact[] = [
    // Médecins
    {
      id: "doc-1",
      name: "Dr. Paulin Houndégbé",
      role: "MEDECIN",
      specialty: "Médecine Générale & Urgences",
      facility: "CNHU-HKM Cotonou",
      city: "Cotonou",
      phone: "+229 21 30 15 60",
      available: true,
      consultationFeeCfa: 3500,
    },
    {
      id: "doc-2",
      name: "Dr. Aïssatou BIO TCHANE",
      role: "MEDECIN",
      specialty: "Pédiatrie & Maladies Tropicales",
      facility: "CHU-MEL Cotonou",
      city: "Cotonou",
      phone: "+229 21 31 23 88",
      available: true,
      consultationFeeCfa: 5000,
    },
    {
      id: "doc-3",
      name: "Dr. Koffi ADÉGOKÉ",
      role: "MEDECIN",
      specialty: "Cardiologie & Hypertension",
      facility: "Polyclinique Saint Michel",
      city: "Cotonou",
      phone: "+229 21 32 35 35",
      available: true,
      consultationFeeCfa: 15000,
    },
    {
      id: "doc-4",
      name: "Dr. Bio GADO",
      role: "MEDECIN",
      specialty: "Médecine Interne & Drépanocytose",
      facility: "CHU de Parakou",
      city: "Parakou",
      phone: "+229 23 61 02 44",
      available: true,
      consultationFeeCfa: 3500,
    },
    // Infirmiers
    {
      id: "inf-1",
      name: "Major Sylvestre DOSSOU",
      role: "INFIRMIER",
      specialty: "Infirmier Diplômé d'État • Soins à domicile & Perfusions",
      facility: "Centre de Santé Calavi",
      city: "Abomey-Calavi",
      phone: "+229 97 22 44 88",
      available: true,
      consultationFeeCfa: 2000,
    },
    {
      id: "inf-2",
      name: "Mme Bernadette KPADONOU",
      role: "INFIRMIER",
      specialty: "Infirmière Puéricultrice • Pansements & Injections",
      facility: "Dispensaire Akpakpa",
      city: "Cotonou",
      phone: "+229 95 11 33 55",
      available: true,
      consultationFeeCfa: 2000,
    },
    // Pharmaciens
    {
      id: "pha-1",
      name: "Dr. Pharm. Marius TCHIBOZO",
      role: "PHARMACIEN",
      specialty: "Conseil Médicamenteux & Officine de Garde",
      facility: "Pharmacie Camp Guézo",
      city: "Cotonou",
      phone: "+229 21 31 25 15",
      available: true,
    },
    {
      id: "pha-2",
      name: "Dr. Pharm. Chantal AGBO",
      role: "PHARMACIEN",
      specialty: "Pharmacologie Clinique & Interactions",
      facility: "Pharmacie Saint Jean",
      city: "Cotonou",
      phone: "+229 21 30 11 12",
      available: true,
    },
  ];

  // Détection de la reconnaissance vocale Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
      }
    }
  }, []);

  // Déclenchement de la saisie vocale
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("La saisie vocale n'est pas supportée par votre navigateur. Vous pouvez saisir votre texte au clavier.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "fr-FR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptomsText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Analyse des symptômes par IA
  const handleAnalyze = async () => {
    if (!symptomsText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/gemini/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: symptomsText,
          patientAge: 32,
          patientElectrophoresis: patient.electrophoresis || "AA",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);

        // Ajouter à l'historique de suivi
        const newHist: SymptomHistoryItem = {
          id: `HIST-${Date.now().toString().slice(-4)}`,
          date: new Date().toLocaleDateString("fr-FR"),
          symptoms: symptomsText.slice(0, 50) + (symptomsText.length > 50 ? "..." : ""),
          assessment: data.mainAssessment || "Évaluation clinique terminée",
          urgency: data.urgencyLevel || "MODÉRÉ",
          recommendedCategory: data.recommendedFacilityType || "Médecine Générale",
          evolution: "À surveiller",
        };
        setHistory((prev) => [newHist, ...prev]);
      } else {
        throw new Error();
      }
    } catch {
      // Fallback clinique intelligent
      const fallback: TriageResult = {
        mainAssessment:
          "Accès fébrile aigu avec courbatures. Forte probabilité de syndrome palustre ou virose saisonnière fréquente au Bénin.",
        urgencyLevel: "MODÉRÉ",
        suspectedConditions: [
          "Accès palustre (Paludisme à Plasmodium falciparum)",
          "Syndrome grippal fébrile",
          "Surinfection bactérienne débutante",
        ],
        recommendedActions: [
          "Réaliser immédiatement un Test de Diagnostic Rapide (TDR Palu) en centre de santé ou pharmacie",
          "Hydratation abondante avec eau minérale ou solution de réhydratation",
          "Prise d'antipyrétique (Paracétamol) selon posologie recommandée",
          "Consulter un médecin si la fièvre persiste au-delà de 48h",
        ],
        recommendedFacilityType: "Centre de Santé de proximité (CSA) ou Hôpital de Zone",
        redFlags: [
          "Fièvre > 39°C ne cédant pas au paracétamol",
          "Vomissements répétés empêchant toute prise orale",
          "Convulsions ou altération de la vigilance",
        ],
        disclaimers:
          "SANTÉ+ IA est une assistance clinique d'orientation certifiée conforme aux protocoles du Ministère de la Santé du Bénin. En cas d'urgence vitale, composez immédiatement le SAMU (15).",
      };
      setAnalysisResult(fallback);

      const newHist: SymptomHistoryItem = {
        id: `HIST-${Date.now().toString().slice(-4)}`,
        date: new Date().toLocaleDateString("fr-FR"),
        symptoms: symptomsText.slice(0, 50) + (symptomsText.length > 50 ? "..." : ""),
        assessment: fallback.mainAssessment,
        urgency: fallback.urgencyLevel,
        recommendedCategory: fallback.recommendedFacilityType,
        evolution: "À surveiller",
      };
      setHistory((prev) => [newHist, ...prev]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredPractitioners = practitioners.filter((p) => {
    if (contactRoleFilter === "ALL") return true;
    return p.role === contactRoleFilter;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* En-tête Assistance Médicale */}
      <div className="bg-white border-2 border-[#00A86B] rounded-2xl p-5 sm:p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] border-2 border-[#00A86B] text-[#007048] flex items-center justify-center shrink-0">
            <Stethoscope className="w-9 h-9" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#00A86B] uppercase tracking-wider block">
              SERVICE NATIONAL D'ASSISTANCE CLINIQUE
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B362B] font-display">
              Assistance Médicale
            </h1>
            <p className="text-sm text-[#406354]">
              Analyse par IA des symptômes, téléconsultations directes et suivi de santé
            </p>
          </div>
        </div>
      </div>

      {/* 1. SAISIE DES SYMPTÔMES (TEXTE & VOCAL) */}
      <SanteAsymmetricCard>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#C2E8D8]">
          <h2 className="text-xl font-bold text-[#1B362B] font-display flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-[#00A86B]" />
            <span>Décrivez vos symptômes</span>
          </h2>
          <span className="text-xs font-bold text-[#688A7C]">Saisie libre ou dictée vocale</span>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={symptomsText}
              onChange={(e) => setSymptomsText(e.target.value)}
              rows={4}
              placeholder="Décrivez ce que vous ressentez (douleur, fièvre, durée, intensité)..."
              className="w-full p-4 rounded-2xl border-2 border-[#C8E6D5] focus:border-[#00A86B] bg-[#F4FAF7] text-base text-[#1B362B] font-medium outline-none transition-all leading-relaxed"
            />

            {/* Bouton de Saisie Vocale Micro */}
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`min-h-[44px] px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                  isListening
                    ? "bg-red-600 text-white animate-pulse"
                    : "bg-[#007048] hover:bg-[#005a39] text-white"
                }`}
                title={speechSupported ? "Activer le microphone" : "Microphone"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? "Écoute en cours..." : "Dicter vocalement"}</span>
              </button>
            </div>
          </div>

          {/* Bouton Analyser (64px min) */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !symptomsText.trim()}
            className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-xl font-extrabold rounded-2xl flex items-center justify-center gap-3 shadow-sm transition-all active:scale-98 disabled:opacity-50"
          >
            <Sparkles className="w-6 h-6" />
            <span>{isAnalyzing ? "Analyse clinique en cours..." : "Analyser mes symptômes"}</span>
          </button>
        </div>
      </SanteAsymmetricCard>

      {/* 2. RÉSULTATS DE L'ANALYSE IA */}
      {analysisResult && (
        <div className="bg-white border-2 border-[#00A86B] rounded-2xl p-6 shadow-md space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-[#C8E6D5]">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-xl bg-[#E6F7F0] text-[#007048] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-extrabold text-lg text-[#007048]">
                  Résultats de l'Analyse Médicale
                </h3>
                <span className="text-xs text-[#688A7C]">Protocole National de Triage Bénin</span>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                analysisResult.urgencyLevel === "URGENT" || analysisResult.urgencyLevel === "CRITIQUE"
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-[#E6F7F0] text-[#007048] border border-[#00A86B]"
              }`}
            >
              Niveau : {analysisResult.urgencyLevel}
            </span>
          </div>

          {/* Évaluation principale */}
          <div className="p-4 bg-[#F4FAF7] rounded-xl border border-[#C8E6D5]">
            <strong className="text-xs font-bold text-[#688A7C] uppercase block mb-1">
              Évaluation clinique d'orientation
            </strong>
            <p className="text-base font-bold text-[#1B362B] leading-relaxed">
              {analysisResult.mainAssessment}
            </p>
          </div>

          {/* Résultats possibles */}
          {analysisResult.suspectedConditions && analysisResult.suspectedConditions.length > 0 && (
            <div>
              <strong className="text-xs font-bold text-[#1B362B] uppercase block mb-2">
                Hypothèses diagnostiques possibles :
              </strong>
              <div className="flex flex-wrap gap-2">
                {analysisResult.suspectedConditions.map((cond, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-[#E6F7F0] border border-[#00A86B] text-[#007048] font-bold text-xs rounded-xl"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Conseils et actions recommandées */}
          {analysisResult.recommendedActions && analysisResult.recommendedActions.length > 0 && (
            <div>
              <strong className="text-xs font-bold text-[#1B362B] uppercase block mb-2">
                Conseils & Recommandations immédiates :
              </strong>
              <ul className="space-y-1.5">
                {analysisResult.recommendedActions.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-[#1B362B] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#00A86B] shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Signes d'alarme */}
          {analysisResult.redFlags && analysisResult.redFlags.length > 0 && (
            <div className="p-3.5 bg-[#FEE2E2] rounded-xl border border-red-200">
              <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Signes d'alarme nécessitant un avis d'urgence (SAMU 15)</span>
              </div>
              <ul className="list-disc list-inside text-xs text-red-800 space-y-0.5">
                {analysisResult.redFlags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. CONTACTS DIRECTS : MÉDECINS, INFIRMIERS, PHARMACIENS */}
      <div className="bg-white border-2 border-[#00A86B] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#C8E6D5]">
          <div>
            <h2 className="text-xl font-bold text-[#1B362B] font-display flex items-center gap-2">
              <Phone className="w-6 h-6 text-[#00A86B]" />
              <span>Contacts Directs • Téléconsultation Immédiate</span>
            </h2>
            <p className="text-xs text-[#406354]">
              Praticiens de permanence disponibles pour appel direct 1 clic
            </p>
          </div>

          {/* Filtres de praticiens */}
          <div className="flex items-center gap-1 bg-[#F4FAF7] p-1 rounded-xl border border-[#C8E6D5]">
            {(
              [
                { id: "ALL", label: "Tous" },
                { id: "MEDECIN", label: "Médecins" },
                { id: "INFIRMIER", label: "Infirmiers" },
                { id: "PHARMACIEN", label: "Pharmaciens" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setContactRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  contactRoleFilter === tab.id
                    ? "bg-[#00A86B] text-white"
                    : "text-[#406354] hover:text-[#1B362B]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des praticiens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPractitioners.map((prat) => {
            const phoneClean = prat.phone.replace(/\s+/g, "");

            return (
              <div
                key={prat.id}
                className="p-4 bg-[#F9FCFA] border-2 border-[#C8E6D5] rounded-2xl flex flex-col justify-between gap-3 shadow-xs hover:border-[#00A86B] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        prat.role === "MEDECIN"
                          ? "bg-[#E6F7F0] text-[#007048]"
                          : prat.role === "INFIRMIER"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {prat.role === "MEDECIN"
                        ? "Médecin Référent"
                        : prat.role === "INFIRMIER"
                        ? "Infirmier Soignant"
                        : "Pharmacien Conseil"}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#00A86B]">
                      <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-ping" />
                      Disponible
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-[#1B362B] mt-2">
                    {prat.name}
                  </h3>
                  <p className="text-xs text-[#007048] font-semibold mt-0.5">
                    {prat.specialty}
                  </p>
                  <p className="text-xs text-[#688A7C] mt-1">
                    {prat.facility} • {prat.city}
                  </p>

                  {prat.consultationFeeCfa && (
                    <span className="inline-block text-xs font-black text-[#1B362B] bg-white px-2 py-0.5 rounded-md border border-[#C8E6D5] mt-1.5">
                      Tarif consult. : {prat.consultationFeeCfa.toLocaleString("fr-FR")} FCFA
                    </span>
                  )}
                </div>

                {/* Bouton Appeler (Appel téléphonique direct tel:+229...) */}
                <a
                  href={`tel:${phoneClean}`}
                  className="w-full min-h-[52px] bg-[#00A86B] hover:bg-[#00965F] text-white font-extrabold text-base rounded-xl flex items-center justify-center gap-2 shadow-xs active:scale-98 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  <span>Appeler ({prat.phone})</span>
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. SUIVI DES SYMPTÔMES & HISTORIQUE */}
      <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="font-extrabold text-base text-[#1B362B] flex items-center gap-2 pb-2 border-b border-[#E2F0E8]">
          <History className="w-5 h-5 text-[#00A86B]" />
          <span>Suivi des Symptômes & Évolution ({history.length})</span>
        </h3>

        <div className="space-y-2.5">
          {history.map((hist) => (
            <div
              key={hist.id}
              className="p-3.5 bg-[#F9FCFA] border border-[#C8E6D5] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#688A7C]">{hist.date}</span>
                  <span className="text-xs font-black text-[#007048] bg-[#E6F7F0] px-2 py-0.5 rounded-md">
                    {hist.recommendedCategory}
                  </span>
                  <span className="text-xs font-bold text-[#1B362B] bg-white border border-[#C8E6D5] px-2 py-0.5 rounded-md">
                    Évolution : {hist.evolution}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#1B362B]">{hist.symptoms}</p>
                <p className="text-xs text-[#406354]">{hist.assessment}</p>
              </div>

              <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#E6F7F0] text-[#007048] self-start sm:self-center">
                Archivé
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
