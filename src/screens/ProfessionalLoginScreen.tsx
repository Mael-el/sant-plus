import React, { useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  Loader2,
  Stethoscope,
  AlertCircle,
} from "lucide-react";

interface ProfessionalLoginScreenProps {
  onBackToLanding: () => void;
  onLoginSuccess: (role: "doctor" | "hospital") => void;
}

export const ProfessionalLoginScreen: React.FC<ProfessionalLoginScreenProps> = ({
  onBackToLanding,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState("medecin.sante@benin.local");
  const [password, setPassword] = useState("MedecinSante2026!");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const role = data.user?.role;
        if (role === "doctor") {
          onLoginSuccess("doctor");
          return;
        }

        if (role === "hospital") {
          onLoginSuccess("hospital");
          return;
        }

        setErrorMessage("Ce compte n'est pas autorisé dans cet espace professionnel.");
        return;
      }

      setErrorMessage(data.error || "Identifiant ou mot de passe incorrect.");
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
            Accès Professionnel
          </h1>
          <p className="text-sm font-bold text-[#406354]">
            Médecins, hôpitaux et responsables de santé
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="bg-white border border-[#C8E6D5] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#00A86B] bg-[#E6F7F0] p-3 text-center">
              <div className="flex justify-center text-[#007048]">
                <Stethoscope className="w-5 h-5" />
              </div>
              <p className="mt-2 text-sm font-bold text-[#007048]">Médecin</p>
            </div>
            <div className="rounded-2xl border border-[#C8E6D5] bg-white p-3 text-center">
              <div className="flex justify-center text-[#007048]">
                <Building2 className="w-5 h-5" />
              </div>
              <p className="mt-2 text-sm font-bold text-[#007048]">Hôpital</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#1B362B] mb-1.5 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#007048]" />
                <span>Email professionnel</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="medecin.sante@benin.local"
                className="w-full min-h-[56px] px-4 rounded-xl border border-[#C8E6D5] focus:border-[#00A86B] outline-none text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#1B362B] mb-1.5 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#007048]" />
                <span>Mot de passe</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full min-h-[56px] px-4 rounded-xl border border-[#C8E6D5] focus:border-[#00A86B] outline-none text-base"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-xl font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  <span>Se connecter</span>
                )}
              </button>
            </div>

            <div className="pt-1 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#406354]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00A86B]" />
                <span>Accès réservé aux comptes professionnels</span>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
