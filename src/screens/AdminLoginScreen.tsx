// Production - À remplir par les vrais utilisateurs
import React, { useState } from "react";
import {
  Shield,
  Lock,
  Mail,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Smartphone,
} from "lucide-react";
import { SanteAsymmetricCard } from "../components/CommonComponents";

interface AdminLoginScreenProps {
  onLoginSuccess: () => void;
  onBackToLanding: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  onLoginSuccess,
  onBackToLanding,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [requires2Fa, setRequires2Fa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: email.trim(),
          password,
          otp: requires2Fa ? otpCode.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.requires2Fa) {
          setRequires2Fa(true);
          if (data.debugHint) {
            setDebugOtp(data.debugHint);
            setOtpCode(data.debugHint);
          }
        } else {
          onLoginSuccess();
        }
      } else {
        setErrorMessage(data.error || "Identifiant ou mot de passe incorrect.");
      }
    } catch {
      setErrorMessage("Erreur de connexion au serveur d'authentification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 flex flex-col justify-center text-[#1B362B]">
      <div className="max-w-md w-full mx-auto space-y-6">
        <button
          type="button"
          onClick={onBackToLanding}
          className="flex items-center gap-2 text-base font-bold text-[#007048] hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour à l'accueil</span>
        </button>

        <div className="text-center space-y-2">
          <div className="w-18 h-18 rounded-2xl bg-white border-2 border-[#00A86B] p-2 flex items-center justify-center mx-auto shadow-xs">
            <img src="/logo-sante-symbol.png" alt="Logo SANTÉ+" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-[#007048] font-display">
            Portail DSI National
          </h1>
          <p className="text-sm font-bold text-[#406354]">
            Administration Centrale SANTÉ+ Bénin
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <SanteAsymmetricCard topBorderColor="#00A86B">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#1B362B] mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#007048]" />
                <span>Identifiant DSI (Email)</span>
              </label>
              <input
                type="email"
                required
                disabled={requires2Fa}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin.sante@gouv.bj"
                className="w-full min-h-[56px] px-4 rounded-xl border border-[#C8E6D5] focus:border-[#00A86B] outline-none text-base disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1B362B] mb-1.5 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#007048]" />
                <span>Mot de passe sécurisé</span>
              </label>
              <input
                type="password"
                required
                disabled={requires2Fa}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full min-h-[56px] px-4 rounded-xl border border-[#C8E6D5] focus:border-[#00A86B] outline-none text-base disabled:bg-gray-100"
              />
            </div>

            {requires2Fa && (
              <div className="pt-2 space-y-2 animate-fade-in">
                <label className="block text-sm font-bold text-[#007048] flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>Code 2FA obligatoire (6 chiffres)</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full min-h-[56px] px-4 rounded-xl border-2 border-[#00A86B] text-center text-2xl font-mono tracking-widest font-bold text-[#007048] outline-none"
                />
                <p className="text-xs text-[#406354]">
                  Saisissez le code d'authentification à double facteur.
                </p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-xl font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Vérification...</span>
                  </>
                ) : (
                  <span>{requires2Fa ? "Valider le code 2FA" : "Connexion Administration"}</span>
                )}
              </button>
            </div>

            <div className="pt-2 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#406354]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00A86B]" />
                <span>Double facteur 2FA obligatoire pour tout administrateur</span>
              </span>
            </div>
          </form>
        </SanteAsymmetricCard>
      </div>
    </div>
  );
};
