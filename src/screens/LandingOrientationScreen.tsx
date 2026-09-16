import React from "react";
import {
  User,
  Stethoscope,
  Building2,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Sante3DButton } from "../components/CommonComponents";

interface LandingHomeScreenProps {
  onNavigateToPatientRegister: () => void;
  onNavigateToDoctorRequest: () => void;
  onNavigateToHospitalRequest: () => void;
  onNavigateToLogin: () => void;
  onNavigateToProfessionalLogin?: () => void;
  onNavigateToAdmin?: () => void;
  onNavigateToDoctorDashboard?: () => void;
  onNavigateToHospitalDashboard?: () => void;
}

export const LandingOrientationScreen: React.FC<LandingHomeScreenProps> = ({
  onNavigateToPatientRegister,
  onNavigateToDoctorRequest,
  onNavigateToHospitalRequest,
  onNavigateToLogin,
  onNavigateToProfessionalLogin,
  onNavigateToAdmin,
}) => {
  return (
    <div className="min-h-screen bg-white text-[#1B362B] flex flex-col justify-between antialiased selection:bg-[#00A86B]/20 selection:text-[#007048]">
      {/* Conteneur principal */}
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 flex flex-col justify-center animate-fade-in">
        
        {/* En-tête officiel avec le logo SANTÉ+ */}
        <header className="text-center space-y-4 mb-8 sm:mb-12 animate-slide-up flex flex-col items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white border-2 border-[#00A86B] p-2.5 shadow-md flex items-center justify-center">
            <img
              src="/logo-sante-symbol.png"
              alt="Logo officiel SANTÉ+"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="inline-flex items-center justify-center gap-2 px-5 py-1.5 rounded-full bg-[#E6F7F0] border border-[#00A86B] text-[#007048] font-bold text-base sm:text-lg">
            <span className="font-black tracking-wide">SANTÉ+</span>
            <span className="text-[#00A86B]">•</span>
            <span>Bénin</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#007048] font-display">
            Portail National de Santé
          </h1>
          <p className="text-lg sm:text-xl text-[#406354] font-medium max-w-md mx-auto">
            Choisissez votre profil pour commencer
          </p>
        </header>

        {/* Grille des cartes cliquables */}
        <div className="space-y-6">
          
          {/* Carte Patient */}
          <div
            id="card-profile-patient"
            onClick={onNavigateToPatientRegister}
            className="cursor-pointer bg-white border border-[#C8E6D5] rounded-3xl p-6 sm:p-8 transition-all hover:border-[#00A86B] hover:shadow-lg"
            style={{ borderTop: "4px solid #00A86B" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] border-2 border-[#00A86B] text-[#007048] flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-[#007048]" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#1B362B] font-display">
                    Espace Patient
                  </h2>
                  <p className="text-lg text-[#406354]">
                    Dossier médical personnel sécurisé
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto sm:min-w-[240px]">
                <Sante3DButton
                  text="Créer un compte"
                  icon={<ArrowRight className="w-5 h-5" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToPatientRegister();
                  }}
                />
              </div>
            </div>
          </div>

          {/* Grille Médecin & Hôpital */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Carte Médecin */}
            <div
              id="card-profile-doctor"
              onClick={onNavigateToDoctorRequest}
              className="cursor-pointer bg-white border border-[#C8E6D5] rounded-3xl p-6 transition-all hover:border-[#00A86B] hover:shadow-lg flex flex-col justify-between"
              style={{ borderTop: "4px solid #00A86B" }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#E6F7F0] border-2 border-[#00A86B] text-[#007048] flex items-center justify-center shrink-0">
                    <Stethoscope className="w-7 h-7 text-[#007048]" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#1B362B] font-display">
                      Espace Médecin
                    </h3>
                    <p className="text-base text-[#406354]">
                      Inscription sur demande
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToDoctorRequest();
                  }}
                  className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Demander un accès</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Carte Hôpital */}
            <div
              id="card-profile-hospital"
              onClick={onNavigateToHospitalRequest}
              className="cursor-pointer bg-white border border-[#C8E6D5] rounded-3xl p-6 transition-all hover:border-[#00A86B] hover:shadow-lg flex flex-col justify-between"
              style={{ borderTop: "4px solid #00A86B" }}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#E6F7F0] border-2 border-[#00A86B] text-[#007048] flex items-center justify-center shrink-0">
                    <Building2 className="w-7 h-7 text-[#007048]" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#1B362B] font-display">
                      Espace Hôpital
                    </h3>
                    <p className="text-base text-[#406354]">
                      Inscription sur demande
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateToHospitalRequest();
                  }}
                  className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Demander un accès</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Zone de connexion rapide */}
        <div className="my-10">
          <div className="bg-[#E6F7F0] border border-[#00A86B]/30 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-[#007048]" />
              <div>
                <span className="text-xl font-bold text-[#1B362B] block">
                  Déjà inscrit ?
                </span>
                <span className="text-sm text-[#406354]">
                  Connexion par téléphone ou email
                </span>
              </div>
            </div>

            <button
              type="button"
              id="btn-login-redirect"
              onClick={onNavigateToLogin}
              className="min-h-[64px] px-8 bg-white hover:bg-gray-50 border-2 border-[#00A86B] text-[#007048] font-bold text-lg rounded-2xl transition-colors shadow-xs"
            >
              Se connecter
            </button>
          </div>
        </div>

        {/* Accès Administration */}
        {onNavigateToAdmin && (
          <div className="text-center">
            <button
              type="button"
              id="btn-admin-portal"
              onClick={onNavigateToAdmin}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C8E6D5] hover:border-[#00A86B] text-sm font-bold text-[#406354] hover:text-[#007048] transition-colors"
            >
              <Lock className="w-4 h-4 text-[#007048]" />
              <span>Accès Administration DSI</span>
            </button>
          </div>
        )}
      </main>

      {/* Pied de page officiel */}
      <footer className="py-4 text-center text-sm font-semibold text-[#406354] border-t border-[#C8E6D5] bg-white">
        <span>SANTÉ+ République du Bénin</span>
      </footer>
    </div>
  );
};
