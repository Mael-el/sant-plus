import React, { useState } from "react";
import {
  FolderHeart,
  FileText,
  Activity,
  UserCheck,
  Plus,
  QrCode,
  Download,
  Share2,
  Calendar,
  Lock,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  SanteAsymmetricCard,
  Sante3DButton,
  MedicationQrDialog,
  FhirExportDialog,
} from "../components/CommonComponents";
import {
  PatientProfileEntity,
  FhirEncounterEntity,
  FhirMedicationRequestEntity,
  FhirObservationEntity,
  PaymentRecordEntity,
} from "../types";
import {
  downloadMedicalRecordPdf,
  downloadMedicalInvoicesPdf,
} from "../utils/receiptGenerator";

interface FhirDossierScreenProps {
  patient: PatientProfileEntity;
  encounters: FhirEncounterEntity[];
  medications: FhirMedicationRequestEntity[];
  observations: FhirObservationEntity[];
  payments?: PaymentRecordEntity[];
  onAddObservation: (obs: Omit<FhirObservationEntity, "id">) => void;
  onAddEncounter: (enc: Omit<FhirEncounterEntity, "id">) => void;
}

export const FhirDossierScreen: React.FC<FhirDossierScreenProps> = ({
  patient,
  encounters,
  medications,
  observations,
  payments = [],
  onAddObservation,
  onAddEncounter,
}) => {
  const [activeTab, setActiveTab] = useState<
    "consultations" | "ordonnances" | "constantes" | "anip"
  >("consultations");

  const [selectedMedication, setSelectedMedication] =
    useState<FhirMedicationRequestEntity | null>(null);

  const [showFhirExportModal, setShowFhirExportModal] = useState(false);
  const [showAddObsModal, setShowAddObsModal] = useState(false);
  const [showAddEncModal, setShowAddEncModal] = useState(false);

  // Formulaire nouvelle constante
  const [newObsCategory, setNewObsCategory] = useState("Tension Artérielle");
  const [newObsValue, setNewObsValue] = useState("");
  const [newObsUnit, setNewObsUnit] = useState("mmHg");
  const [newObsInterp, setNewObsInterp] = useState("Normal");

  // Formulaire nouvelle consultation
  const [newEncFacility, setNewEncFacility] = useState("");
  const [newEncDoctor, setNewEncDoctor] = useState("");
  const [newEncService, setNewEncService] = useState("Médecine Générale");
  const [newEncDiag, setNewEncDiag] = useState("");
  const [newEncNotes, setNewEncNotes] = useState("");

  const handleCreateObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObsValue) return;
    onAddObservation({
      category: newObsCategory,
      value: newObsValue,
      unit: newObsUnit,
      recordedDate: new Date().toLocaleDateString("fr-FR"),
      interpretation: newObsInterp,
    });
    setNewObsValue("");
    setShowAddObsModal(false);
  };

  const handleCreateEncounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEncDiag) return;
    onAddEncounter({
      facilityName: newEncFacility,
      practitionerName: newEncDoctor,
      date: new Date().toLocaleDateString("fr-FR"),
      serviceType: newEncService,
      diagnosis: newEncDiag,
      notes: newEncNotes || "Consultation enregistrée avec succès.",
      status: "Terminé",
    });
    setNewEncDiag("");
    setNewEncNotes("");
    setShowAddEncModal(false);
  };

  // Génération du Bundle HL7 FHIR R4
  const generateFhirBundle = () => {
    const bundle = {
      resourceType: "Bundle",
      id: `SANTE-BJ-${patient.npi}-EXPORT`,
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"],
      },
      type: "document",
      identifier: {
        system: "https://sante.gouv.bj/fhir/bundle",
        value: `BUNDLE-${patient.npi}`,
      },
      entry: [
        {
          fullUrl: `urn:uuid:patient-${patient.npi}`,
          resource: {
            resourceType: "Patient",
            id: patient.npi,
            identifier: [
              {
                system: "https://anip.bj/npi",
                value: patient.npi,
                use: "official",
              },
            ],
            name: [
              {
                use: "official",
                text: patient.fullName,
              },
            ],
            gender: patient.gender === "Féminin" ? "female" : "male",
            birthDate: patient.dateOfBirth,
            telecom: [{ system: "phone", value: patient.phone }],
            address: [{ city: patient.city, country: "Benin" }],
            extension: [
              {
                url: "https://sante.gouv.bj/fhir/blood-group",
                valueString: patient.bloodGroup,
              },
              {
                url: "https://sante.gouv.bj/fhir/electrophoresis",
                valueString: patient.electrophoresis,
              },
            ],
          },
        },
        ...encounters.map((enc) => ({
          fullUrl: `urn:uuid:encounter-${enc.id}`,
          resource: {
            resourceType: "Encounter",
            id: `ENC-${enc.id}`,
            status: "finished",
            class: { code: "AMB", display: "Ambulatory" },
            type: [{ text: enc.serviceType }],
            subject: { reference: `Patient/${patient.npi}` },
            participant: [{ individual: { display: enc.practitionerName } }],
            serviceProvider: { display: enc.facilityName },
            reasonCode: [{ text: enc.diagnosis }],
          },
        })),
        ...medications.map((med) => ({
          fullUrl: `urn:uuid:medication-${med.id}`,
          resource: {
            resourceType: "MedicationRequest",
            id: `MED-${med.id}`,
            status: "active",
            intent: "order",
            medicationCodeableConcept: { text: med.medicationName },
            subject: { reference: `Patient/${patient.npi}` },
            dosageInstruction: [{ text: `${med.dosage} • ${med.frequency}` }],
            extension: [
              {
                url: "https://sante.gouv.bj/fhir/blockchain-proof",
                valueString: med.blockchainProofHash,
              },
            ],
          },
        })),
        ...observations.map((obs) => ({
          fullUrl: `urn:uuid:observation-${obs.id}`,
          resource: {
            resourceType: "Observation",
            id: `OBS-${obs.id}`,
            status: "final",
            code: { text: obs.category },
            subject: { reference: `Patient/${patient.npi}` },
            valueQuantity: {
              value: obs.value,
              unit: obs.unit,
            },
            interpretation: [{ text: obs.interpretation }],
          },
        })),
      ],
    };
    return JSON.stringify(bundle, null, 2);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* En-tête Dossier Médical */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderHeart className="w-7 h-7 text-[#007048]" />
            <h2 className="text-2xl sm:text-3xl font-bold text-[#007048] font-display">
              Dossier Médical FHIR R4
            </h2>
          </div>
          <p className="text-sm text-[#406354] mt-0.5">
            Dossier citoyen synchronisé • NPI ANIP : {patient.npi}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() =>
              downloadMedicalRecordPdf(patient, encounters, medications, observations)
            }
            className="px-4 py-2.5 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-transform active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger Dossier (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => downloadMedicalInvoicesPdf(patient, payments)}
            className="px-4 py-2.5 bg-[#E6F7F0] hover:bg-[#D5F0E4] border border-[#00A86B] text-[#007048] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger Factures (PDF)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFhirExportModal(true)}
            className="px-3 py-2 bg-white border border-[#C8E6D5] text-[#406354] hover:text-[#1B362B] font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs transition-colors"
            title="Format interopérable HL7 FHIR"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>FHIR JSON</span>
          </button>
        </div>
      </div>

      {/* Barre d'onglets */}
      <div className="flex overflow-x-auto gap-1 bg-[#E6F7F0] p-1.5 rounded-2xl border border-[#C2E8D8] no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("consultations")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "consultations"
              ? "bg-white text-[#007048] shadow-xs"
              : "text-[#406354] hover:text-[#007048]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Consultations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ordonnances")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "ordonnances"
              ? "bg-white text-[#007048] shadow-xs"
              : "text-[#406354] hover:text-[#007048]"
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Ordonnances</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("constantes")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "constantes"
              ? "bg-white text-[#007048] shadow-xs"
              : "text-[#406354] hover:text-[#007048]"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Constantes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("anip")}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            activeTab === "anip"
              ? "bg-white text-[#007048] shadow-xs"
              : "text-[#406354] hover:text-[#007048]"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Identité ANIP</span>
        </button>
      </div>

      {/* Contenu Onglet Consultations */}
      {activeTab === "consultations" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#1B362B]">
              Actes et Consultations Réalisés ({encounters.length})
            </h3>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E6F7F0] border border-[#C8E6D5] text-[#007048] font-bold text-xs rounded-xl">
              <Lock className="w-3.5 h-3.5" />
              <span>Lecture seule (Réservé aux médecins assermentés)</span>
            </div>
          </div>

          <div className="space-y-3">
            {encounters.length === 0 ? (
              <div className="bg-white border border-[#C8E6D5] rounded-3xl p-8 text-center text-[#406354] space-y-1 shadow-xs">
                {/* Production - À remplir par les vrais utilisateurs */}
                <p className="font-bold text-base text-[#1B362B]">Aucune consultation enregistrée.</p>
                <p className="text-xs text-[#688A7C]">Vos comptes-rendus médicaux s'afficheront ici après chaque consultation.</p>
              </div>
            ) : (
              encounters.map((enc) => (
                <SanteAsymmetricCard key={enc.id}>
                  <div className="flex items-start justify-between gap-3 pb-2 border-b border-[#C2E8D8]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-[#007048]">
                          {enc.serviceType}
                        </span>
                        <span className="px-2 py-0.5 bg-[#E6F7F0] text-[#007048] text-xs font-bold rounded-md">
                          {enc.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#688A7C] mt-0.5">
                        {enc.facilityName} • {enc.practitionerName}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#406354] bg-[#F4FAF7] px-2.5 py-1 rounded-lg">
                      {enc.date}
                    </span>
                  </div>

                  <div className="pt-3 space-y-1.5">
                    <p className="text-sm font-bold text-[#1B362B]">
                      Diagnostic : {enc.diagnosis}
                    </p>
                    <p className="text-xs text-[#406354] leading-relaxed">
                      {enc.notes}
                    </p>
                  </div>
                </SanteAsymmetricCard>
              ))
            )}
          </div>
        </div>
      )}

      {/* Contenu Onglet Ordonnances */}
      {activeTab === "ordonnances" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#1B362B]">
              Prescriptions Médicales & QR Blockchain ({medications.length})
            </h3>
          </div>

          <div className="space-y-3">
            {medications.length === 0 ? (
              <div className="bg-white border border-[#C8E6D5] rounded-3xl p-8 text-center text-[#406354] space-y-1 shadow-xs">
                {/* Production - À remplir par les vrais utilisateurs */}
                <p className="font-bold text-base text-[#1B362B]">Aucune ordonnance délivrée.</p>
                <p className="text-xs text-[#688A7C]">Vos prescriptions électroniques vérifiées apparaîtront ici.</p>
              </div>
            ) : (
              medications.map((med) => (
                <SanteAsymmetricCard key={med.id}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#C2E8D8]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-[#007048]">
                          {med.medicationName}
                        </h4>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            med.status === "Actif"
                              ? "bg-[#E6F7F0] text-[#007048]"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {med.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#688A7C] mt-0.5">
                        Prescrit par {med.doctorName} ({med.facilityName}) le{" "}
                        {med.prescribedDate}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedMedication(med)}
                      className="self-start sm:self-center px-3.5 py-2 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Vérification QR</span>
                    </button>
                  </div>

                  <div className="pt-3 space-y-2">
                    <div className="p-2.5 bg-[#F4FAF7] rounded-xl border border-[#C2E8D8] text-xs">
                      <p className="font-semibold text-[#1B362B]">
                        Posologie : {med.dosage}
                      </p>
                      <p className="text-[#406354]">{med.frequency}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#688A7C]">
                      <span>Durée : {med.durationDays} jours</span>
                      <span className="font-mono truncate max-w-[240px]">
                        OP_RETURN : {med.blockchainProofHash}
                      </span>
                    </div>
                  </div>
                </SanteAsymmetricCard>
              ))
            )}
          </div>
        </div>
      )}

      {/* Contenu Onglet Constantes Vitales */}
      {activeTab === "constantes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#1B362B]">
              Suivi des Paramètres Physiologiques ({observations.length})
            </h3>
            <button
              type="button"
              onClick={() => setShowAddObsModal(true)}
              className="px-3.5 py-1.5 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer une mesure</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {observations.length === 0 ? (
              <div className="sm:col-span-2 bg-white border border-[#C8E6D5] rounded-3xl p-8 text-center text-[#406354] space-y-1 shadow-xs">
                {/* Production - À remplir par les vrais utilisateurs */}
                <p className="font-bold text-base text-[#1B362B]">Aucune constante enregistrée.</p>
                <p className="text-xs text-[#688A7C]">Enregistrez votre tension, glycémie ou température pour le suivi.</p>
              </div>
            ) : (
              observations.map((obs) => (
                <div
                  key={obs.id}
                  className="bg-white p-4 rounded-2xl border border-[#C8E6D5] shadow-xs flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs text-[#688A7C] font-semibold">
                      {obs.recordedDate}
                    </span>
                    <h4 className="font-bold text-sm text-[#1B362B]">
                      {obs.category}
                    </h4>
                    <p className="text-2xl font-black text-[#007048] my-0.5 font-display">
                      {obs.value}{" "}
                      <span className="text-xs font-normal text-[#406354]">
                        {obs.unit}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      obs.interpretation === "Normal"
                        ? "bg-[#E6F7F0] text-[#007048]"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {obs.interpretation}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Contenu Onglet Identité ANIP */}
      {activeTab === "anip" && (
        <div className="space-y-4">
          <SanteAsymmetricCard>
            <div className="flex items-center justify-between pb-3 border-b border-[#C2E8D8]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-[#00A86B]" />
                <h3 className="font-bold text-lg text-[#007048] font-display">
                  Identité Biométrique & Données Fondamentales ANIP
                </h3>
              </div>
              <span className="px-2.5 py-1 bg-[#E6F7F0] text-[#007048] text-xs font-bold rounded-lg border border-[#00A86B]">
                {patient.anipStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-sm">
              <div>
                <span className="text-xs text-[#688A7C] block font-semibold">
                  Numéro Personnel d'Identification (NPI)
                </span>
                <span className="font-mono font-bold text-base text-[#1B362B]">
                  {patient.npi}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#688A7C] block font-semibold">
                  Nom & Prénoms Officiels
                </span>
                <span className="font-bold text-base text-[#1B362B]">
                  {patient.fullName}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#688A7C] block font-semibold">
                  Groupe Sanguin & Rhésus
                </span>
                <span className="font-bold text-[#007048] text-lg">
                  {patient.bloodGroup}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#688A7C] block font-semibold">
                  Profil Électrophorétique de l'Hémoglobine
                </span>
                <span className="font-bold text-[#007048] text-lg">
                  {patient.electrophoresis}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#688A7C] block font-semibold">
                  Allergies Signalées
                </span>
                <span className="font-medium text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                  {patient.allergies}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#688A7C] block font-semibold">
                  Contact d'Urgence Déclaré
                </span>
                <span className="font-medium text-[#1B362B]">
                  {patient.emergencyContact}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#688A7C] block font-semibold">
                  Téléphone Principal
                </span>
                <span className="font-mono font-medium text-[#1B362B]">
                  {patient.phone}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#688A7C] block font-semibold">
                  Ville / Commune
                </span>
                <span className="font-medium text-[#1B362B]">{patient.city}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#C2E8D8] flex flex-col sm:flex-row gap-3">
              <Sante3DButton
                text="Exporter en format officiel FHIR HL7 R4"
                onClick={() => setShowFhirExportModal(true)}
              />
            </div>
          </SanteAsymmetricCard>
        </div>
      )}

      {/* Modal Ajout Constante */}
      {showAddObsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-[#00A86B]">
            <div className="flex items-center justify-between pb-3 border-b border-[#C2E8D8]">
              <h3 className="font-bold text-lg text-[#007048]">
                Nouvelle Constante Vitale
              </h3>
              <button
                onClick={() => setShowAddObsModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateObservation} className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B362B] mb-1">
                  Type de mesure
                </label>
                <select
                  value={newObsCategory}
                  onChange={(e) => {
                    setNewObsCategory(e.target.value);
                    if (e.target.value === "Tension Artérielle")
                      setNewObsUnit("mmHg");
                    else if (e.target.value === "Température")
                      setNewObsUnit("°C");
                    else if (e.target.value === "Glycémie")
                      setNewObsUnit("g/L");
                    else if (e.target.value === "Fréquence Cardiaque")
                      setNewObsUnit("bpm");
                    else if (e.target.value === "Poids")
                      setNewObsUnit("kg");
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#C2E8D8] text-sm"
                >
                  <option value="Tension Artérielle">Tension Artérielle</option>
                  <option value="Température">Température Corporelle</option>
                  <option value="Glycémie">Glycémie à jeun</option>
                  <option value="Fréquence Cardiaque">Fréquence Cardiaque</option>
                  <option value="Hémoglobine">Taux d'Hémoglobine</option>
                  <option value="Poids">Poids</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1B362B] mb-1">
                    Valeur
                  </label>
                  <input
                    type="text"
                    value={newObsValue}
                    onChange={(e) => setNewObsValue(e.target.value)}
                    placeholder="Ex: 120/80 ou 37.2"
                    className="w-full px-3 py-2 rounded-xl border border-[#C2E8D8] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1B362B] mb-1">
                    Unité
                  </label>
                  <input
                    type="text"
                    value={newObsUnit}
                    onChange={(e) => setNewObsUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#C2E8D8] text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B362B] mb-1">
                  Interprétation
                </label>
                <select
                  value={newObsInterp}
                  onChange={(e) => setNewObsInterp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#C2E8D8] text-sm"
                >
                  <option value="Normal">Normal</option>
                  <option value="Élevé">Élevé</option>
                  <option value="Critique">Critique</option>
                </select>
              </div>

              <div className="pt-2">
                <Sante3DButton text="Enregistrer la mesure" onClick={() => {}} />
              </div>
            </form>
          </div>
        </div>
      )}



      {/* Modal Ordonnance QR */}
      {selectedMedication && (
        <MedicationQrDialog
          medication={selectedMedication}
          onDismiss={() => setSelectedMedication(null)}
        />
      )}

      {/* Modal Export FHIR */}
      {showFhirExportModal && (
        <FhirExportDialog
          jsonContent={generateFhirBundle()}
          onDismiss={() => setShowFhirExportModal(false)}
        />
      )}
    </div>
  );
};
