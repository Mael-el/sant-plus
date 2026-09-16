// Production - À remplir par les vrais utilisateurs
import React, { useState } from "react";
import {
  User,
  Phone,
  Mail,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ShieldCheck,
  Calendar,
  X,
} from "lucide-react";
import { Sante3DButton } from "../components/CommonComponents";
import { PatientProfileEntity } from "../types";

interface PatientAuthScreenProps {
  onSuccessLogin: (patient: PatientProfileEntity, userRole?: string) => void;
  onBackToLanding: () => void;
  currentPatient: PatientProfileEntity;
  initialTab?: "login" | "register";
}

export const PatientAuthScreen: React.FC<PatientAuthScreenProps> = ({
  onSuccessLogin,
  onBackToLanding,
  initialTab = "login",
}) => {
  const [isLoginTab, setIsLoginTab] = useState(initialTab === "login");
  const [showPassword, setShowPassword] = useState(false);

  // Champs Connexion
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Champs Inscription
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regDateOfBirth, setRegDateOfBirth] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regGender, setRegGender] = useState<"M" | "F" | "A">("M");

  // Statuts de traitement et erreurs
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal Mot de passe oublié
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<"request" | "reset">("request");
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Gestion de la connexion réelle
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const patientData: PatientProfileEntity = data.profile ? {
          id: data.profile.id,
          npi: data.profile.npi || "",
          fullName: `${data.profile.first_name || ""} ${data.profile.last_name || ""}`.trim() || data.user.email || data.user.phone,
          dateOfBirth: data.profile.date_of_birth || "",
          gender: data.profile.gender || "M",
          bloodGroup: data.profile.blood_type || "O+",
          electrophoresis: "AA",
          allergies: data.profile.allergies || "",
          phone: data.user.phone || "",
          email: data.user.email || "",
          city: "Bénin",
          emergencyContact: "",
          anipStatus: "Certifié ANIP",
        } : {
          id: data.user.id,
          npi: "",
          fullName: data.user.email || data.user.phone,
          dateOfBirth: "",
          gender: "M",
          bloodGroup: "",
          electrophoresis: "",
          allergies: "",
          phone: data.user.phone || "",
          email: data.user.email || "",
          city: "Bénin",
          emergencyContact: "",
          anipStatus: "Compte Vérifié",
        };

        if (data.token) {
          localStorage.setItem("sante_token", data.token);
        }
        const userRole = data.user?.role || "patient";
        localStorage.setItem("sante_role", userRole);

        onSuccessLogin(patientData, userRole);
      } else {
        setErrorMessage(data.error || "Identifiant ou mot de passe incorrect.");
      }
    } catch {
      setErrorMessage("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'inscription patient libre
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation préalable côté client
    if (!regFirstName.trim() || !regLastName.trim()) {
      setErrorMessage("Le prénom et le nom sont obligatoires.");
      return;
    }
    if (!regPhone.trim() && !regEmail.trim()) {
      setErrorMessage("Veuillez renseigner un numéro de téléphone ou un email.");
      return;
    }
    if (regPassword.length < 8 || !/[A-Z]/.test(regPassword) || !/[0-9]/.test(regPassword)) {
      setErrorMessage("Le mot de passe doit comporter au moins 8 caractères, 1 majuscule et 1 chiffre.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register-patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: regFirstName.trim(),
          lastName: regLastName.trim(),
          dateOfBirth: regDateOfBirth,
          gender: regGender,
          phone: regPhone.trim(),
          email: regEmail.trim(),
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.patient) {
        onSuccessLogin(data.patient);
      } else {
        setErrorMessage(data.error || "Erreur lors de la création du compte.");
      }
    } catch {
      setErrorMessage("Erreur de communication avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  // Demande de code pour mot de passe oublié
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.debugHint) {
          setForgotCode(data.debugHint);
        }
        setForgotStep("reset");
      } else {
        setForgotError(data.error || "Erreur lors de l'envoi du code.");
      }
    } catch {
      setForgotError("Erreur de communication avec le serveur.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Réinitialisation effective du mot de passe
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotNewPassword.length < 8 || !/[A-Z]/.test(forgotNewPassword) || !/[0-9]/.test(forgotNewPassword)) {
      setForgotError("Le mot de passe doit comporter au moins 8 caractères, 1 majuscule et 1 chiffre.");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          code: forgotCode.trim(),
          newPassword: forgotNewPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setShowForgotModal(false);
        setSuccessMessage("Mot de passe réinitialisé. Vous pouvez vous connecter.");
        setIsLoginTab(true);
        setLoginIdentifier(forgotIdentifier);
        setLoginPassword("");
      } else {
        setForgotError(data.error || "Code invalide ou expiré.");
      }
    } catch {
      setForgotError("Erreur lors de la réinitialisation.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 flex flex-col justify-center text-[#1B362B]">
      <div className="max-w-lg w-full mx-auto space-y-6">
        <button
          type="button"
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-base font-bold text-[#007048] hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour accueil</span>
        </button>

        <div className="text-center space-y-3">
          <div className="w-18 h-18 rounded-2xl bg-white border-2 border-[#00A86B] p-2 flex items-center justify-center mx-auto shadow-xs">
            <img src="/logo-sante-symbol.png" alt="Logo SANTÉ+" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-[#007048] font-display">
            SANTÉ+ Bénin
          </h1>
          <p className="text-sm font-semibold text-[#406354]">
            Espace Patient • Dossier Médical Personnel
          </p>
        </div>

        {/* Onglets Connexion / Inscription */}
        <div className="flex bg-[#E6F7F0] p-1.5 rounded-2xl border border-[#00A86B]/30">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setErrorMessage(null);
            }}
            className={`flex-1 min-h-[52px] rounded-xl text-lg font-bold transition-all ${
              isLoginTab
                ? "bg-white text-[#007048] shadow-xs"
                : "text-[#406354] hover:text-[#007048]"
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setErrorMessage(null);
            }}
            className={`flex-1 min-h-[52px] rounded-xl text-lg font-bold transition-all ${
              !isLoginTab
                ? "bg-white text-[#007048] shadow-xs"
                : "text-[#406354] hover:text-[#007048]"
            }`}
          >
            Inscription libre
          </button>
        </div>

        {/* Notifications d'alerte / succès */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-[#E6F7F0] border border-[#00A86B] text-[#007048] text-sm font-semibold flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#00A86B]" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="bg-white border border-[#C8E6D5] rounded-3xl p-6 sm:p-8 shadow-xs">
          {/* ========================================================= */}
          {/* FORMULAIRE DE CONNEXION RÉELLE */}
          {/* ========================================================= */}
          {isLoginTab ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1B362B] mb-1.5">
                  Téléphone ou Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="01 XX XX XX XX ou email@gmail.com"
                    className="w-full min-h-[56px] pl-4 pr-11 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#688A7C]">
                    <User className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-[#1B362B]">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotIdentifier(loginIdentifier);
                      setForgotStep("request");
                      setForgotError(null);
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-bold text-[#007048] hover:underline"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full min-h-[56px] pl-4 pr-11 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#688A7C] hover:text-[#1B362B]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-xl font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <span>Se connecter</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================= */
            /* FORMULAIRE D'INSCRIPTION PATIENT LIBRE */
            /* ========================================================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-sm font-bold text-[#1B362B] mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    required
                    value={regFirstName}
                    onChange={(e) => setRegFirstName(e.target.value)}
                    placeholder="Prénom"
                    className="w-full min-h-[52px] px-3.5 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1B362B] mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    value={regLastName}
                    onChange={(e) => setRegLastName(e.target.value)}
                    placeholder="Nom de famille"
                    className="w-full min-h-[52px] px-3.5 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-sm font-bold text-[#1B362B] mb-1">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    required
                    value={regDateOfBirth}
                    onChange={(e) => setRegDateOfBirth(e.target.value)}
                    className="w-full min-h-[52px] px-3.5 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1B362B] mb-1">
                    Genre
                  </label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value as any)}
                    className="w-full min-h-[52px] px-3.5 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none bg-white"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                    <option value="A">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1B362B] mb-1">
                  Téléphone (10 chiffres Bénin)
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="01 XX XX XX XX"
                  className="w-full min-h-[52px] px-3.5 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1B362B] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="exemple@gmail.com"
                  className="w-full min-h-[52px] px-3.5 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1B362B] mb-1">
                  Mot de passe (8+ car., 1 majuscule, 1 chiffre)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full min-h-[52px] pl-3.5 pr-11 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#688A7C] hover:text-[#1B362B]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-xl font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Création du compte...</span>
                    </>
                  ) : (
                    <span>Créer mon compte</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL MOT DE PASSE OUBLIÉ (2 ÉTAPES) */}
      {/* ========================================================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border-2 border-[#00A86B] shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#C8E6D5]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-6 h-6 text-[#00A86B]" />
                <h3 className="font-bold text-xl text-[#007048] font-display">
                  Mot de passe oublié
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-[#406354]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotStep === "request" ? (
              <form onSubmit={handleForgotRequest} className="space-y-4">
                <p className="text-sm text-[#406354]">
                  Entrez votre numéro de téléphone ou votre email pour recevoir votre code de vérification.
                </p>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#1B362B] mb-1.5">
                    Téléphone ou Email
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="01 XX XX XX XX ou email@gmail.com"
                    className="w-full min-h-[52px] px-4 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-lg font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  {forgotLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <span>Recevoir le code</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotReset} className="space-y-4">
                <p className="text-sm text-[#406354]">
                  Saisissez le code reçu ainsi que votre nouveau mot de passe.
                </p>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#1B362B] mb-1.5">
                    Code à 6 chiffres
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    placeholder="123456"
                    className="w-full min-h-[52px] px-4 rounded-xl border border-[#C8E6D5] text-center text-2xl font-mono tracking-widest font-bold text-[#007048] focus:border-[#00A86B] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[#1B362B] mb-1.5">
                    Nouveau mot de passe (8+ car., 1 maj, 1 chiffre)
                  </label>
                  <input
                    type="password"
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full min-h-[52px] px-4 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-lg font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  {forgotLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <span>Changer le mot de passe</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
