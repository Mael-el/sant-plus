import React, { useEffect, useRef, useState } from "react";
import {
  Shield,
  FolderHeart,
  Brain,
  Building2,
  CreditCard,
  Home,
  AlertCircle,
  PhoneCall,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  X,
  LogOut,
  Droplet,
  FileText,
  User,
} from "lucide-react";
import { SanteScreen, FhirMedicationRequestEntity } from "../types";
import { PwaHeaderButton } from "./PwaInstallBanner";

// --- Forme Asymétrique et Bouton 3D ---

export const SanteAsymmetricCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  topBorderColor?: string;
  onClick?: () => void;
}> = ({ children, className = "", topBorderColor = "#00A86B", onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: "24px 24px 12px 24px",
        borderTop: `4px solid ${topBorderColor}`,
        boxShadow: "0 5px 0 #C8E6D5, 0 10px 24px rgba(0, 100, 65, 0.10)",
      }}
      className={`bg-white border border-[#C8E6D5] p-6 sm:p-7 transition-all duration-300 ${
        onClick
          ? "cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_8px_0_#C8E6D5,0_16px_32px_rgba(0,100,65,0.14)] hover:border-[#00A86B]"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const Sante3DButton: React.FC<{
  text?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}> = ({
  text,
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  icon,
  fullWidth = true,
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 450);

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      style={{
        borderRadius: "18px",
        boxShadow: isPressed
          ? "0 2px 0 #004D31"
          : "0 7px 0 #007048, 0 12px 28px rgba(0,168,107,0.32)",
        transform: isPressed ? "translateY(2px)" : "translateY(0)",
      }}
      className={`relative overflow-hidden min-h-[64px] px-6 py-3.5 bg-[#00A86B] hover:bg-[#00965F] hover:-translate-y-1 active:translate-y-0.5 text-white font-bold text-lg sm:text-xl flex items-center justify-center gap-2.5 transition-all select-none ${
        fullWidth ? "w-full" : ""
      } ${
        disabled ? "opacity-50 cursor-not-allowed shadow-none" : ""
      } ${className}`}
    >
      {/* Ripples */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)",
          }}
          className="absolute w-24 h-24 bg-white/30 rounded-full animate-ping pointer-events-none"
        />
      ))}
      {icon}
      {children ? children : (text ? <span>{text}</span> : null)}
    </button>
  );
};

export const SanteSecondaryButton: React.FC<{
  text: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}> = ({ text, onClick, className = "", icon, fullWidth = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: "16px",
      }}
      className={`min-h-[64px] px-6 py-4 bg-[#E6F7F0] border-2 border-[#007048] text-[#007048] hover:bg-[#D6F2E5] font-bold text-lg sm:text-xl flex items-center justify-center gap-2.5 transition-all select-none ${
        fullWidth ? "w-full" : ""
      } ${className}`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
};

// --- QR Code Canvas Simplifié & Déterministe ---

export const SimulatedQrCodeView: React.FC<{
  dataPayload: string;
  size?: number;
}> = ({ dataPayload, size = 180 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);

    const gridSize = 19;
    const cellSize = size / gridSize;
    let hash = 0;
    for (let i = 0; i < dataPayload.length; i++) {
      hash = (hash << 5) - hash + dataPayload.charCodeAt(i);
      hash |= 0;
    }

    ctx.fillStyle = "#007048";

    // Coin Haut Gauche
    ctx.fillRect(0, 0, cellSize * 5, cellSize * 5);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(cellSize, cellSize, cellSize * 3, cellSize * 3);
    ctx.fillStyle = "#007048";
    ctx.fillRect(cellSize * 2, cellSize * 2, cellSize, cellSize);

    // Coin Haut Droit
    ctx.fillRect(size - cellSize * 5, 0, cellSize * 5, cellSize * 5);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(size - cellSize * 4, cellSize, cellSize * 3, cellSize * 3);
    ctx.fillStyle = "#007048";
    ctx.fillRect(size - cellSize * 3, cellSize * 2, cellSize, cellSize);

    // Coin Bas Gauche
    ctx.fillRect(0, size - cellSize * 5, cellSize * 5, cellSize * 5);
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(cellSize, size - cellSize * 4, cellSize * 3, cellSize * 3);
    ctx.fillStyle = "#007048";
    ctx.fillRect(cellSize * 2, size - cellSize * 3, cellSize, cellSize);

    // Modules intérieurs
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const inTL = row < 6 && col < 6;
        const inTR = row < 6 && col >= gridSize - 6;
        const inBL = row >= gridSize - 6 && col < 6;
        if (!inTL && !inTR && !inBL) {
          const bit =
            ((hash ^ (row * 31 + col * 17)) & (1 << ((row + col) % 30))) !== 0;
          if (bit) {
            ctx.fillRect(
              col * cellSize,
              row * cellSize,
              cellSize * 0.9,
              cellSize * 0.9
            );
          }
        }
      }
    }
  }, [dataPayload, size]);

  return (
    <div className="p-3 bg-white border-2 border-[#00A86B] rounded-2xl inline-block shadow-sm">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="block rounded-lg"
      />
    </div>
  );
};

// --- Top App Bar ---

export const SanteTopAppBar: React.FC<{
  currentScreen: SanteScreen;
  onEmergencyClick: () => void;
  onGoToLanding: () => void;
  onBloodBankClick: () => void;
}> = ({
  currentScreen,
  onEmergencyClick,
  onGoToLanding,
  onBloodBankClick,
}) => {
  const getScreenTitle = (screen: SanteScreen) => {
    switch (screen) {
      case SanteScreen.LANDING:
        return "Orientation & Inscription";
      case SanteScreen.INSCRIPTION_PATIENT:
        return "Espace Patient (Login / Signup)";
      case SanteScreen.DEMANDE_MEDECIN:
        return "Accès Praticien ONMB";
      case SanteScreen.DEMANDE_HOPITAL:
        return "Démo Hôpital / IASO";
      case SanteScreen.CONNEXION:
        return "Connexion Sécurisée";
      case SanteScreen.HOME:
        return "Portail Citoyen & Dossier Médical";
      case SanteScreen.DOSSIER:
        return "Dossier FHIR R4 & Blockchain";
      case SanteScreen.TRIAGE_AI:
        return "Triage Clinique IA & Pharmacie";
      case SanteScreen.IASO_MAP:
        return "Géoregistre IASO & DHIS2";
      case SanteScreen.PAYMENTS:
        return "Paiements PI-SPI & Mobile Money";
      case SanteScreen.BLOOD_BANK:
        return "Banque de Sang & Urgences";
      case SanteScreen.ADMIN_LOGIN:
        return "Authentification Administrateur";
      case SanteScreen.ADMIN_DASHBOARD:
        return "Administration Centrale Desktop";
      case SanteScreen.ACCOUNT_SETTINGS:
        return "Mon Compte & Sécurité";
      default:
        return "Santé Numérique Bénin";
    }
  };

  const isPublicScreen =
    currentScreen === SanteScreen.LANDING ||
    currentScreen === SanteScreen.INSCRIPTION_PATIENT ||
    currentScreen === SanteScreen.DEMANDE_MEDECIN ||
    currentScreen === SanteScreen.DEMANDE_HOPITAL ||
    currentScreen === SanteScreen.ADMIN_LOGIN;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#C2E8D8] shadow-xs px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo & Titre */}
        <div
          onClick={onGoToLanding}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-[#C2E8D8] flex items-center justify-center p-1 shadow-xs overflow-hidden">
            <img src="/logo-sante-symbol.png" alt="Logo SANTÉ+" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-[#007048] font-display">
                SANTÉ+
              </span>
              <span className="px-2 py-0.5 text-xs font-black bg-[#E6F7F0] border border-[#00A86B] text-[#007048] rounded-md tracking-wider">
                BÉNIN
              </span>
            </div>
            <p className="text-sm font-medium text-[#406354] hidden sm:block">
              {getScreenTitle(currentScreen)}
            </p>
          </div>
        </div>

        {/* Actions header */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bouton PWA Installation */}
          <PwaHeaderButton />

          {/* Bouton Banque de Sang */}
          {!isPublicScreen && (
            <button
              onClick={onBloodBankClick}
              title="Banque de Sang"
              className="p-2 rounded-xl bg-[#E6F7F0] text-[#007048] border border-[#00A86B] hover:bg-[#D5F0E4] transition-colors"
            >
              <Droplet className="w-5 h-5 fill-[#00A86B]" />
            </button>
          )}

          {/* Bouton Changer de Profil / Quitter */}
          {!isPublicScreen && (
            <button
              onClick={onGoToLanding}
              title="Changer de profil"
              className="p-2 rounded-xl bg-[#E6F7F0] text-[#007048] border border-[#C2E8D8] hover:bg-[#D5F0E4] transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

          {/* Bouton SOS SAMU 15 */}
          <button
            type="button"
            onClick={onEmergencyClick}
            className="h-11 px-3.5 sm:px-4 bg-[#007048] hover:bg-[#005a39] text-white font-bold rounded-xl flex items-center gap-2 text-sm sm:text-base shadow-sm transition-transform active:scale-95"
          >
            <AlertCircle className="w-5 h-5 animate-pulse text-white" />
            <span>SAMU 15</span>
          </button>
        </div>
      </div>
    </header>
  );
};

// --- Bottom Navigation Bar ---

export const SanteBottomNavigationBar: React.FC<{
  currentScreen: SanteScreen;
  onNavigate: (screen: SanteScreen) => void;
}> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { screen: SanteScreen.HOME, label: "Accueil", icon: Home },
    { screen: SanteScreen.DOSSIER, label: "Dossier", icon: FolderHeart },
    { screen: SanteScreen.TRIAGE_AI, label: "Ordonnances", icon: FileText },
    { screen: SanteScreen.PAYMENTS, label: "Paiement", icon: CreditCard },
    { screen: SanteScreen.ACCOUNT_SETTINGS, label: "Profil", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#C2E8D8] shadow-lg py-1.5 px-2 sm:px-6">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map(({ screen, label, icon: Icon }) => {
          const isSelected = currentScreen === screen;
          return (
            <button
              key={screen}
              type="button"
              onClick={() => onNavigate(screen)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isSelected
                  ? "text-[#007048] font-bold bg-[#E6F7F0]"
                  : "text-[#688A7C] hover:text-[#007048] hover:bg-[#F4FAF7]"
              }`}
            >
              <Icon
                className={`w-6 h-6 transition-transform ${
                  isSelected ? "scale-110 text-[#007048]" : ""
                }`}
              />
              <span className="text-xs mt-0.5 select-none">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// --- Dialog: Medication QR Verification ---

export const MedicationQrDialog: React.FC<{
  medication: FhirMedicationRequestEntity;
  onDismiss: () => void;
}> = ({ medication, onDismiss }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-[#00A86B] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#C2E8D8]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[#00A86B]" />
            <h3 className="font-bold text-xl text-[#007048] font-display">
              Ordonnance Certifiée
            </h3>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full hover:bg-gray-100 text-[#406354]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center py-4">
          <p className="text-sm text-[#406354] mb-3">
            Présentez ce QR Code en officine pour vérification d'authenticité
          </p>

          <SimulatedQrCodeView
            dataPayload={`SANTE_BJ_ORD:${medication.id}:${medication.blockchainProofHash}`}
            size={180}
          />

          <div className="mt-4">
            <h4 className="font-bold text-lg text-[#1B362B]">
              {medication.medicationName}
            </h4>
            <p className="text-sm text-[#406354] font-medium">
              {medication.dosage} • {medication.frequency}
            </p>
            <p className="text-xs text-[#688A7C] mt-1">
              Prescrit par {medication.doctorName} ({medication.facilityName}) le{" "}
              {medication.prescribedDate}
            </p>
          </div>

          <div className="mt-4 p-3 bg-[#E6F7F0] rounded-xl text-left border border-[#C2E8D8]">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#007048] mb-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Preuve d'Intégrité Bitcoin (OP_RETURN)</span>
            </div>
            <p className="font-mono text-[11px] text-[#406354] break-all">
              {medication.blockchainProofHash}
            </p>
          </div>
        </div>

        <Sante3DButton text="Fermer" onClick={onDismiss} />
      </div>
    </div>
  );
};

// --- Dialog: Emergency Numbers (SAMU 15 Bénin) ---

export const EmergencyQuickSheet: React.FC<{
  onDismiss: () => void;
}> = ({ onDismiss }) => {
  const emergencies = [
    {
      name: "SAMU National (Bénin)",
      phone: "15",
      desc: "Service d'Aide Médicale d'Urgence",
    },
    {
      name: "Sapeurs Pompiers",
      phone: "118",
      desc: "Secours accidents & incendies",
    },
    {
      name: "CNHU-HKM Urgences",
      phone: "+229 21 30 01 55",
      desc: "Cotonou Hôpital de référence",
    },
    {
      name: "Banque de Sang (ANTS)",
      phone: "+229 21 30 19 20",
      desc: "Urgence transfusionnelle nationale",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-2 border-[#007048] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#C2E8D8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#007048] flex items-center justify-center text-white">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-[#007048] font-display">
                Urgences Médicales Bénin
              </h3>
              <p className="text-xs text-[#406354]">
                Assistance médicale immédiate 24h/24
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full hover:bg-gray-100 text-[#406354]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 my-4">
          {emergencies.map((em, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 bg-[#E6F7F0] border border-[#C2E8D8] rounded-2xl"
            >
              <div>
                <p className="font-bold text-base text-[#007048]">{em.name}</p>
                <p className="text-xs text-[#406354]">{em.desc}</p>
              </div>
              <a
                href={`tel:${em.phone.replace(/\s+/g, "")}`}
                className="px-4 py-2 bg-[#007048] text-white font-bold text-sm rounded-xl hover:bg-[#005a39] flex items-center gap-1.5 shadow-sm"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{em.phone}</span>
              </a>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="w-full py-3 text-center text-sm font-bold text-[#007048] hover:bg-[#E6F7F0] rounded-xl transition-colors"
        >
          Fermer la fenêtre
        </button>
      </div>
    </div>
  );
};

// --- Dialog: Export FHIR HL7 R4 Bundle ---

export const FhirExportDialog: React.FC<{
  jsonContent: string;
  onDismiss: () => void;
}> = ({ jsonContent, onDismiss }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border-2 border-[#00A86B] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#C2E8D8]">
          <div className="flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-[#007048]" />
            <div>
              <h3 className="font-bold text-xl text-[#007048] font-display">
                HL7 FHIR R4 Bundle
              </h3>
              <p className="text-xs text-[#406354]">
                Interopérabilité standardisée pour plateformes IASO, DHIS2 & ANIP
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full hover:bg-gray-100 text-[#406354]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 flex-1 overflow-auto bg-[#1B362B] text-[#E6F7F0] p-4 rounded-2xl font-mono text-xs border border-[#007048]">
          <pre>{jsonContent}</pre>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-5 py-2.5 bg-[#E6F7F0] border-2 border-[#00A86B] text-[#007048] hover:bg-[#D5F0E4] font-bold text-sm rounded-xl flex items-center gap-2 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#00A86B]" />
                <span>JSON copié !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier le JSON</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="px-6 py-2.5 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-sm rounded-xl shadow-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
