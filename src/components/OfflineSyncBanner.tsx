import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw, CheckCircle2, Shield } from "lucide-react";

export const OfflineSyncBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    // Calcul des éléments en attente dans la file hors-ligne
    const checkQueue = () => {
      try {
        const queue = JSON.parse(
          localStorage.getItem("sante_offline_queue") || "[]"
        );
        setPendingSyncCount(queue.length);
      } catch {
        setPendingSyncCount(0);
      }
    };

    checkQueue();

    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      // Synchronisation de la file
      setTimeout(() => {
        try {
          localStorage.removeItem("sante_offline_queue");
          setPendingSyncCount(0);
        } catch {
          // Ignore
        }
      }, 1500);

      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 4500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
      checkQueue();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline && !justReconnected) {
    return null;
  }

  return (
    <div
      className={`w-full py-2.5 px-4 text-xs font-bold transition-all duration-300 flex items-center justify-between z-50 shadow-xs ${
        isOnline
          ? "bg-[#E6F7F0] text-[#007048] border-b border-[#00A86B]/30"
          : "bg-[#FFF9E6] text-[#9A6700] border-b border-[#FFE082]"
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-[#00A86B] animate-pulse" />
              <span>
                Connexion rétablie • Données médicales synchronisées avec le
                serveur national SANTÉ+
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-[#D97706]" />
              <span>
                Mode Hors-Ligne Actif (Zones à faible couverture / Dispensaires)
                • Les consultations et constantes sont enregistrées localement
                en sécurité.
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isOnline && (
            <span className="px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 text-[11px] font-mono">
              {pendingSyncCount} action(s) locale(s)
            </span>
          )}
          <span className="text-[11px] font-semibold opacity-80 hidden sm:inline">
            PWA Résiliente ASIN
          </span>
        </div>
      </div>
    </div>
  );
};
