import React, { useState, useEffect } from "react";
import {
  PatientProfileEntity,
  FhirEncounterEntity,
  FhirMedicationRequestEntity,
  FhirObservationEntity,
  IasoFacilityEntity,
  PaymentRecordEntity,
  BloodAlertEntity,
  AppointmentItemEntity,
  SanteScreen,
} from "./types";
import {
  initialPatientProfile,
  initialEncounters,
  initialMedications,
  initialObservations,
  initialFacilities,
  initialPayments,
  initialBloodAlerts,
} from "./data/mockData";
import {
  EmergencyQuickSheet,
} from "./components/CommonComponents";
import { OfflineSyncBanner } from "./components/OfflineSyncBanner";
import { PwaInstallBanner } from "./components/PwaInstallBanner";
import { ArrowLeft, LogOut, Shield, Siren } from "lucide-react";
import { LandingOrientationScreen } from "./screens/LandingOrientationScreen";
import { PatientAuthScreen } from "./screens/PatientAuthScreen";
import { DoctorRequestScreen } from "./screens/DoctorRequestScreen";
import { HospitalRequestScreen } from "./screens/HospitalRequestScreen";
import { AdminLoginScreen } from "./screens/AdminLoginScreen";
import { ProfessionalLoginScreen } from "./screens/ProfessionalLoginScreen";
import { AdminDashboardScreen } from "./screens/AdminDashboardScreen";
import { DoctorDashboardScreen } from "./screens/DoctorDashboardScreen";
import { HospitalDashboardScreen } from "./screens/HospitalDashboardScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { FhirDossierScreen } from "./screens/FhirDossierScreen";
import { AiTriageScreen } from "./screens/AiTriageScreen";
import { IasoFacilitiesScreen } from "./screens/IasoFacilitiesScreen";
import { PaymentScreen } from "./screens/PaymentScreen";
import { BloodDonationScreen } from "./screens/BloodDonationScreen";
import { AccountSettingsScreen } from "./screens/AccountSettingsScreen";
import { HospitalsScreen } from "./screens/HospitalsScreen";
import { AppointmentsScreen } from "./screens/AppointmentsScreen";

type ViewStateType =
  | "landing"
  | "patient_login"
  | "patient_register"
  | "doctor_request"
  | "doctor_dashboard"
  | "hospital_request"
  | "hospital_dashboard"
  | "professional_login"
  | "admin_login"
  | "admin_dashboard"
  | "citoyen";

const getViewFromPath = (path: string): ViewStateType => {
  if (path === "/inscription-patient") return "patient_register";
  if (path === "/demande-medecin") return "doctor_request";
  if (path === "/espace-medecin") return "doctor_dashboard";
  if (path === "/demande-hopital") return "hospital_request";
  if (path === "/espace-hopital") return "hospital_dashboard";
  if (path === "/connexion-pro") return "professional_login";
  if (path === "/connexion") return "patient_login";
  if (path === "/admin") return "admin_login";
  if (path === "/citoyen") return "citoyen";
  return "landing";
};

export const App: React.FC = () => {
  // Mode de vue initial — Démarre sur la nouvelle page d'accueil d'orientation
  const [viewState, setViewState] = useState<ViewStateType>(() => {
    if (typeof window !== "undefined") {
      return getViewFromPath(window.location.pathname);
    }
    return "landing";
  });

  // Navigation avec synchronisation de l'URL du navigateur
  const navigateTo = (newView: ViewStateType, path?: string) => {
    setViewState(newView);
    if (path && typeof window !== "undefined" && window.location.pathname !== path) {
      try {
        window.history.pushState({ view: newView }, "", path);
      } catch {
        // En iframe, tolérance silencieuse
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const detected = getViewFromPath(window.location.pathname);
      setViewState(detected);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Écran actif de l'espace citoyen
  const [currentScreen, setCurrentScreen] = useState<SanteScreen>(
    SanteScreen.HOME
  );
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Données persistées ou en mémoire
  const [patient, setPatient] = useState<PatientProfileEntity>(() => {
    const saved = localStorage.getItem("sante_patient");
    return saved ? JSON.parse(saved) : initialPatientProfile;
  });

  const [encounters, setEncounters] = useState<FhirEncounterEntity[]>(() => {
    const saved = localStorage.getItem("sante_encounters");
    return saved ? JSON.parse(saved) : initialEncounters;
  });

  const [medications, setMedications] = useState<FhirMedicationRequestEntity[]>(
    () => {
      const saved = localStorage.getItem("sante_medications");
      return saved ? JSON.parse(saved) : initialMedications;
    }
  );

  const [observations, setObservations] = useState<FhirObservationEntity[]>(
    () => {
      const saved = localStorage.getItem("sante_observations");
      return saved ? JSON.parse(saved) : initialObservations;
    }
  );

  const [facilities, setFacilities] = useState<IasoFacilityEntity[]>(() => {
    const saved = localStorage.getItem("sante_facilities");
    return saved ? JSON.parse(saved) : initialFacilities;
  });

  const [payments, setPayments] = useState<PaymentRecordEntity[]>(() => {
    const saved = localStorage.getItem("sante_payments");
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [bloodAlerts, setBloodAlerts] = useState<BloodAlertEntity[]>(() => {
    const saved = localStorage.getItem("sante_blood_alerts");
    return saved ? JSON.parse(saved) : initialBloodAlerts;
  });

  const [appointments, setAppointments] = useState<AppointmentItemEntity[]>(() => {
    const saved = localStorage.getItem("sante_appointments");
    return saved ? JSON.parse(saved) : [];
  });

  // Sauvegarde dans le localStorage
  useEffect(() => {
    localStorage.setItem("sante_patient", JSON.stringify(patient));
  }, [patient]);

  useEffect(() => {
    localStorage.setItem("sante_encounters", JSON.stringify(encounters));
  }, [encounters]);

  useEffect(() => {
    localStorage.setItem("sante_medications", JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem("sante_observations", JSON.stringify(observations));
  }, [observations]);

  useEffect(() => {
    localStorage.setItem("sante_payments", JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem("sante_appointments", JSON.stringify(appointments));
  }, [appointments]);

  // Handlers d'ajout
  const handleAddObservation = (newObs: Omit<FhirObservationEntity, "id">) => {
    const obs: FhirObservationEntity = {
      ...newObs,
      id: Date.now(),
    };
    setObservations((prev) => [obs, ...prev]);
  };

  const handleAddEncounter = (newEnc: Omit<FhirEncounterEntity, "id">) => {
    const enc: FhirEncounterEntity = {
      ...newEnc,
      id: Date.now(),
    };
    setEncounters((prev) => [enc, ...prev]);
  };

  const handleAddMedication = (newMed: Omit<FhirMedicationRequestEntity, "id">) => {
    const med: FhirMedicationRequestEntity = {
      ...newMed,
      id: Date.now(),
    };
    setMedications((prev) => [med, ...prev]);
  };

  const handleAddPayment = (newPayment: PaymentRecordEntity) => {
    setPayments((prev) => [newPayment, ...prev]);
  };

  const handleAddAppointment = (newApp: AppointmentItemEntity) => {
    setAppointments((prev) => [newApp, ...prev]);
  };

  const handleUpdateAppointment = (
    appointmentId: string,
    status: "En attente" | "Confirmé" | "Arrivé" | "En cours" | "Terminé"
  ) => {
    setAppointments((prev) =>
      prev.map((app) => (app.id === appointmentId ? { ...app, status } : app))
    );
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Tolérance réseau
    }
    localStorage.removeItem("sante_patient");
    setPatient(initialPatientProfile);
    navigateTo("landing", "/");
  };

  return (
    <div className="min-h-screen bg-[#F0F9F4] text-[#1B362B] flex flex-col font-sans">
      {/* BANNIÈRE RÉSEAU & SYNCHRONISATION HORS-LIGNE PWA */}
      <OfflineSyncBanner />

      {/* 1. PAGE D'ACCUEIL D'ORIENTATION */}
      {viewState === "landing" && (
        <div className="flex-1">
          <LandingOrientationScreen
            onNavigateToPatientRegister={() =>
              navigateTo("patient_register", "/inscription-patient")
            }
            onNavigateToDoctorRequest={() =>
              navigateTo("doctor_request", "/demande-medecin")
            }
            onNavigateToDoctorDashboard={() =>
              navigateTo("doctor_dashboard", "/espace-medecin")
            }
            onNavigateToHospitalRequest={() =>
              navigateTo("hospital_request", "/demande-hopital")
            }
            onNavigateToHospitalDashboard={() =>
              navigateTo("hospital_dashboard", "/espace-hopital")
            }
            onNavigateToProfessionalLogin={() =>
              navigateTo("professional_login", "/connexion-pro")
            }
            onNavigateToLogin={() => navigateTo("patient_login", "/connexion")}
            onNavigateToAdmin={() => navigateTo("admin_login", "/admin")}
          />
        </div>
      )}

      {/* 2. ESPACE PATIENT : INSCRIPTION & CONNEXION */}
      {(viewState === "patient_login" || viewState === "patient_register") && (
        <div className="flex-1">
          <PatientAuthScreen
            currentPatient={patient}
            initialTab={viewState === "patient_register" ? "register" : "login"}
            onSuccessLogin={(profile: PatientProfileEntity, userRole?: string) => {
              setPatient(profile);
              if (userRole === "doctor") {
                navigateTo("doctor_dashboard", "/espace-medecin");
              } else if (userRole === "hospital") {
                navigateTo("hospital_dashboard", "/espace-hopital");
              } else if (userRole === "admin") {
                navigateTo("admin_dashboard", "/admin");
              } else {
                navigateTo("citoyen", "/citoyen");
                setCurrentScreen(SanteScreen.HOME);
              }
            }}
            onBackToLanding={() => navigateTo("landing", "/")}
          />
        </div>
      )}

      {/* 3. DEMANDE PRATICIEN DE SANTÉ (ONMB) */}
      {viewState === "doctor_request" && (
        <div className="flex-1">
          <DoctorRequestScreen
            onBackToLanding={() => navigateTo("landing", "/")}
            onEnterDoctorDemo={() => {
              navigateTo("citoyen", "/citoyen");
              setCurrentScreen(SanteScreen.DOSSIER);
            }}
            onEnterDoctorDashboard={() =>
              navigateTo("doctor_dashboard", "/espace-medecin")
            }
          />
        </div>
      )}

      {/* 4. ESPACE MÉDECIN (DASHBOARD PRATICIEN ONMB) */}
      {viewState === "doctor_dashboard" && (
        <div className="flex-1">
          <DoctorDashboardScreen
            onBackToLanding={() => navigateTo("landing", "/")}
            onViewPatientDossier={(npi) => {
              navigateTo("citoyen", "/citoyen");
              setCurrentScreen(SanteScreen.DOSSIER);
            }}
            currentPatient={patient}
            appointments={appointments}
            onUpdateAppointment={handleUpdateAppointment}
            onAddEncounter={handleAddEncounter}
            onAddMedication={handleAddMedication}
            onAddObservation={handleAddObservation}
            onAddPayment={handleAddPayment}
          />
        </div>
      )}

      {/* 5. DEMANDE ÉTABLISSEMENT DE SANTÉ (IASO) */}
      {viewState === "hospital_request" && (
        <div className="flex-1">
          <HospitalRequestScreen
            onBackToLanding={() => navigateTo("landing", "/")}
            onEnterIasoMap={() => {
              navigateTo("citoyen", "/citoyen");
              setCurrentScreen(SanteScreen.IASO_MAP);
            }}
            onEnterHospitalDashboard={() =>
              navigateTo("hospital_dashboard", "/espace-hopital")
            }
          />
        </div>
      )}

      {/* 6. ESPACE HÔPITAL (GESTION DES LITS & LIAISON IASO) */}
      {viewState === "hospital_dashboard" && (
        <div className="flex-1">
          <HospitalDashboardScreen
            onBackToLanding={() => navigateTo("landing", "/")}
            onOpenPublicIasoMap={() => {
              navigateTo("citoyen", "/citoyen");
              setCurrentScreen(SanteScreen.IASO_MAP);
            }}
          />
        </div>
      )}

      {/* 7. CONNEXION PROFESSIONNELLE MÉDECIN / HÔPITAL */}
      {viewState === "professional_login" && (
        <div className="flex-1">
          <ProfessionalLoginScreen
            onBackToLanding={() => navigateTo("landing", "/")}
            onLoginSuccess={(role) => {
              if (role === "doctor") {
                navigateTo("doctor_dashboard", "/espace-medecin");
              } else {
                navigateTo("hospital_dashboard", "/espace-hopital");
              }
            }}
          />
        </div>
      )}

      {/* 8. CONNEXION DSI CENTRALE */}
      {viewState === "admin_login" && (
        <div className="flex-1">
          <AdminLoginScreen
            onLoginSuccess={() => setViewState("admin_dashboard")}
            onBackToLanding={() => navigateTo("landing", "/")}
          />
        </div>
      )}

      {/* 9. TABLEAU DE BORD DSI NATIONAL (ADMIN SANTÉ+) */}
      {viewState === "admin_dashboard" && (
        <div className="flex-1">
          <AdminDashboardScreen onLogout={() => navigateTo("landing", "/")} />
        </div>
      )}

      {/* 7. ESPACE PATIENT SANS MENUS */}
      {viewState === "citoyen" && (
        <div className="flex flex-col min-h-screen">
          {/* En-tête simple sans aucun menu */}
          <header className="sticky top-0 z-30 bg-white border-b border-[#C8E6D5] px-4 py-3 shadow-xs">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-[#007048] font-display">
                  SANTÉ+
                </span>
                <span className="text-xs font-bold px-2.5 py-1 bg-[#E6F7F0] text-[#007048] rounded-lg">
                  Patient
                </span>
              </div>

              <div className="flex items-center gap-2">
                {currentScreen !== SanteScreen.HOME && (
                  <button
                    type="button"
                    onClick={() => setCurrentScreen(SanteScreen.HOME)}
                    className="min-h-[44px] px-4 bg-[#E6F7F0] hover:bg-[#D6F2E5] border border-[#00A86B] text-[#007048] font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="min-h-[44px] px-4 bg-[#E6F7F0] hover:bg-[#D6F2E5] border border-[#C8E6D5] text-[#007048] font-bold rounded-xl text-sm flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Quitter</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 py-4 pb-28">
            {/* Si sous-écran, grand bouton de retour direct vers les cartes du carnet */}
            {currentScreen !== SanteScreen.HOME && (
              <div className="max-w-4xl mx-auto px-4 mb-4">
                <button
                  type="button"
                  onClick={() => setCurrentScreen(SanteScreen.HOME)}
                  className="w-full min-h-[64px] bg-[#E6F7F0] hover:bg-[#D6F2E5] border-2 border-[#00A86B] text-[#007048] text-xl font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <ArrowLeft className="w-6 h-6" />
                  <span>RETOUR AU CARNET</span>
                </button>
              </div>
            )}

            {currentScreen === SanteScreen.HOME && (
              <HomeScreen
                patient={patient}
                encounters={encounters}
                medications={medications}
                observations={observations}
                onNavigate={(screen) => setCurrentScreen(screen)}
              />
            )}

            {currentScreen === SanteScreen.DOSSIER && (
              <FhirDossierScreen
                patient={patient}
                encounters={encounters}
                medications={medications}
                observations={observations}
                payments={payments}
                onAddObservation={handleAddObservation}
                onAddEncounter={handleAddEncounter}
              />
            )}

            {currentScreen === SanteScreen.TRIAGE_AI && (
              <AiTriageScreen patient={patient} />
            )}

            {currentScreen === SanteScreen.IASO_MAP && (
              <IasoFacilitiesScreen />
            )}

            {currentScreen === SanteScreen.HOSPITALS && (
              <HospitalsScreen />
            )}

            {currentScreen === SanteScreen.APPOINTMENTS && (
              <AppointmentsScreen
                patient={patient}
                appointments={appointments}
                onAddAppointment={handleAddAppointment}
                onAddPayment={handleAddPayment}
                onBackToHome={() => setCurrentScreen(SanteScreen.HOME)}
              />
            )}

            {currentScreen === SanteScreen.PAYMENTS && (
              <PaymentScreen
                payments={payments}
                onAddPayment={handleAddPayment}
              />
            )}

            {currentScreen === SanteScreen.BLOOD_BANK && (
              <BloodDonationScreen
                patient={patient}
                alerts={bloodAlerts}
                onBackToHome={() => setCurrentScreen(SanteScreen.HOME)}
              />
            )}

            {currentScreen === SanteScreen.ACCOUNT_SETTINGS && (
              <AccountSettingsScreen
                patient={patient}
                onUpdatePatient={(updated) => setPatient(updated)}
                onLogout={handleLogout}
                onBackToHome={() => setCurrentScreen(SanteScreen.HOME)}
              />
            )}
          </main>

          {/* BOUTON D'URGENCE FIXE FLOTTANT ROUGE VIF AVEC SIRÈNE */}
          <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
            <div className="max-w-xl mx-auto pointer-events-auto">
              <button
                type="button"
                id="floating-emergency-button"
                onClick={() => setShowEmergencyModal(true)}
                className="w-full min-h-[72px] bg-[#DC2626] hover:bg-[#B91C1C] active:scale-[0.98] text-white font-black rounded-2xl shadow-[0_10px_35px_rgba(220,38,38,0.55)] border-2 border-white/60 flex items-center justify-center gap-3.5 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                  <Siren className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div className="text-left leading-tight">
                  <span className="block font-black tracking-wide text-xl sm:text-2xl font-display">
                    URGENCE MÉDICALE
                  </span>
                  <span className="block text-xs sm:text-sm font-semibold text-white/90">
                    SAMU 15 • Pompiers 118 • CNHU
                  </span>
                </div>
              </button>
            </div>
          </div>

          {showEmergencyModal && (
            <EmergencyQuickSheet
              onDismiss={() => setShowEmergencyModal(false)}
            />
          )}
        </div>
      )}

      {/* Bannière et prompt d'installation PWA */}
      <PwaInstallBanner />
    </div>
  );
};
