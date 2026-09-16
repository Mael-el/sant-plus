import React, { useState } from "react";
import {
  Shield,
  KeyRound,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Copy,
  Check,
  LogOut,
  ArrowLeft,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  SanteAsymmetricCard,
  Sante3DButton,
  SanteSecondaryButton,
  SimulatedQrCodeView,
} from "../components/CommonComponents";
import { PatientProfileEntity } from "../types";

interface AccountSettingsScreenProps {
  patient: PatientProfileEntity;
  onUpdatePatient: (updated: PatientProfileEntity) => void;
  onLogout: () => void;
  onBackToHome: () => void;
}

export const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({
  patient,
  onUpdatePatient,
  onLogout,
  onBackToHome,
}) => {
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [show2faSetupModal, setShow2faSetupModal] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Changement mot de passe
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Suppression compte
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const backupCodes = [
    "8492-0193",
    "1194-8842",
    "3391-7721",
    "5520-9914",
    "6618-2041",
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError("Le nouveau mot de passe doit comporter au moins 8 caractères, 1 majuscule et 1 chiffre.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordSuccess(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 4000);
      } else {
        setPasswordError(data.error || "Erreur lors du changement de mot de passe.");
      }
    } catch {
      setPasswordError("Erreur de connexion au serveur.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <button
        onClick={onBackToHome}
        className="flex items-center gap-2 text-sm font-bold text-[#007048] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Retour au portail</span>
      </button>

      {/* En-tête Paramètres */}
      <div className="text-center sm:text-left space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#007048] font-display">
          Paramètres du Compte & Sécurité
        </h2>
        <p className="text-xs sm:text-sm text-[#406354]">
          Gestion des accès, double authentification (2FA) et identifiant ANIP
        </p>
      </div>

      {/* Carte Résumé Compte */}
      <SanteAsymmetricCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C2E8D8]">
          <div>
            <h3 className="font-bold text-lg text-[#1B362B]">
              {patient.fullName}
            </h3>
            <p className="text-xs text-[#406354]">
              NPI : {patient.npi} • Téléphone : {patient.phone}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-[#E6F7F0] text-[#007048] text-xs font-bold rounded-md">
                {patient.anipStatus}
              </span>
              <span className="text-xs text-[#688A7C]">
                {patient.email || "Email non renseigné"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="self-start sm:self-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1B362B] font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>

        {/* Double Authentification 2FA */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-[#007048]" />
              <div>
                <h4 className="font-bold text-sm text-[#1B362B]">
                  Double Authentification (2FA)
                </h4>
                <p className="text-xs text-[#688A7C]">
                  Sécurisez vos dossiers médicaux via Google Authenticator ou SMS
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (is2faEnabled) {
                  setIs2faEnabled(false);
                } else {
                  setShow2faSetupModal(true);
                }
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                is2faEnabled
                  ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                  : "bg-[#00A86B] text-white hover:bg-[#00965F]"
              }`}
            >
              {is2faEnabled ? "Désactiver 2FA" : "Configurer 2FA"}
            </button>
          </div>

          {is2faEnabled && (
            <div className="p-3 bg-[#E6F7F0] rounded-2xl border border-[#00A86B] flex items-center gap-2 text-xs text-[#007048] font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
              <span>2FA Actif : Code requis à chaque connexion.</span>
            </div>
          )}
        </div>
      </SanteAsymmetricCard>

      {/* Formulaire Modification Mot de Passe */}
      <SanteAsymmetricCard>
        <h3 className="font-bold text-base text-[#1B362B] mb-3 pb-2 border-b border-[#C2E8D8]">
          Modifier mon mot de passe
        </h3>

        <form onSubmit={handlePasswordChange} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#1B362B] mb-1 uppercase">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl border border-[#C2E8D8] bg-[#F4FAF7] text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#1B362B] mb-1 uppercase">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl border border-[#C2E8D8] bg-[#F4FAF7] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1B362B] mb-1 uppercase">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-xl border border-[#C2E8D8] bg-[#F4FAF7] text-sm"
                required
              />
            </div>
          </div>

          {passwordError && (
            <p className="text-xs text-red-600 font-bold">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-xs text-[#007048] font-bold bg-[#E6F7F0] p-2 rounded-lg">
              Mot de passe mis à jour avec succès !
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#007048] text-white font-bold text-xs rounded-xl hover:bg-[#005a39] transition-colors"
            >
              Enregistrer le nouveau mot de passe
            </button>
          </div>
        </form>
      </SanteAsymmetricCard>

      {/* Zone de Danger : Suppression du compte */}
      <div className="p-5 rounded-3xl bg-red-50/70 border border-red-200 space-y-3">
        <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <span>Zone de Confidentialité & Suppression</span>
        </div>
        <p className="text-xs text-red-700">
          La suppression de l'accès révoque votre carte numérique SANTÉ+. Vos données médicales restent archivées conformément aux obligations du Code de Santé Publique du Bénin.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors"
        >
          Supprimer mon accès citoyen
        </button>
      </div>

      {/* Modal Setup 2FA */}
      {show2faSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-[#00A86B] text-center animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#C2E8D8]">
              <h3 className="font-bold text-lg text-[#007048]">
                Activer Google Authenticator 2FA
              </h3>
              <button
                onClick={() => setShow2faSetupModal(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-xs text-[#406354]">
                Scannez ce QR Code avec Google Authenticator ou Microsoft Authenticator :
              </p>

              <SimulatedQrCodeView
                dataPayload={`otpauth://totp/SANTE_PLUS_BJ:${patient.npi}?secret=JBSWY3DPEHPK3PXP&issuer=SantePlusBenin`}
                size={160}
              />

              <div className="p-2.5 bg-[#F4FAF7] rounded-xl border border-[#C2E8D8] text-xs font-mono text-[#1B362B] flex items-center justify-between">
                <span>JBSW Y3DP EHPK 3PXP</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("JBSWY3DPEHPK3PXP");
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2000);
                  }}
                  className="text-[#007048] font-bold"
                >
                  {copiedSecret ? "Copié !" : "Copier"}
                </button>
              </div>

              {/* Codes de secours */}
              <div className="text-left bg-[#E6F7F0] p-3 rounded-2xl border border-[#C2E8D8]">
                <p className="text-xs font-bold text-[#007048] mb-1">
                  Codes de secours (Conservez-les précieusement) :
                </p>
                <div className="grid grid-cols-2 gap-1 font-mono text-[11px] text-[#406354]">
                  {backupCodes.map((c, i) => (
                    <span key={i}>• {c}</span>
                  ))}
                </div>
              </div>
            </div>

            <Sante3DButton
              text="Confirmer l'activation du 2FA"
              onClick={() => {
                setIs2faEnabled(true);
                setShow2faSetupModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Modal Confirmation Suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-red-500 text-center animate-in fade-in zoom-in duration-200">
            <h3 className="font-bold text-lg text-red-600 font-display">
              Confirmer la révocation
            </h3>
            <p className="text-xs text-[#406354] my-3">
              Tapez "SUPPRIMER" pour confirmer la révocation de vos identifiants d'accès.
            </p>
            <input
              type="text"
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full px-3 py-2 border border-red-300 rounded-xl text-center text-sm font-bold uppercase mb-4"
            />
            <div className="space-y-2">
              <button
                type="button"
                disabled={deleteConfirmInput !== "SUPPRIMER"}
                onClick={() => {
                  setShowDeleteModal(false);
                  onLogout();
                }}
                className={`w-full py-2.5 rounded-xl font-bold text-xs text-white ${
                  deleteConfirmInput === "SUPPRIMER"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Confirmer la suppression
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-2 text-xs text-gray-600 font-bold hover:underline"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
