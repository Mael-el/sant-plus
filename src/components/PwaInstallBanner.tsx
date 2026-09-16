import React, { useState, useEffect } from "react";
import { Download, X, Share2, PlusSquare, Smartphone, CheckCircle, ShieldCheck } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);

  useEffect(() => {
    // Vérifier si l'application est déjà en mode standalone (PWA installée)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Détection iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIos(isIosDevice);

    // Écoute de l'événement standard beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log("SANTÉ+ PWA a été installée avec succès sur l'appareil !");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Déclencher l'installation
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error("Erreur lors de l'installation PWA:", err);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Pour les navigateurs de bureau ou autres qui ne supportent pas le prompt natif
      alert(
        "Pour installer l'application SANTÉ+ :\n\n- Sur Chrome/Edge : Cliquez sur l'icône d'installation dans la barre d'adresse (en haut à droite).\n- Sur mobile : Ouvrez le menu de votre navigateur (⋮) puis choisissez « Installer l'application »."
      );
    }
  };

  // Si déjà installée ou masquée par l'utilisateur
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Bandeau d'installation discret et moderne */}
      <aside
        aria-label="Installation de l'application"
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-bounce-short"
      >
        <div className="bg-white border-2 border-[#00A86B] rounded-2xl p-4 shadow-2xl backdrop-blur-md bg-white/95">
          <div className="flex items-start gap-3">
            {/* Logo de l'application */}
            <div className="w-12 h-12 shrink-0 rounded-xl bg-white border border-[#C8E6D5] p-1 shadow-sm flex items-center justify-center overflow-hidden">
              <img
                src="/logo-sante-symbol.png"
                alt="Logo SANTÉ+"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Informations textuelles */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-[#007048] tracking-tight font-display">
                  SANTÉ+ BÉNIN
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#E6F7F0] text-[#00A86B] rounded">
                  PWA
                </span>
              </div>
              <p className="text-xs font-semibold text-[#1B362B] mt-0.5 leading-tight">
                Installer l'application sur votre téléphone
              </p>
              <p className="text-[11px] text-[#406354] mt-0.5">
                Accès direct sans téléchargement Store • Fonctionne hors-ligne
              </p>

              {/* Boutons d'action */}
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  id="btn-pwa-install"
                  onClick={handleInstallClick}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00A86B] text-white text-xs font-bold shadow hover:bg-[#007048] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Installer maintenant</span>
                </button>

                <button
                  onClick={() => setIsDismissed(true)}
                  className="px-2 py-1.5 text-xs text-[#627D71] hover:text-[#1B362B] transition-colors cursor-pointer font-medium"
                  title="Ignorer pour le moment"
                >
                  Plus tard
                </button>
              </div>
            </div>

            {/* Bouton fermeture */}
            <button
              onClick={() => setIsDismissed(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Modale d'instructions pour iPhone / iOS */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#C8E6D5] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <img
                  src="/logo-sante-symbol.png"
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
                <span className="font-bold text-[#007048]">Installation sur iPhone</span>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#406354]">
              Pour installer SANTÉ+ sur votre iPhone ou iPad depuis Safari :
            </p>

            <div className="space-y-3 text-xs text-[#1B362B]">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F0F9F4] border border-[#C8E6D5]">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#00A86B] font-bold shadow-xs">
                  1
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span>Appuyez sur le bouton <strong>Partager</strong></span>
                  <Share2 className="w-4 h-4 text-[#00A86B]" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F0F9F4] border border-[#C8E6D5]">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#00A86B] font-bold shadow-xs">
                  2
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span>Sélectionnez <strong>« Sur l'écran d'accueil »</strong></span>
                  <PlusSquare className="w-4 h-4 text-[#00A86B]" />
                </div>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-xl bg-[#F0F9F4] border border-[#C8E6D5]">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#00A86B] font-bold shadow-xs">
                  3
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span>Appuyez sur <strong>« Ajouter »</strong> en haut à droite</span>
                  <CheckCircle className="w-4 h-4 text-[#00A86B]" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#00A86B] text-white font-bold text-xs hover:bg-[#007048] transition-colors"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// Petit bouton permanent pour intégration dans le Header
export const PwaHeaderButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      setDeferredPrompt(null);
    } else {
      alert(
        "Application SANTÉ+ Bénin (PWA) :\n\nPour installer l'application sur votre écran d'accueil :\n- Sur Android : Appuyez sur le menu (⋮) puis « Installer l'application ».\n- Sur iPhone : Appuyez sur Partager (📤) puis « Sur l'écran d'accueil »."
      );
    }
  };

  return (
    <button
      onClick={handleClick}
      title="Installer l'application sur votre appareil"
      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#007048] bg-[#E6F7F0] border border-[#00A86B] rounded-lg hover:bg-[#00A86B] hover:text-white transition-all shadow-xs cursor-pointer"
    >
      <Smartphone className="w-3.5 h-3.5" />
      <span>Installer l'App</span>
    </button>
  );
};
