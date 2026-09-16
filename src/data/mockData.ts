import {
  PatientProfileEntity,
  FhirEncounterEntity,
  FhirMedicationRequestEntity,
  FhirObservationEntity,
  IasoFacilityEntity,
  PaymentRecordEntity,
  BloodAlertEntity,
  AdminRequestItem,
  AdminUserItem,
  AuditLogEntity,
  NotificationEntity,
  MessageEntity,
} from "../types";

// =====================================================================
// 1. PATIENT DE DÉMO EFFACÉ — CHAMPS VIDES (À REMPLIR EN PRODUCTION)
// =====================================================================
export const initialPatientProfile: PatientProfileEntity = {
  id: 0,
  npi: "", // À remplir en production
  fullName: "", // À remplir en production
  dateOfBirth: "", // À remplir en production
  gender: "", // À remplir en production
  bloodGroup: "", // À remplir en production
  electrophoresis: "", // À remplir en production
  allergies: "", // À remplir en production
  phone: "", // À remplir en production
  city: "", // À remplir en production
  emergencyContact: "", // À remplir en production
  anipStatus: "", // À remplir en production
  email: "", // À remplir en production
};

// =====================================================================
// 2. MÉDECINS DE DÉMO EFFACÉS — STRUCTURE VIDE (À REMPLIR EN PRODUCTION)
// =====================================================================
export const initialDoctors: Array<{
  id: number;
  name: string;
  onmbNumber: string;
  specialty: string;
  facility: string;
  phone: string;
  email: string;
}> = [
  // À remplir en production
];

// =====================================================================
// 3. HÔPITAUX DE DÉMO EFFACÉS — STRUCTURE VIDE (À REMPLIR EN PRODUCTION)
// =====================================================================
export const initialFacilities: IasoFacilityEntity[] = [
  // À remplir en production
];

// =====================================================================
// 4. CONSULTATIONS DE DÉMO EFFACÉES — STRUCTURE VIDE (À REMPLIR EN PRODUCTION)
// =====================================================================
export const initialEncounters: FhirEncounterEntity[] = [
  // À remplir en production
];

// =====================================================================
// 5. ORDONNANCES DE DÉMO EFFACÉES — STRUCTURE VIDE (À REMPLIR EN PRODUCTION)
// =====================================================================
export const initialMedications: FhirMedicationRequestEntity[] = [
  // À remplir en production
];

// Constantes et observations de santé — Structure vide (À remplir en production)
export const initialObservations: FhirObservationEntity[] = [
  // À remplir en production
];

// =====================================================================
// 6. TRANSACTIONS ET PAIEMENTS DE DÉMO EFFACÉS (À REMPLIR EN PRODUCTION)
// =====================================================================
export const initialPayments: PaymentRecordEntity[] = [
  // À remplir en production
];

// Alertes banque de sang — Structure vide (À remplir en production)
export const initialBloodAlerts: BloodAlertEntity[] = [
  // À remplir en production
];

// =====================================================================
// 7. NOTIFICATIONS DE DÉMO EFFACÉES (À REMPLIR EN PRODUCTION)
// =====================================================================
export const initialNotifications: NotificationEntity[] = [
  // À remplir en production
];

// =====================================================================
// 8. MESSAGES DE DÉMO EFFACÉS (À REMPLIR EN PRODUCTION)
// =====================================================================
export const initialMessages: MessageEntity[] = [
  // À remplir en production
];

// Demandes d'accès administratives — Structure vide (À remplir en production)
export const initialAdminRequests: AdminRequestItem[] = [
  // À remplir en production
];

// Utilisateurs administrateurs — Structure vide (À remplir en production)
export const initialAdminUsers: AdminUserItem[] = [
  // À remplir en production
];

// Journal d'audit DSI — Structure vide (À remplir en production)
export const initialAuditLogs: AuditLogEntity[] = [
  // À remplir en production
];
