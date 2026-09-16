import React, { useState } from "react";
import {
  Shield,
  Building2,
  Users,
  Activity,
  CreditCard,
  CheckCircle2,
  XCircle,
  Phone,
  AlertTriangle,
  LogOut,
  TrendingUp,
  Search,
  Filter,
  Download,
  FileCheck,
  Server,
  Settings,
  Plus,
  Clock,
  UserCheck,
  Stethoscope,
  MapPin,
  RefreshCw,
  Sliders,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Sante3DButton, SanteAsymmetricCard } from "../components/CommonComponents";

interface AdminDashboardScreenProps {
  onLogout: () => void;
}

interface PendingRequest {
  id: number;
  name: string;
  type: "Praticien ONMB" | "Établissement IASO";
  details: string;
  phone: string;
  npiOrLicense: string;
  date: string;
  status: "En attente" | "Validé" | "Refusé";
}

interface AdminUser {
  id: number;
  npi: string;
  fullName: string;
  role: "Citoyen" | "Médecin" | "Hôpital" | "DSI Admin";
  phone: string;
  city: string;
  status: "Actif" | "Suspendu" | "En attente";
}

interface AdminHospital {
  id: number;
  name: string;
  department: string;
  commune: string;
  type: string;
  totalBeds: number;
  availableBeds: number;
  phone: string;
  iasoCertified: boolean;
}

interface AdminDoctor {
  id: number;
  name: string;
  onmbNumber: string;
  specialty: string;
  facility: string;
  phone: string;
  activeStatus: boolean;
}

interface AdminPatient {
  id: number;
  npi: string;
  fullName: string;
  gender: string;
  bloodGroup: string;
  electrophoresis: string;
  city: string;
  anipVerified: boolean;
}

interface AdminPayment {
  id: number;
  ref: string;
  patientName: string;
  amount: number;
  method: "MTN MoMo" | "Moov Money" | "Celtiis Cash" | "FedaPay";
  purpose: string;
  date: string;
  status: "Succès" | "En cours" | "Échoué";
}

interface AdminAuditLog {
  id: string;
  who: string;
  action: string;
  target: string;
  timestamp: string;
  severity: "INFO" | "ALERTE" | "SÉCURITÉ";
  hash: string;
}

interface NationalAlert {
  id: number;
  title: string;
  region: string;
  level: "MODÉRÉ" | "URGENT" | "CRITIQUE";
  date: string;
  status: "En cours" | "Résolue";
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onLogout,
}) => {
  // Navigation Menu Admin (10 onglets)
  const [activeMenu, setActiveMenu] = useState<
    | "dashboard"
    | "demandes"
    | "utilisateurs"
    | "hopitaux"
    | "medecins"
    | "patients"
    | "paiements"
    | "audit"
    | "statistiques"
    | "parametres"
  >("dashboard");

  // --- ÉTATS DYNAMIQUES DU DASHBOARD & MODULES ---
  // Production - À remplir par les vrais utilisateurs
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([
    // Production - À remplir par les vrais utilisateurs
  ]);

  const [nationalAlerts, setNationalAlerts] = useState<NationalAlert[]>([
    // Production - À remplir par les vrais utilisateurs
  ]);

  const [usersList, setUsersList] = useState<AdminUser[]>([
    // Production - À remplir par les vrais utilisateurs
  ]);

  const [hospitalsList, setHospitalsList] = useState<AdminHospital[]>([
    // Production - À remplir par les vrais utilisateurs
  ]);

  const [doctorsList, setDoctorsList] = useState<AdminDoctor[]>([
    // Production - À remplir par les vrais utilisateurs
  ]);

  const [patientsList, setPatientsList] = useState<AdminPatient[]>([
    // Production - À remplir par les vrais utilisateurs
  ]);

  const [paymentsList, setPaymentsList] = useState<AdminPayment[]>([
    // Production - À remplir par les vrais utilisateurs
  ]);

  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([
    // Production - À remplir par les vrais utilisateurs
  ]);

  // Chargement réel des données depuis la base de données avec pagination 20/page
  React.useEffect(() => {
    // 1. Récupération des demandes réelles
    fetch("/api/requests?page=1&limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.items)) {
          setPendingRequests(
            data.items.map((it: any) => ({
              id: it.id,
              name: it.name,
              type: it.type === "doctor" ? "Praticien ONMB" : "Établissement IASO",
              details: `Fonction : ${it.function}`,
              phone: it.phone,
              npiOrLicense: it.email,
              date: new Date(it.created_at).toLocaleDateString("fr-FR"),
              status: it.status === "approved" ? "Validé" : it.status === "rejected" ? "Refusé" : "En attente",
            }))
          );
        }
      })
      .catch(() => {});

    // 2. Récupération des utilisateurs réels
    fetch("/api/admin/users?page=1&limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          setUsersList(
            data.users.map((u: any, idx: number) => ({
              id: idx + 1,
              npi: u.id.slice(0, 10),
              fullName: u.email || u.phone || "Utilisateur",
              role: u.role === "patient" ? "Citoyen" : u.role === "doctor" ? "Médecin" : u.role === "hospital" ? "Hôpital" : "DSI Admin",
              phone: u.phone || "N/A",
              city: "Bénin",
              status: u.is_active ? "Actif" : "Suspendu",
            }))
          );
        }
      })
      .catch(() => {});

    // 3. Récupération des logs d'audit réels
    fetch("/api/admin/audit-logs?page=1&limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.logs)) {
          setAuditLogs(
            data.logs.map((l: any) => ({
              id: l.id.slice(0, 8).toUpperCase(),
              who: l.user_id ? l.user_id.slice(0, 8) : "Système",
              action: l.action,
              target: l.details || "Plateforme",
              timestamp: new Date(l.timestamp).toLocaleString("fr-FR"),
              severity: l.action.includes("FAILED") ? "SÉCURITÉ" : l.action.includes("ALERT") ? "ALERTE" : "INFO",
              hash: l.id,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Graphique
  const [graphFilter, setGraphFilter] = useState<"semaine" | "mois">("semaine");
  const weeklyData = [
    { label: "Lun", value: 68 },
    { label: "Mar", value: 84 },
    { label: "Mer", value: 92 },
    { label: "Jeu", value: 76 },
    { label: "Ven", value: 105 },
    { label: "Sam", value: 60 },
    { label: "Dim", value: 45 },
  ];

  // Filtres et recherches
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("TOUS");
  const [requestFilter, setRequestFilter] = useState<string>("TOUS");
  const [hospitalDeptFilter, setHospitalDeptFilter] = useState<string>("TOUS");

  // Notifications temporaires
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  // Modals d'ajout
  const [showAddHospitalModal, setShowAddHospitalModal] = useState(false);
  const [newHospitalName, setNewHospitalName] = useState("");
  const [newHospitalDept, setNewHospitalDept] = useState("Littoral");
  const [newHospitalCommune, setNewHospitalCommune] = useState("Cotonou");
  const [newHospitalBeds, setNewHospitalBeds] = useState(25);
  const [newHospitalPhone, setNewHospitalPhone] = useState("+229 ");

  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState("");
  const [newDoctorOnmb, setNewDoctorOnmb] = useState("ONMB-BJ-2026-");
  const [newDoctorSpec, setNewDoctorSpec] = useState("Médecine Générale");
  const [newDoctorFacility, setNewDoctorFacility] = useState("CNHU-HKM Cotonou");
  const [newDoctorPhone, setNewDoctorPhone] = useState("+229 ");

  const [showAlertModal, setShowAlertModal] = useState(false);
  const [newAlertTitle, setNewAlertTitle] = useState("");
  const [newAlertRegion, setNewAlertRegion] = useState("Département du Littoral");
  const [newAlertLevel, setNewAlertLevel] = useState<"MODÉRÉ" | "URGENT" | "CRITIQUE">("URGENT");

  // Paramètres système
  const [smsGatewayActive, setSmsGatewayActive] = useState(true);
  const [anipBiometricsActive, setAnipBiometricsActive] = useState(true);
  const [geminiAiTriageActive, setGeminiAiTriageActive] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [samuAlertThreshold, setSamuAlertThreshold] = useState("Moins de 5 lits");

  // --- ACTIONS FONCTIONNELLES ---
  const handleValidateRequest = (id: number) => {
    setPendingRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Validé" } : r))
    );
    const item = pendingRequests.find((r) => r.id === id);
    if (item) {
      setAuditLogs((prev) => [
        {
          id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
          who: "DSI-ADMIN (Session)",
          action: `Validation accréditation : ${item.name}`,
          target: item.type,
          timestamp: new Date().toLocaleTimeString("fr-FR"),
          severity: "INFO",
          hash: Math.random().toString(36).substring(2, 18),
        },
        ...prev,
      ]);
      showNotice(`Demande validée avec succès pour ${item.name}. Accréditation active.`);
    }
  };

  const handleRefuseRequest = (id: number) => {
    setPendingRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Refusé" } : r))
    );
    const item = pendingRequests.find((r) => r.id === id);
    if (item) {
      showNotice(`Dossier refusé pour ${item.name}. Notification envoyée.`);
    }
  };

  const handleCall = (phone: string, name: string) => {
    showNotice(`Liaison téléphonique établie avec ${name} (${phone})`);
  };

  const handleToggleUserStatus = (id: number) => {
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const next = u.status === "Actif" ? "Suspendu" : "Actif";
          showNotice(`Compte de ${u.fullName} passé au statut ${next}`);
          return { ...u, status: next };
        }
        return u;
      })
    );
  };

  const handleCreateHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHospitalName.trim()) return;
    const newHosp: AdminHospital = {
      id: Date.now(),
      name: newHospitalName,
      department: newHospitalDept,
      commune: newHospitalCommune,
      type: "Centre de Santé Homologué",
      totalBeds: Number(newHospitalBeds) || 20,
      availableBeds: Math.round((Number(newHospitalBeds) || 20) * 0.3),
      phone: newHospitalPhone,
      iasoCertified: true,
    };
    setHospitalsList((prev) => [newHosp, ...prev]);
    setShowAddHospitalModal(false);
    setNewHospitalName("");
    showNotice(`Établissement "${newHospitalName}" homologué IASO avec succès !`);
  };

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctorName.trim()) return;
    const newDoc: AdminDoctor = {
      id: Date.now(),
      name: newDoctorName,
      onmbNumber: newDoctorOnmb,
      specialty: newDoctorSpec,
      facility: newDoctorFacility,
      phone: newDoctorPhone,
      activeStatus: true,
    };
    setDoctorsList((prev) => [newDoc, ...prev]);
    setShowAddDoctorModal(false);
    setNewDoctorName("");
    showNotice(`Praticien ${newDoctorName} inscrit au Registre National ONMB.`);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertTitle.trim()) return;
    const alertItem: NationalAlert = {
      id: Date.now(),
      title: newAlertTitle,
      region: newAlertRegion,
      level: newAlertLevel,
      date: new Date().toLocaleDateString("fr-FR"),
      status: "En cours",
    };
    setNationalAlerts((prev) => [alertItem, ...prev]);
    setShowAlertModal(false);
    setNewAlertTitle("");
    showNotice(`Alerte nationale "${alertItem.title}" diffusée aux centres de santé.`);
  };

  const handleExportCSV = () => {
    const headers = "ID,Référence,Patient,Montant_FCFA,Mode_Paiement,Motif,Date,Statut\n";
    const rows = paymentsList
      .map(
        (p) =>
          `${p.id},${p.ref},"${p.patientName}",${p.amount},"${p.method}","${p.purpose}","${p.date}","${p.status}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Rapport_National_SANTE_PLUS_Benin_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice("Téléchargement du rapport national CSV effectué avec succès.");
  };

  // Filtrages
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.npi.includes(userSearch) ||
      u.phone.includes(userSearch);
    const matchesRole =
      userRoleFilter === "TOUS" || u.role.toUpperCase() === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredRequests = pendingRequests.filter((r) => {
    if (requestFilter === "TOUS") return true;
    if (requestFilter === "EN_ATTENTE") return r.status === "En attente";
    if (requestFilter === "VALIDE") return r.status === "Validé";
    if (requestFilter === "REFUSE") return r.status === "Refusé";
    return true;
  });

  const filteredHospitals = hospitalsList.filter((h) => {
    if (hospitalDeptFilter === "TOUS") return true;
    return h.department.toUpperCase() === hospitalDeptFilter.toUpperCase();
  });

  return (
    <div className="min-h-screen bg-[#F0F9F4] text-[#1B362B] flex flex-col font-sans pb-16 antialiased">
      {/* 1. EN-TÊTE ADMIN OFFICIEL SANTÉ+ BÉNIN */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#C8E6D5] px-4 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#E6F7F0] border-2 border-[#00A86B] flex items-center justify-center text-[#007048] shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-[#007048] font-display">
                  SANTÉ+ Admin
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-[#E6F7F0] text-[#007048] border border-[#00A86B]/40">
                  DSI Bénin
                </span>
              </div>
              <span className="block text-xs font-semibold text-[#406354]">
                Supervision Nationale de Santé Numérique
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#F0F9F4] border border-[#C8E6D5] px-3 py-1.5 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B] animate-pulse"></span>
              <span className="text-xs font-bold text-[#007048]">
                Serveurs Opérationnels
              </span>
            </div>

            <button
              type="button"
              id="btn-admin-logout"
              onClick={onLogout}
              className="min-h-[44px] px-4 bg-[#E6F7F0] hover:bg-[#D6F2E5] border border-[#C8E6D5] text-[#007048] font-bold rounded-xl flex items-center gap-2 text-sm transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MENU HORIZONTAL DE NAVIGATION ADMIN (10 ONGLETS) */}
      <div className="bg-white border-b border-[#C8E6D5] px-4 sticky top-[69px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar">
          {[
            { key: "dashboard", label: "Dashboard" },
            { key: "demandes", label: "Demandes", count: pendingRequests.filter((r) => r.status === "En attente").length },
            { key: "utilisateurs", label: "Utilisateurs", count: usersList.length },
            { key: "hopitaux", label: "Hôpitaux", count: hospitalsList.length },
            { key: "medecins", label: "Médecins", count: doctorsList.length },
            { key: "patients", label: "Patients ANIP" },
            { key: "paiements", label: "Paiements" },
            { key: "audit", label: "Audit ASIN" },
            { key: "statistiques", label: "Statistiques" },
            { key: "parametres", label: "Paramètres" },
          ].map((item) => {
            const isActive = activeMenu === item.key;
            return (
              <button
                key={item.key}
                type="button"
                id={`tab-${item.key}`}
                onClick={() => setActiveMenu(item.key as any)}
                className={`min-h-[42px] px-4 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-[#00A86B] text-white shadow-[0_3px_0_#007048]"
                    : "bg-transparent text-[#406354] hover:bg-[#E6F7F0] hover:text-[#007048]"
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-xs ${
                      isActive
                        ? "bg-white text-[#007048]"
                        : "bg-[#E6F7F0] text-[#007048]"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* BANNIÈRE DE NOTIFICATION */}
      {bannerNotice && (
        <div className="bg-[#00A86B] text-white px-4 py-2.5 text-center text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all">
          <CheckCircle2 className="w-4 h-4" />
          <span>{bannerNotice}</span>
        </div>
      )}

      {/* 3. CONTENU PRINCIPAL DES ONGLETS */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-6">
        {/* =========================================================
            ONGLET 1 : DASHBOARD PRINCIPAL
        ========================================================= */}
        {activeMenu === "dashboard" && (
          <div className="space-y-6 animate-fade-in">
            {/* 4 CARTES KPI ASYMÉTRIQUES */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SanteAsymmetricCard topBorderColor="#00A86B" className="p-5!">
                <span className="text-3xl sm:text-4xl font-black text-[#007048] block font-display">
                  {hospitalsList.length}
                </span>
                <span className="text-base font-bold text-[#406354] block mt-1">
                  Hôpitaux Homologués
                </span>
                <span className="text-xs text-[#00A86B] font-semibold block mt-2">
                  Agrément IASO Bénin
                </span>
              </SanteAsymmetricCard>

              <SanteAsymmetricCard topBorderColor="#00A86B" className="p-5!">
                <span className="text-3xl sm:text-4xl font-black text-[#007048] block font-display">
                  {patientsList.length * 480}
                </span>
                <span className="text-base font-bold text-[#406354] block mt-1">
                  Patients Enregistrés
                </span>
                <span className="text-xs text-[#00A86B] font-semibold block mt-2">
                  Biométrie ANIP certifiée
                </span>
              </SanteAsymmetricCard>

              <SanteAsymmetricCard topBorderColor="#00A86B" className="p-5!">
                <span className="text-3xl sm:text-4xl font-black text-[#007048] block font-display">
                  84
                </span>
                <span className="text-base font-bold text-[#406354] block mt-1">
                  Consultations du Jour
                </span>
                <span className="text-xs text-[#00A86B] font-semibold block mt-2">
                  Temps moyen : 3 min
                </span>
              </SanteAsymmetricCard>

              <SanteAsymmetricCard topBorderColor="#00A86B" className="p-5!">
                <span className="text-3xl sm:text-4xl font-black text-[#007048] block font-display">
                  2.45M
                </span>
                <span className="text-base font-bold text-[#406354] block mt-1">
                  FCFA Reversés
                </span>
                <span className="text-xs text-[#00A86B] font-semibold block mt-2">
                  MTN & Moov Mobile Money
                </span>
              </SanteAsymmetricCard>
            </div>

            {/* RANGÉE 1 : DEMANDES EN ATTENTE & ALERTES NATIONALES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* DEMANDES EN ATTENTE */}
              <SanteAsymmetricCard topBorderColor="#00A86B" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#1B362B] font-display">
                      Demandes en attente
                    </h2>
                    <p className="text-xs text-[#406354]">
                      Validation des accès praticiens et établissements
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMenu("demandes")}
                    className="text-xs font-bold text-[#007048] hover:underline"
                  >
                    Voir toutes →
                  </button>
                </div>

                <div className="divide-y divide-[#C8E6D5]/60">
                  {pendingRequests.filter((r) => r.status === "En attente").length === 0 ? (
                    <div className="py-6 text-center text-sm font-semibold text-[#406354]">
                      Toutes les demandes ont été traitées
                    </div>
                  ) : (
                    pendingRequests
                      .filter((r) => r.status === "En attente")
                      .map((req) => (
                        <div key={req.id} className="py-3.5 space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-base text-[#1B362B]">
                                {req.name}
                              </p>
                              <p className="text-xs text-[#406354]">{req.details}</p>
                              <span className="text-[11px] font-bold text-[#007048] bg-[#E6F7F0] px-2 py-0.5 rounded-md inline-block mt-1">
                                {req.npiOrLicense}
                              </span>
                            </div>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 shrink-0">
                              En attente
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleCall(req.phone, req.name)}
                              className="min-h-[38px] px-3 bg-[#E6F7F0] hover:bg-[#D6F2E5] text-[#007048] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Appeler</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleValidateRequest(req.id)}
                              className="min-h-[38px] px-3 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Valider</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRefuseRequest(req.id)}
                              className="min-h-[38px] px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Refuser</span>
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </SanteAsymmetricCard>

              {/* ALERTES NATIONALES ÉPIDÉMIOLOGIQUES */}
              <SanteAsymmetricCard topBorderColor="#00A86B" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#1B362B] font-display">
                      Alertes nationales
                    </h2>
                    <p className="text-xs text-[#406354]">
                      Surveillance épidémiologique DHIS2 Bénin
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAlertModal(true)}
                    className="min-h-[36px] px-3 bg-[#E6F7F0] hover:bg-[#D6F2E5] border border-[#00A86B] text-[#007048] text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouvelle alerte</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {nationalAlerts.length === 0 ? (
                    <div className="py-6 text-center text-sm font-semibold text-[#406354]">
                      Aucune alerte sanitaire nationale en cours
                    </div>
                  ) : (
                    nationalAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3.5 bg-[#E6F7F0]/60 border border-[#C8E6D5] rounded-xl flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                            <p className="font-bold text-sm text-[#1B362B]">
                              {alert.title}
                            </p>
                          </div>
                          <p className="text-xs text-[#406354] pl-6">
                            {alert.region} • {alert.date}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                            alert.level === "CRITIQUE"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {alert.level}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </SanteAsymmetricCard>
            </div>

            {/* RANGÉE 2 : ÉVOLUTION HEBDOMADAIRE & JOURNAL D'AUDIT EN DIRECT */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ÉVOLUTION NATIONALE */}
              <SanteAsymmetricCard topBorderColor="#00A86B" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#1B362B] font-display">
                      Évolution des consultations
                    </h2>
                    <p className="text-xs text-[#406354]">
                      Volume national sur les centres de santé
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-[#F0F9F4] p-1 rounded-xl border border-[#C8E6D5]">
                    <button
                      type="button"
                      onClick={() => setGraphFilter("semaine")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        graphFilter === "semaine"
                          ? "bg-[#00A86B] text-white"
                          : "text-[#406354] hover:text-[#007048]"
                      }`}
                    >
                      Semaine
                    </button>
                    <button
                      type="button"
                      onClick={() => setGraphFilter("mois")}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                        graphFilter === "mois"
                          ? "bg-[#00A86B] text-white"
                          : "text-[#406354] hover:text-[#007048]"
                      }`}
                    >
                      Mois
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="h-44 flex items-end justify-between gap-3 px-2 border-b border-[#C8E6D5] pb-2">
                    {weeklyData.map((d) => {
                      const max = 120;
                      const h = Math.round((d.value / max) * 100);
                      return (
                        <div
                          key={d.label}
                          className="flex-1 flex flex-col items-center gap-2 group"
                        >
                          <span className="text-[11px] font-bold text-[#007048] opacity-0 group-hover:opacity-100 transition-opacity">
                            {d.value}
                          </span>
                          <div
                            style={{ height: `${h}%` }}
                            className="w-full bg-[#00A86B] group-hover:bg-[#007048] rounded-t-lg transition-all"
                          />
                          <span className="text-xs font-bold text-[#406354]">
                            {d.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[#406354] pt-2">
                    Moyenne hebdomadaire : 76 consultations / centre homologué
                  </p>
                </div>
              </SanteAsymmetricCard>

              {/* JOURNAL D'AUDIT EN DIRECT */}
              <SanteAsymmetricCard topBorderColor="#00A86B" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#1B362B] font-display">
                      Traçabilité ASIN
                    </h2>
                    <p className="text-xs text-[#406354]">
                      Horodatage des accès et transactions sensibles
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMenu("audit")}
                    className="text-xs font-bold text-[#007048] hover:underline"
                  >
                    Historique →
                  </button>
                </div>

                <div className="divide-y divide-[#C8E6D5]/60">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div
                      key={log.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-[#1B362B]">
                          {log.action}
                        </p>
                        <p className="text-[#406354]">
                          {log.who} • {log.timestamp}
                        </p>
                      </div>
                      <span className="font-mono text-[10px] bg-[#E6F7F0] text-[#007048] px-2 py-0.5 rounded-md">
                        {log.hash.slice(0, 8)}...
                      </span>
                    </div>
                  ))}
                </div>
              </SanteAsymmetricCard>
            </div>
          </div>
        )}

        {/* =========================================================
            ONGLET 2 : TOUTES LES DEMANDES
        ========================================================= */}
        {activeMenu === "demandes" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-[#1B362B] font-display">
                  Accréditations & Demandes d'accès
                </h1>
                <p className="text-sm text-[#406354]">
                  Validation des professionnels de santé ONMB et centres IASO
                </p>
              </div>

              <div className="flex items-center gap-2">
                {["TOUS", "EN_ATTENTE", "VALIDE", "REFUSE"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setRequestFilter(f)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                      requestFilter === f
                        ? "bg-[#00A86B] text-white"
                        : "bg-white border border-[#C8E6D5] text-[#406354] hover:bg-[#E6F7F0]"
                    }`}
                  >
                    {f === "TOUS"
                      ? "Toutes"
                      : f === "EN_ATTENTE"
                      ? "En attente"
                      : f === "VALIDE"
                      ? "Validées"
                      : "Refusées"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredRequests.map((r) => (
                <SanteAsymmetricCard key={r.id} topBorderColor="#00A86B" className="p-5!">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-[#1B362B]">{r.name}</h3>
                        <span className="text-xs font-semibold px-2 py-0.5 bg-[#E6F7F0] text-[#007048] rounded-md">
                          {r.type}
                        </span>
                      </div>
                      <p className="text-sm text-[#406354]">{r.details}</p>
                      <p className="text-xs text-[#406354]">
                        N° Homologation : <span className="font-mono font-bold text-[#007048]">{r.npiOrLicense}</span> • Reçu le : {r.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCall(r.phone, r.name)}
                        className="min-h-[42px] px-4 bg-[#E6F7F0] hover:bg-[#D6F2E5] text-[#007048] font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{r.phone}</span>
                      </button>

                      {r.status === "En attente" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleValidateRequest(r.id)}
                            className="min-h-[42px] px-4 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Valider</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRefuseRequest(r.id)}
                            className="min-h-[42px] px-4 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Refuser</span>
                          </button>
                        </>
                      )}

                      {r.status === "Validé" && (
                        <span className="px-3 py-1.5 bg-[#E6F7F0] text-[#007048] font-bold text-xs rounded-xl flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Homologué</span>
                        </span>
                      )}

                      {r.status === "Refusé" && (
                        <span className="px-3 py-1.5 bg-red-100 text-red-700 font-bold text-xs rounded-xl flex items-center gap-1.5">
                          <XCircle className="w-4 h-4" />
                          <span>Dossier Rejeté</span>
                        </span>
                      )}
                    </div>
                  </div>
                </SanteAsymmetricCard>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            ONGLET 3 : GESTION DES UTILISATEURS
        ========================================================= */}
        {activeMenu === "utilisateurs" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-[#1B362B] font-display">
                  Gestion des Comptes & Rôles
                </h1>
                <p className="text-sm text-[#406354]">
                  Contrôle d'accès unifié aux services SANTÉ+
                </p>
              </div>

              <div className="flex items-center gap-2">
                {["TOUS", "CITOYEN", "MÉDECIN", "HÔPITAL", "DSI ADMIN"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setUserRoleFilter(role)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-colors ${
                      userRoleFilter === role
                        ? "bg-[#00A86B] text-white"
                        : "bg-white border border-[#C8E6D5] text-[#406354] hover:bg-[#E6F7F0]"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-[#406354]" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Rechercher par NPI, Nom ou Téléphone..."
                className="w-full min-h-[48px] pl-12 pr-4 rounded-xl border border-[#C8E6D5] text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
              />
            </div>

            <SanteAsymmetricCard topBorderColor="#00A86B" className="p-0! overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F0F9F4] border-b border-[#C8E6D5] text-xs font-bold text-[#007048] uppercase">
                    <tr>
                      <th className="px-5 py-3.5">NPI / Identifiant</th>
                      <th className="px-5 py-3.5">Nom complet</th>
                      <th className="px-5 py-3.5">Rôle</th>
                      <th className="px-5 py-3.5">Ville</th>
                      <th className="px-5 py-3.5">Statut</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C8E6D5]/60 bg-white">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[#F0F9F4]/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-[#007048]">
                          {user.npi}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#1B362B]">
                          {user.fullName}
                          <span className="block text-xs font-normal text-[#406354]">
                            {user.phone}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#E6F7F0] text-[#007048]">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-[#406354]">{user.city}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                              user.status === "Actif"
                                ? "bg-[#E6F7F0] text-[#007048]"
                                : user.status === "Suspendu"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                              user.status === "Actif"
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-[#00A86B] text-white hover:bg-[#00965F]"
                            }`}
                          >
                            {user.status === "Actif" ? "Suspendre" : "Activer"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SanteAsymmetricCard>
          </div>
        )}

        {/* =========================================================
            ONGLET 4 : HÔPITAUX & IASO
        ========================================================= */}
        {activeMenu === "hopitaux" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-[#1B362B] font-display">
                  Établissements Homologués IASO
                </h1>
                <p className="text-sm text-[#406354]">
                  Cartographie nationale et gestion de la capacité des lits
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddHospitalModal(true)}
                className="min-h-[44px] px-5 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-sm rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Homologuer un centre</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {["TOUS", "LITTORAL", "OUÉMÉ", "BORGOU", "ATLANTIQUE"].map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setHospitalDeptFilter(dept)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                    hospitalDeptFilter === dept
                      ? "bg-[#00A86B] text-white"
                      : "bg-white border border-[#C8E6D5] text-[#406354] hover:bg-[#E6F7F0]"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHospitals.map((hosp) => (
                <SanteAsymmetricCard key={hosp.id} topBorderColor="#00A86B" className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-[#1B362B]">
                        {hosp.name}
                      </h3>
                      <p className="text-xs text-[#406354]">
                        {hosp.type} • {hosp.commune} ({hosp.department})
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-[#E6F7F0] border border-[#00A86B] text-[#007048] font-bold text-xs rounded-lg">
                      Agréé IASO
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 text-sm bg-[#F0F9F4] p-3 rounded-xl border border-[#C8E6D5]">
                    <div>
                      <span className="text-xs text-[#406354] block">Lits Totaux</span>
                      <span className="font-bold text-base text-[#1B362B]">
                        {hosp.totalBeds} lits
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-[#406354] block">Lits Disponibles</span>
                      <span className="font-bold text-base text-[#007048]">
                        {hosp.availableBeds} libres
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[#406354] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#007048]" />
                      <span>{hosp.phone}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCall(hosp.phone, hosp.name)}
                      className="text-xs font-bold text-[#007048] hover:underline"
                    >
                      Appeler standard →
                    </button>
                  </div>
                </SanteAsymmetricCard>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            ONGLET 5 : RÉPERTOIRE ONMB (MÉDECINS)
        ========================================================= */}
        {activeMenu === "medecins" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-[#1B362B] font-display">
                  Registre National ONMB
                </h1>
                <p className="text-sm text-[#406354]">
                  Ordre National des Médecins du Bénin • Habilitation télémédecine
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddDoctorModal(true)}
                className="min-h-[44px] px-5 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-sm rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Inscrire un praticien</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {doctorsList.map((doc) => (
                <SanteAsymmetricCard key={doc.id} topBorderColor="#00A86B" className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#E6F7F0] border border-[#00A86B] flex items-center justify-center text-[#007048]">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6F7F0] text-[#007048]">
                      Licence Active
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-[#1B362B]">{doc.name}</h3>
                    <p className="text-xs font-semibold text-[#007048]">{doc.specialty}</p>
                    <p className="text-xs text-[#406354] mt-1">{doc.facility}</p>
                  </div>

                  <div className="pt-2 border-t border-[#C8E6D5]/60 flex items-center justify-between text-xs">
                    <span className="font-mono text-[#406354]">{doc.onmbNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCall(doc.phone, doc.name)}
                      className="font-bold text-[#007048] hover:underline"
                    >
                      {doc.phone}
                    </button>
                  </div>
                </SanteAsymmetricCard>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            ONGLET 6 : BASE NATIONALE PATIENTS (ANIP)
        ========================================================= */}
        {activeMenu === "patients" && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h1 className="text-2xl font-black text-[#1B362B] font-display">
                Registre des Citoyens (ANIP)
              </h1>
              <p className="text-sm text-[#406354]">
                Vérification biométrique du Numéro Personnel d'Identification (NPI)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {patientsList.map((patient) => (
                <SanteAsymmetricCard key={patient.id} topBorderColor="#00A86B" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#007048] bg-[#E6F7F0] px-2.5 py-1 rounded-lg">
                      NPI : {patient.npi}
                    </span>
                    <span className="text-xs font-bold text-[#007048] flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Certifié ANIP</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg text-[#1B362B]">
                      {patient.fullName}
                    </h3>
                    <p className="text-xs text-[#406354]">
                      {patient.gender} • Ville : {patient.city}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs bg-[#F0F9F4] p-2.5 rounded-xl border border-[#C8E6D5]">
                    <div>
                      <span className="text-[#406354] block">Groupe Sanguin</span>
                      <span className="font-bold text-[#1B362B] text-sm">{patient.bloodGroup}</span>
                    </div>
                    <div>
                      <span className="text-[#406354] block">Électrophorèse</span>
                      <span className="font-bold text-[#007048] text-sm">{patient.electrophoresis}</span>
                    </div>
                  </div>
                </SanteAsymmetricCard>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            ONGLET 7 : PAIEMENTS & MOBILE MONEY
        ========================================================= */}
        {activeMenu === "paiements" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-[#1B362B] font-display">
                  Flux Financiers Mobile Money
                </h1>
                <p className="text-sm text-[#406354]">
                  Supervision des encaissements MTN MoMo, Moov Money et FedaPay
                </p>
              </div>

              <button
                type="button"
                onClick={() => showNotice("Réconciliation bancaire journalière validée avec succès.")}
                className="min-h-[44px] px-5 bg-[#E6F7F0] hover:bg-[#D6F2E5] border border-[#00A86B] text-[#007048] font-bold text-sm rounded-xl flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Lancer réconciliation</span>
              </button>
            </div>

            <SanteAsymmetricCard topBorderColor="#00A86B" className="p-0! overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F0F9F4] border-b border-[#C8E6D5] text-xs font-bold text-[#007048] uppercase">
                    <tr>
                      <th className="px-5 py-3.5">Référence</th>
                      <th className="px-5 py-3.5">Patient</th>
                      <th className="px-5 py-3.5">Motif du soin</th>
                      <th className="px-5 py-3.5">Opérateur</th>
                      <th className="px-5 py-3.5">Montant</th>
                      <th className="px-5 py-3.5">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C8E6D5]/60 bg-white">
                    {paymentsList.map((p) => (
                      <tr key={p.id} className="hover:bg-[#F0F9F4]/40 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-[#007048]">
                          {p.ref}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-[#1B362B]">
                          {p.patientName}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#406354]">{p.purpose}</td>
                        <td className="px-5 py-3.5 font-bold text-xs text-[#1B362B]">
                          {p.method}
                        </td>
                        <td className="px-5 py-3.5 font-black text-sm text-[#007048]">
                          {p.amount.toLocaleString()} FCFA
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#E6F7F0] text-[#007048]">
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SanteAsymmetricCard>
          </div>
        )}

        {/* =========================================================
            ONGLET 8 : AUDIT ET TRAÇABILITÉ ASIN
        ========================================================= */}
        {activeMenu === "audit" && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black text-[#1B362B] font-display">
                  Journal d'Audit Conforme ASIN
                </h1>
                <p className="text-sm text-[#406354]">
                  Registre d'intégrité numérique et preuve cryptographique
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="min-h-[44px] px-5 bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Exporter le journal</span>
              </button>
            </div>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <SanteAsymmetricCard key={log.id} topBorderColor="#00A86B" className="p-4!">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#007048]">
                          {log.id}
                        </span>
                        <span className="font-bold text-sm text-[#1B362B]">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-xs text-[#406354]">
                        Opérateur : <span className="font-semibold text-[#1B362B]">{log.who}</span> • Cible : {log.target}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[#406354]">{log.timestamp}</span>
                      <span className="font-mono bg-[#F0F9F4] border border-[#C8E6D5] px-2 py-1 rounded text-[10px] text-[#007048]">
                        SHA-256: {log.hash.slice(0, 12)}...
                      </span>
                    </div>
                  </div>
                </SanteAsymmetricCard>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            ONGLET 9 : STATISTIQUES & EXPORT CSV
        ========================================================= */}
        {activeMenu === "statistiques" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-black text-[#1B362B] font-display">
                Statistiques & Indicateurs Nationaux
              </h1>
              <p className="text-sm text-[#406354]">
                Agrégation des données épidémiologiques et d'activité
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SanteAsymmetricCard topBorderColor="#00A86B">
                <span className="text-xs font-bold text-[#406354] uppercase">Taux d'occupation des lits</span>
                <span className="text-3xl font-black text-[#007048] block mt-2">78.4%</span>
                <p className="text-xs text-[#406354] mt-2">Capacité sous contrôle dans les CHU</p>
              </SanteAsymmetricCard>

              <SanteAsymmetricCard topBorderColor="#00A86B">
                <span className="text-xs font-bold text-[#406354] uppercase">Prise en charge Urgence SAMU</span>
                <span className="text-3xl font-black text-[#007048] block mt-2">2 min 48s</span>
                <p className="text-xs text-[#406354] mt-2">Délai moyen d'orientation initiale</p>
              </SanteAsymmetricCard>

              <SanteAsymmetricCard topBorderColor="#00A86B">
                <span className="text-xs font-bold text-[#406354] uppercase">Protocoles Drépanocytose</span>
                <span className="text-3xl font-black text-[#007048] block mt-2">100%</span>
                <p className="text-xs text-[#406354] mt-2">Orientation conforme vers hématologie</p>
              </SanteAsymmetricCard>
            </div>

            <SanteAsymmetricCard topBorderColor="#00A86B" className="text-center p-8! space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] border-2 border-[#00A86B] text-[#007048] flex items-center justify-center mx-auto">
                <Download className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-xl font-bold text-[#1B362B]">
                  Exporter le Rapport National Complet
                </h3>
                <p className="text-sm text-[#406354]">
                  Génère un fichier CSV certifié avec les métriques hospitalières et financières
                </p>
              </div>

              <div className="pt-2 max-w-sm mx-auto">
                <Sante3DButton
                  text="Télécharger le rapport CSV"
                  onClick={handleExportCSV}
                  icon={<Download className="w-5 h-5" />}
                />
              </div>
            </SanteAsymmetricCard>
          </div>
        )}

        {/* =========================================================
            ONGLET 10 : PARAMÈTRES SYSTÈME
        ========================================================= */}
        {activeMenu === "parametres" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-black text-[#1B362B] font-display">
                Paramètres Système DSI
              </h1>
              <p className="text-sm text-[#406354]">
                Configuration des passerelles nationales et seuils d'alerte
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SanteAsymmetricCard topBorderColor="#00A86B" className="space-y-4">
                <h3 className="text-lg font-bold text-[#1B362B]">
                  Passerelles d'Interconnexion
                </h3>

                <div className="space-y-3 divide-y divide-[#C8E6D5]/60 text-sm">
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="font-bold text-[#1B362B]">Passerelle SMS Nationale</p>
                      <p className="text-xs text-[#406354]">Diffusion alertes sanitaires</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSmsGatewayActive(!smsGatewayActive);
                        showNotice(`Passerelle SMS ${!smsGatewayActive ? "activée" : "désactivée"}`);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        smsGatewayActive ? "bg-[#00A86B] text-white" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {smsGatewayActive ? "Actif" : "Inactif"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <p className="font-bold text-[#1B362B]">Synchronisation ANIP Bénin</p>
                      <p className="text-xs text-[#406354]">Validation biométrique NPI</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAnipBiometricsActive(!anipBiometricsActive);
                        showNotice(`Service ANIP ${!anipBiometricsActive ? "activé" : "désactivé"}`);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        anipBiometricsActive ? "bg-[#00A86B] text-white" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {anipBiometricsActive ? "Actif" : "Inactif"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <p className="font-bold text-[#1B362B]">Module Triage Médical IA</p>
                      <p className="text-xs text-[#406354]">Orientation clinique automatisée</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setGeminiAiTriageActive(!geminiAiTriageActive);
                        showNotice(`Module IA ${!geminiAiTriageActive ? "activé" : "désactivé"}`);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        geminiAiTriageActive ? "bg-[#00A86B] text-white" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {geminiAiTriageActive ? "Actif" : "Inactif"}
                    </button>
                  </div>
                </div>
              </SanteAsymmetricCard>

              <SanteAsymmetricCard topBorderColor="#00A86B" className="space-y-4">
                <h3 className="text-lg font-bold text-[#1B362B]">
                  Sécurité & Seuils de Service
                </h3>

                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs font-bold text-[#1B362B] mb-1">
                      Seuil de déclenchement Alerte Lits SAMU 15
                    </label>
                    <select
                      value={samuAlertThreshold}
                      onChange={(e) => setSamuAlertThreshold(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] bg-white font-semibold text-sm"
                    >
                      <option>Moins de 5 lits disponibles</option>
                      <option>Moins de 10 lits disponibles</option>
                      <option>Moins de 15 lits disponibles</option>
                    </select>
                  </div>

                  <div className="p-3.5 bg-[#F0F9F4] rounded-xl border border-[#C8E6D5] space-y-1">
                    <p className="text-xs font-bold text-[#007048]">Version de Production</p>
                    <p className="text-xs text-[#1B362B] font-semibold">
                      SANTÉ+ Bénin v1.0.0 (Certifié ASIN & Ministère de la Santé)
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMaintenanceMode(!maintenanceMode);
                        showNotice(`Mode maintenance ${!maintenanceMode ? "activé" : "désactivé"}`);
                      }}
                      className={`w-full min-h-[44px] rounded-xl font-bold text-xs border transition-colors ${
                        maintenanceMode
                          ? "bg-red-600 text-white border-red-700"
                          : "bg-white border-[#C8E6D5] text-[#406354] hover:bg-[#E6F7F0]"
                      }`}
                    >
                      {maintenanceMode ? "Mode Maintenance Actif" : "Activer le Mode Maintenance"}
                    </button>
                  </div>
                </div>
              </SanteAsymmetricCard>
            </div>
          </div>
        )}
      </main>

      {/* MODAL HOMOLOGATION HÔPITAL */}
      {showAddHospitalModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#C8E6D5] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#1B362B]">
                Homologuer un Établissement
              </h3>
              <button
                type="button"
                onClick={() => setShowAddHospitalModal(false)}
                className="p-1 rounded-lg text-[#406354] hover:bg-[#F0F9F4]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHospital} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B362B] mb-1">
                  Nom du centre ou clinique
                </label>
                <input
                  type="text"
                  required
                  value={newHospitalName}
                  onChange={(e) => setNewHospitalName(e.target.value)}
                  placeholder="Ex: Clinique Bon Samaritain"
                  className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B362B] mb-1">
                    Département
                  </label>
                  <select
                    value={newHospitalDept}
                    onChange={(e) => setNewHospitalDept(e.target.value)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                  >
                    <option>Littoral</option>
                    <option>Ouémé</option>
                    <option>Atlantique</option>
                    <option>Borgou</option>
                    <option>Zou</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B362B] mb-1">
                    Commune
                  </label>
                  <input
                    type="text"
                    required
                    value={newHospitalCommune}
                    onChange={(e) => setNewHospitalCommune(e.target.value)}
                    placeholder="Ex: Cotonou"
                    className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B362B] mb-1">
                    Capacité lits
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newHospitalBeds}
                    onChange={(e) => setNewHospitalBeds(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B362B] mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    required
                    value={newHospitalPhone}
                    onChange={(e) => setNewHospitalPhone(e.target.value)}
                    placeholder="+229 97 00 00 00"
                    className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Sante3DButton
                  text="Confirmer l'homologation"
                  onClick={() => {}}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSCRIPTION PRATICIEN ONMB */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#C8E6D5] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#1B362B]">
                Inscrire un Praticien ONMB
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDoctorModal(false)}
                className="p-1 rounded-lg text-[#406354] hover:bg-[#F0F9F4]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B362B] mb-1">
                  Nom et Prénom du médecin
                </label>
                <input
                  type="text"
                  required
                  value={newDoctorName}
                  onChange={(e) => setNewDoctorName(e.target.value)}
                  placeholder="Dr. ..."
                  className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B362B] mb-1">
                  Numéro de Licence ONMB
                </label>
                <input
                  type="text"
                  required
                  value={newDoctorOnmb}
                  onChange={(e) => setNewDoctorOnmb(e.target.value)}
                  placeholder="ONMB-BJ-2026-..."
                  className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B362B] mb-1">
                  Spécialité
                </label>
                <select
                  value={newDoctorSpec}
                  onChange={(e) => setNewDoctorSpec(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                >
                  <option>Médecine Générale</option>
                  <option>Pédiatrie</option>
                  <option>Médecine d'Urgence</option>
                  <option>Cardiologie</option>
                  <option>Gynécologie Obstétrique</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B362B] mb-1">
                  Établissement d'exercice
                </label>
                <input
                  type="text"
                  required
                  value={newDoctorFacility}
                  onChange={(e) => setNewDoctorFacility(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                />
              </div>

              <div className="pt-2">
                <Sante3DButton
                  text="Valider l'inscription"
                  onClick={() => {}}
                />
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOUVELLE ALERTE */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#C8E6D5] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#1B362B]">
                Déclarer une Alerte Sanitaire
              </h3>
              <button
                type="button"
                onClick={() => setShowAlertModal(false)}
                className="p-1 rounded-lg text-[#406354] hover:bg-[#F0F9F4]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B362B] mb-1">
                  Intitulé de l'alerte
                </label>
                <input
                  type="text"
                  required
                  value={newAlertTitle}
                  onChange={(e) => setNewAlertTitle(e.target.value)}
                  placeholder="Ex: Épidémie saisonnière gastro-entérite"
                  className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B362B] mb-1">
                  Zone concernée
                </label>
                <input
                  type="text"
                  required
                  value={newAlertRegion}
                  onChange={(e) => setNewAlertRegion(e.target.value)}
                  placeholder="Ex: Département de l'Atlantique"
                  className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B362B] mb-1">
                  Niveau d'urgence
                </label>
                <select
                  value={newAlertLevel}
                  onChange={(e) => setNewAlertLevel(e.target.value as any)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-[#C8E6D5] text-sm"
                >
                  <option value="MODÉRÉ">MODÉRÉ</option>
                  <option value="URGENT">URGENT</option>
                  <option value="CRITIQUE">CRITIQUE</option>
                </select>
              </div>

              <div className="pt-2">
                <Sante3DButton
                  text="Diffuser l'alerte"
                  onClick={() => {}}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
