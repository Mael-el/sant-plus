export enum SanteScreen {
  LANDING = "LANDING",
  INSCRIPTION_PATIENT = "INSCRIPTION_PATIENT",
  DEMANDE_MEDECIN = "DEMANDE_MEDECIN",
  DEMANDE_HOPITAL = "DEMANDE_HOPITAL",
  CONNEXION = "CONNEXION",
  HOME = "HOME",
  DOSSIER = "DOSSIER",
  TRIAGE_AI = "TRIAGE_AI",
  IASO_MAP = "IASO_MAP",
  HOSPITALS = "HOSPITALS",
  APPOINTMENTS = "APPOINTMENTS",
  PAYMENTS = "PAYMENTS",
  BLOOD_BANK = "BLOOD_BANK",
  ADMIN_LOGIN = "ADMIN_LOGIN",
  ADMIN_DASHBOARD = "ADMIN_DASHBOARD",
  ACCOUNT_SETTINGS = "ACCOUNT_SETTINGS",
}

export interface PatientProfileEntity {
  id: number;
  npi: string; // Numéro Personnel d'Identification ANIP Bénin (10-16 chiffres)
  fullName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string; // O+, O-, A+, A-, B+, B-, AB+, AB-
  electrophoresis: string; // AA, AS, SS, SC, AC
  allergies: string;
  phone: string;
  city: string;
  emergencyContact: string;
  anipStatus: string; // Ex: "Certifié ANIP Bénin"
  passwordHash?: string;
  email?: string;
}

export interface FhirEncounterEntity {
  id: number;
  facilityName: string;
  practitionerName: string;
  date: string;
  serviceType: string;
  diagnosis: string;
  notes: string;
  status: string; // "Terminé", "En cours", "Prévu"
}

export interface FhirMedicationRequestEntity {
  id: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  prescribedDate: string;
  doctorName: string;
  facilityName: string;
  blockchainProofHash: string; // Hachage SHA-256 preuve Bitcoin OP_RETURN
  status: string; // "Actif", "Délivré", "Expiré"
}

export interface FhirObservationEntity {
  id: number;
  category: string; // Ex: "Tension Artérielle", "Glycémie", "Hémoglobine"
  value: string;
  unit: string;
  recordedDate: string;
  interpretation: string; // "Normal", "Élevé", "Critique"
}

export interface IasoFacilityEntity {
  id: number;
  name: string;
  type: string; // "Hôpital Universitaire (CHU)", "Centre Hospitalier Départemental (CHD)", "Hôpital de Zone", "Centre de Santé (CSA)", "Dispensaire", "Pharmacie"
  department: string; // Littoral, Atlantique, Ouémé, Borgou, Zou, etc.
  commune: string;
  phone: string;
  latitude: number;
  longitude: number;
  has24hEmergency: boolean;
  totalBeds: number;
  iasoRegistryId: string;
}

export interface PaymentRecordEntity {
  id: number;
  referenceCode: string;
  description: string;
  amountCfa: number;
  paymentMethod: string; // "MTN Mobile Money", "Moov Money", "Celtiis Cash", "PI-SPI Instant", "Carte Bancaire"
  status: string; // "Complété", "En attente", "Échoué"
  date: string;
  receiptQrPayload: string;
}

export interface BloodAlertEntity {
  id: number;
  bloodGroup: string;
  hospitalName: string;
  city: string;
  urgency: string; // "URGENT", "TRÈS URGENT", "CRITIQUE"
  unitsRequired: number;
  contactPhone: string;
}

export interface AuditLogEntity {
  id: string;
  who: string;
  what: string;
  when: string;
  blockHash: string;
}

export interface TriageResult {
  mainAssessment: string;
  urgencyLevel: string; // FAIBLE, MODÉRÉ, URGENT, VITAL
  suspectedConditions: string[];
  recommendedActions: string[];
  recommendedFacilityType: string;
  redFlags: string[];
  disclaimers?: string;
}

export interface DrugInteractionResult {
  hasInteraction: boolean;
  severity: string; // SANS DANGER, ATTENTION, CONTRE-INDICATION
  details: string;
  advice: string;
}

export interface AdminRequestItem {
  id: string;
  type: "MEDECIN" | "HOPITAL";
  nom: string;
  email: string;
  telephone: string;
  fonction: string;
  date: string;
  status: "EN_ATTENTE" | "VALIDE" | "REFUSE";
}

export interface AdminUserItem {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  role: "PATIENT" | "MEDECIN" | "HOPITAL" | "ADMIN";
  status: "ACTIF" | "EN_ATTENTE" | "SUSPENDU";
  isDemo?: boolean;
  details?: string;
}

export interface NotificationEntity {
  id: number;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type?: string;
}

export interface MessageEntity {
  id: number;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface AppointmentItemEntity {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientNpi: string;
  patientAge?: number;
  patientGender?: string;
  patientBloodGroup?: string;
  patientElectrophoresis?: string;
  patientAllergies?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty?: string;
  hospitalId: string;
  hospitalName: string;
  motif: string;
  profession?: string;
  date: string;
  time: string;
  status: "En attente" | "Confirmé" | "Arrivé" | "En cours" | "Terminé";
  amountCfa: number;
  paymentMethod: string;
  paid: boolean;
  qrCode: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface ConsultationDraftEntity {
  appointmentId: string;
  motif: string;
  diagnosis: string;
  prescription: string;
  bloodPressure?: string;
  pulse?: string;
  temperature?: string;
  weight?: string;
  exams?: string;
  recommendations?: string;
  followUpDate?: string;
  status: "draft" | "validated";
  updatedAt: string;
}
