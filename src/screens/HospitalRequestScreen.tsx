import React, { useState } from "react";
import {
  Building2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface HospitalRequestScreenProps {
  onBackToLanding: () => void;
  onEnterIasoMap?: () => void;
  onEnterHospitalDashboard?: () => void;
}

export const HospitalRequestScreen: React.FC<HospitalRequestScreenProps> = ({
  onBackToLanding,
}) => {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [fonction, setFonction] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nom.trim(),
          email: email.trim(),
          phone: telephone.trim(),
          function: fonction.trim(),
          type: "hospital",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSubmitted(true);
      } else {
        setErrorMessage(data.error || "Une erreur est survenue lors de l'enregistrement.");
      }
    } catch {
      setErrorMessage("Erreur de connexion avec le serveur.");
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
          <span>Retour accueil</span>
        </button>

        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] border-2 border-[#00A86B] text-[#007048] flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#007048] font-display">
            Espace Hôpital
          </h1>
          <p className="text-base font-semibold text-[#406354]">
            Inscription sur demande
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-white border-2 border-[#00A86B] rounded-3xl p-8 text-center space-y-6 shadow-md animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#E6F7F0] text-[#00A86B] flex items-center justify-center mx-auto border-2 border-[#00A86B]">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#1B362B] font-display">
                Demande transmise
              </h2>
              <p className="text-xl font-bold text-[#007048]">
                L'équipe vous contactera
              </p>
              <p className="text-sm text-[#406354] pt-2">
                Après validation de votre établissement, vos identifiants d'accès vous seront transmis.
              </p>
            </div>

            <button
              type="button"
              onClick={onBackToLanding}
              className="w-full min-h-[64px] bg-[#00A86B] hover:bg-[#00965F] text-white text-lg font-bold rounded-2xl shadow-xs transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        ) : (
          <div className="bg-white border border-[#C8E6D5] rounded-3xl p-6 sm:p-8 shadow-xs">
            {errorMessage && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#1B362B] mb-1.5">
                  Nom de l'établissement
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex : Centre Hospitalier..."
                  className="w-full min-h-[56px] px-4 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1B362B] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@etablissement.bj"
                  className="w-full min-h-[56px] px-4 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1B362B] mb-1.5">
                  Téléphone (10 chiffres Bénin)
                </label>
                <input
                  type="tel"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="01 XX XX XX XX"
                  className="w-full min-h-[56px] px-4 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#1B362B] mb-1.5">
                  Fonction
                </label>
                <input
                  type="text"
                  required
                  value={fonction}
                  onChange={(e) => setFonction(e.target.value)}
                  placeholder="Ex : Direction médicale, Gestionnaire..."
                  className="w-full min-h-[56px] px-4 rounded-xl border border-[#C8E6D5] text-base focus:border-[#00A86B] outline-none"
                />
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
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <span>Envoyer la demande</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
