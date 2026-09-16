import React, { useState } from "react";
import {
  Building2,
  Users,
  Activity,
  CreditCard,
  Droplet,
  AlertTriangle,
  Clock,
  Bed,
  Pill,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  LogOut,
  Plus,
  Minus,
  CheckCircle2,
  TrendingUp,
  Search,
  Download,
  Phone,
  Wrench,
  ShieldCheck,
} from "lucide-react";
import { BeninHealthMap } from "../components/BeninHealthMap";

interface HospitalDashboardScreenProps {
  onBackToLanding: () => void;
  onOpenPublicIasoMap: () => void;
}

export const HospitalDashboardScreen: React.FC<HospitalDashboardScreenProps> = ({
  onBackToLanding,
  onOpenPublicIasoMap,
}) => {
  // Menu sélectionné
  const [activeMenu, setActiveMenu] = useState<
    | "dashboard"
    | "medecins"
    | "patients"
    | "services"
    | "pharmacie"
    | "stocks"
    | "commandes"
    | "reseau"
    | "rapports"
    | "parametres"
  >("dashboard");

  // Données de santé de production (À remplir en production)
  const [kpiPatients, setKpiPatients] = useState(0);
  const [kpiConsult, setKpiConsult] = useState(0);
  const [kpiRevenue, setKpiRevenue] = useState("0");
  const [kpiDons, setKpiDons] = useState(0);

  // Alertes interactives — Structure vide (À remplir en production)
  const [alerts, setAlerts] = useState<Array<{
    id: number;
    title: string;
    level: string;
    time: string;
    resolved: boolean;
  }>>([
    // À remplir en production
  ]);

  // Médecins de l'hôpital — Structure vide (À remplir en production)
  const [doctors, setDoctors] = useState<Array<{
    id: number;
    name: string;
    specialty: string;
    patients: number;
    status: string;
  }>>([
    // À remplir en production
  ]);

  // Dernières consultations — Structure vide (À remplir en production)
  const [recentConsultations, setRecentConsultations] = useState<Array<{
    id: string;
    patient: string;
    doctor: string;
    time: string;
    motif: string;
  }>>([
    // À remplir en production
  ]);

  // Services et lits
  const [services, setServices] = useState([
    { id: 1, name: "Réanimation", total: 16, occupied: 0 },
    { id: 2, name: "Urgences", total: 24, occupied: 0 },
    { id: 3, name: "Médecine Interne", total: 40, occupied: 0 },
    { id: 4, name: "Maternité", total: 35, occupied: 0 },
  ]);

  // Données mensuelles pour le graphique interactif (À remplir en production)
  const [selectedYear, setSelectedYear] = useState("2026");
  const monthlyData: Array<{ month: string; consult: number; revenue: number }> = [
    // À remplir en production
  ];

  // Action résoudre alerte
  const handleResolveAlert = (id: number) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  };

  // Ajuster lits
  const handleBedChange = (id: number, delta: number) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextOccupied = Math.min(Math.max(0, s.occupied + delta), s.total);
          return { ...s, occupied: nextOccupied };
        }
        return s;
      })
    );
  };

  // Exporter rapport
  const [exportSuccess, setExportSuccess] = useState(false);
  const handleExport = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F0F9F4] text-[#1B362B] flex flex-col font-sans pb-16">
      {/* 1. HEADER HÔPITAL */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#C8E6D5] px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7F0] border border-[#00A86B] flex items-center justify-center text-[#007048]">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl text-[#007048] font-display">
                SANTÉ+ Hôpital
              </span>
              <span className="block text-xs font-semibold text-[#406354]">
                Établissement Homologué
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenPublicIasoMap}
              className="min-h-[44px] px-3.5 bg-[#E6F7F0] hover:bg-[#D6F2E5] border border-[#00A86B] text-[#007048] font-bold rounded-xl text-xs sm:text-sm hidden sm:flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Fiche IASO</span>
            </button>

            <button
              type="button"
              onClick={onBackToLanding}
              className="min-h-[44px] px-4 bg-[#E6F7F0] hover:bg-[#D6F2E5] border border-[#C8E6D5] text-[#007048] font-bold rounded-xl flex items-center gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MENU HORIZONTAL DE NAVIGATION */}
      <div className="bg-white border-b border-[#C8E6D5] px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-2 py-2">
          {[
            { key: "dashboard", label: "Dashboard" },
            { key: "medecins", label: "Médecins" },
            { key: "patients", label: "Patients" },
            { key: "services", label: "Services et lits" },
            { key: "pharmacie", label: "Pharmacie" },
            { key: "stocks", label: "Stocks" },
            { key: "commandes", label: "Commandes" },
            { key: "reseau", label: "Réseau de santé" },
            { key: "rapports", label: "Rapports" },
            { key: "parametres", label: "Paramètres" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveMenu(item.key as any)}
              className={`min-h-[44px] px-4 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
                activeMenu === item.key
                  ? "bg-[#00A86B] text-white shadow-xs"
                  : "bg-transparent text-[#406354] hover:bg-[#E6F7F0]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. CONTENU DES ONGLETS */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        {/* VUE 1 : DASHBOARD PRINCIPAL */}
        {activeMenu === "dashboard" && (
          <div className="space-y-6">
            {/* 4 CARTES KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs">
                <span className="text-3xl sm:text-4xl font-black text-[#007048] block font-display">
                  {kpiPatients.toLocaleString()}
                </span>
                <span className="text-base font-bold text-[#406354] block mt-1">
                  Patients
                </span>
              </div>

              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs">
                <span className="text-3xl sm:text-4xl font-black text-[#007048] block font-display">
                  {kpiConsult}
                </span>
                <span className="text-base font-bold text-[#406354] block mt-1">
                  Consult.
                </span>
              </div>

              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs">
                <span className="text-3xl sm:text-4xl font-black text-[#007048] block font-display">
                  {kpiRevenue}
                </span>
                <span className="text-base font-bold text-[#406354] block mt-1">
                  FCFA
                </span>
              </div>

              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs">
                <span className="text-3xl sm:text-4xl font-black text-[#007048] block font-display">
                  {kpiDons}
                </span>
                <span className="text-base font-bold text-[#406354] block mt-1">
                  Dons
                </span>
              </div>
            </div>

            {/* RANGÉE 1 : ÉVOLUTION MENSUELLE & ALERTES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* GRAPHIQUE ÉVOLUTION MENSUELLE */}
              <div className="lg:col-span-2 bg-white border border-[#C8E6D5] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#1B362B] font-display">
                    Évolution mensuelle
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedYear("2026")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg ${
                        selectedYear === "2026"
                          ? "bg-[#00A86B] text-white"
                          : "bg-[#E6F7F0] text-[#007048]"
                      }`}
                    >
                      2026
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedYear("2025")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg ${
                        selectedYear === "2025"
                          ? "bg-[#00A86B] text-white"
                          : "bg-[#E6F7F0] text-[#007048]"
                      }`}
                    >
                      2025
                    </button>
                  </div>
                </div>

                {/* VISUALISATION GRAPHIQUE SVG */}
                <div className="pt-4">
                  <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-[#C8E6D5] pb-2">
                    {monthlyData.map((d) => {
                      const heightPercent = Math.round((d.consult / 450) * 100);
                      return (
                        <div
                          key={d.month}
                          className="flex-1 flex flex-col items-center gap-2 group"
                        >
                          <span className="text-xs font-bold text-[#007048] opacity-0 group-hover:opacity-100 transition-opacity">
                            {d.consult}
                          </span>
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full bg-[#00A86B] group-hover:bg-[#007048] rounded-t-lg transition-all"
                          />
                          <span className="text-xs font-bold text-[#406354]">
                            {d.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#406354] pt-2">
                    <span>Consultations / mois</span>
                    <span>Tendance : +14%</span>
                  </div>
                </div>
              </div>

              {/* ALERTES HÔPITAL */}
              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#1B362B] font-display">
                    Alertes
                  </h2>
                  <span className="text-xs font-bold bg-[#E6F7F0] text-[#007048] px-2.5 py-1 rounded-full">
                    {alerts.filter((a) => !a.resolved).length} actives
                  </span>
                </div>

                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="py-6 text-center text-sm font-semibold text-[#406354]">
                      Aucune alerte active dans l'établissement
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3.5 rounded-xl border flex items-start justify-between gap-2 ${
                          alert.resolved
                            ? "bg-gray-50 border-gray-200 opacity-60"
                            : "bg-[#E6F7F0]/60 border-[#C8E6D5]"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-sm text-[#1B362B]">
                            - {alert.title}
                          </p>
                          <span className="text-xs text-[#406354]">
                            {alert.level} • {alert.time}
                          </span>
                        </div>

                        {!alert.resolved && (
                          <button
                            type="button"
                            onClick={() => handleResolveAlert(alert.id)}
                            className="px-2.5 py-1 text-xs font-bold bg-[#00A86B] text-white rounded-lg hover:bg-[#007048] transition-colors whitespace-nowrap"
                          >
                            Traiter
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* RANGÉE 2 : MÉDECINS ACTIFS & DERNIÈRES CONSULTATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* MÉDECINS ACTIFS */}
              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#1B362B] font-display">
                    Médecins actifs
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveMenu("medecins")}
                    className="text-xs font-bold text-[#00A86B] hover:underline"
                  >
                    Voir tout
                  </button>
                </div>

                <div className="divide-y divide-[#C8E6D5]/60">
                  {doctors.length === 0 ? (
                    <div className="py-6 text-center text-sm font-semibold text-[#406354]">
                      Aucun médecin enregistré
                    </div>
                  ) : (
                    doctors.map((doc) => (
                      <div
                        key={doc.id}
                        className="py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-base text-[#1B362B]">
                            - {doc.name} ({doc.patients} patients)
                          </p>
                          <p className="text-xs text-[#406354]">{doc.specialty}</p>
                        </div>
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#E6F7F0] text-[#007048]">
                          {doc.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* DERNIÈRES CONSULTATIONS */}
              <div className="bg-white border border-[#C8E6D5] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#1B362B] font-display">
                    Dernières consultations
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveMenu("patients")}
                    className="text-xs font-bold text-[#00A86B] hover:underline"
                  >
                    Historique
                  </button>
                </div>

                <div className="divide-y divide-[#C8E6D5]/60">
                  {recentConsultations.length === 0 ? (
                    <div className="py-6 text-center text-sm font-semibold text-[#406354]">
                      Aucune consultation récente enregistrée
                    </div>
                  ) : (
                    recentConsultations.map((c) => (
                      <div
                        key={c.id}
                        className="py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-base text-[#1B362B]">
                            - {c.patient} ({c.time})
                          </p>
                          <p className="text-xs text-[#406354]">
                            {c.motif} • {c.doctor}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[#00A86B]">
                          Validé
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VUE 2 : MÉDECINS */}
        {activeMenu === "medecins" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-[#1B362B] font-display">
                MÉDECINS ET PRATICIENS
              </h1>
              <button
                type="button"
                onClick={() => {
                  setDoctors((prev) => [
                    ...prev,
                    {
                      id: prev.length + 1,
                      name: "Dr. Dossou",
                      specialty: "Généraliste",
                      patients: 0,
                      status: "En service",
                    },
                  ]);
                }}
                className="min-h-[48px] px-5 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold rounded-xl text-sm"
              >
                + Ajouter médecin
              </button>
            </div>

            <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs divide-y divide-[#C8E6D5]/60">
              {doctors.map((d) => (
                <div key={d.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{d.name}</h3>
                    <p className="text-sm text-[#406354]">{d.specialty} • {d.patients} patients suivis</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#E6F7F0] text-[#007048] font-bold text-xs rounded-xl">
                      {d.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VUE 3 : PATIENTS */}
        {activeMenu === "patients" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-[#1B362B] font-display">
              REGISTRE PATIENTS
            </h1>
            <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs space-y-4">
              <input
                type="text"
                placeholder="Rechercher par nom ou NPI..."
                className="w-full min-h-[48px] px-4 rounded-xl border border-[#C8E6D5] text-base"
              />
              <div className="divide-y divide-[#C8E6D5]/60">
                {recentConsultations.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-base">{c.patient}</p>
                      <p className="text-xs text-[#406354]">Dernier passage : Aujourd'hui {c.time} ({c.motif})</p>
                    </div>
                    <button
                      type="button"
                      className="min-h-[44px] px-4 bg-[#E6F7F0] text-[#007048] font-bold rounded-xl text-sm"
                    >
                      Dossier
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VUE 4 : SERVICES ET LITS */}
        {activeMenu === "services" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-[#1B362B] font-display">
              SERVICES ET GESTION DES LITS
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-[#1B362B]">{s.name}</h3>
                    <span className="text-sm font-bold text-[#007048]">
                      {s.occupied} / {s.total} lits
                    </span>
                  </div>

                  <div className="w-full bg-[#E6F7F0] h-3 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(s.occupied / s.total) * 100}%` }}
                      className="bg-[#00A86B] h-full"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-[#406354]">
                      Libres : {s.total - s.occupied}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleBedChange(s.id, -1)}
                        className="w-10 h-10 rounded-xl bg-[#E6F7F0] text-[#007048] font-bold flex items-center justify-center hover:bg-[#D6F2E5]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBedChange(s.id, 1)}
                        className="w-10 h-10 rounded-xl bg-[#00A86B] text-white font-bold flex items-center justify-center hover:bg-[#007048]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VUE 5 : PHARMACIE */}
        {activeMenu === "pharmacie" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-[#1B362B] font-display">
              PHARMACIE HOSPITALIÈRE
            </h1>
            <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs space-y-3">
              {[
                { name: "Paracétamol Injectable 1g", stock: 140, seuil: 50 },
                { name: "Artéméther-Luméfantrine", stock: 85, seuil: 30 },
                { name: "Ceftriaxone 1g", stock: 22, seuil: 25 },
              ].map((med, i) => (
                <div key={i} className="py-3 flex items-center justify-between border-b border-[#C8E6D5]/60">
                  <div>
                    <p className="font-bold text-base">{med.name}</p>
                    <p className="text-xs text-[#406354]">Seuil d'alerte : {med.seuil} unités</p>
                  </div>
                  <span className={`px-3 py-1 font-bold text-xs rounded-xl ${
                    med.stock <= med.seuil ? "bg-red-100 text-red-700" : "bg-[#E6F7F0] text-[#007048]"
                  }`}>
                    {med.stock} en stock
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VUE 6 : STOCKS */}
        {activeMenu === "stocks" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-[#1B362B] font-display">
              STOCKS ET SANG CNTS
            </h1>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Sang O+", count: 4, alert: true },
                { label: "Sang A+", count: 8, alert: false },
                { label: "Sang B+", count: 6, alert: false },
                { label: "Sang AB+", count: 3, alert: false },
              ].map((b, i) => (
                <div key={i} className="bg-white border border-[#C8E6D5] rounded-2xl p-4 text-center shadow-xs">
                  <span className="text-2xl font-black text-[#007048]">{b.count}</span>
                  <p className="text-xs font-bold text-[#406354] mt-1">{b.label}</p>
                  {b.alert && (
                    <span className="text-[10px] font-bold text-red-600 block mt-1">
                      Seuil critique
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VUE 7 : COMMANDES */}
        {activeMenu === "commandes" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-[#1B362B] font-display">
              COMMANDES ET APPROVISIONNEMENTS
            </h1>
            <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs space-y-3">
              <div className="p-3 bg-[#E6F7F0] rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-base">Commande #CMD-902 (CNTS)</p>
                  <p className="text-xs text-[#406354]">10 poches O+ • En livraison</p>
                </div>
                <span className="text-xs font-bold text-[#007048]">En cours</span>
              </div>
            </div>
          </div>
        )}

        {/* VUE : RÉSEAU DE SANTÉ & CARTOGRAPHIE */}
        {activeMenu === "reseau" && (
          <div className="space-y-4">
            <div className="bg-white border border-[#C8E6D5] rounded-2xl p-5 shadow-xs">
              <h2 className="text-2xl font-extrabold text-[#1B362B] font-display">
                RÉSEAU NATIONAL DE SANTÉ DU BÉNIN
              </h2>
              <p className="text-sm text-[#406354]">
                Accédez aux autres hôpitaux du réseau national pour les transferts d'urgence, localisez les pharmacies partenaires et suivez les disponibilités.
              </p>
            </div>
            <BeninHealthMap />
          </div>
        )}

        {/* VUE 8 : RAPPORTS */}
        {activeMenu === "rapports" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-[#1B362B] font-display">
              RAPPORTS D'ACTIVITÉ
            </h1>
            <div className="bg-white border border-[#C8E6D5] rounded-2xl p-6 shadow-xs text-center space-y-4">
              <FileText className="w-12 h-12 text-[#00A86B] mx-auto" />
              <p className="text-lg font-bold text-[#1B362B]">
                Rapport mensuel d'activité - Février 2026
              </p>
              <button
                type="button"
                onClick={handleExport}
                className="min-h-[64px] px-8 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-lg rounded-2xl inline-flex items-center gap-2 transition-all"
              >
                <Download className="w-6 h-6" />
                <span>{exportSuccess ? "Export terminé (CSV)" : "Exporter les données (CSV)"}</span>
              </button>
            </div>
          </div>
        )}

        {/* VUE 9 : PARAMÈTRES */}
        {activeMenu === "parametres" && (
          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-[#1B362B] font-display">
              PARAMÈTRES ÉTABLISSEMENT
            </h1>
            <div className="bg-white border border-[#C8E6D5] rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <label className="text-xs font-bold text-[#406354] uppercase block">Nom officiel</label>
                <p className="text-lg font-bold text-[#1B362B]">Établissement Homologué</p>
              </div>
              <div>
                <label className="text-xs font-bold text-[#406354] uppercase block">Identifiant IASO</label>
                <p className="text-base font-mono text-[#007048] font-bold">IASO-BJ-LIT-SM02</p>
              </div>
              <div>
                <label className="text-xs font-bold text-[#406354] uppercase block">Régulation SAMU</label>
                <p className="text-base text-[#1B362B]">Ligne prioritaire active (15)</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
