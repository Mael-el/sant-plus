// Page officielle "Hôpitaux du Bénin"
// Liste complète des 66+ hôpitaux réels du Bénin, carte interactive Leaflet + OpenStreetMap, boutons d'appel direct, recherche et filtres multi-critères

import React, { useState, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import {
  Building2,
  Search,
  MapPin,
  Phone,
  Navigation,
  Crosshair,
  ShieldCheck,
  Droplet,
  Compass,
  Bed,
  Layers,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";
import { REAL_BENIN_HOSPITALS } from "../../server/beninHealthData";

export interface BeninHospital {
  id: string;
  name: string;
  type: "national" | "department" | "zone" | "private" | "clinic";
  address: string;
  city: string;
  department: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  specialties: string[];
  has_emergency: boolean;
  has_blood_bank: boolean;
  capacity: number;
  distance_km?: number | null;
}

interface HospitalsScreenProps {
  onSelectHospitalForAppointment?: (hospital: BeninHospital) => void;
}

export const HospitalsScreen: React.FC<HospitalsScreenProps> = ({
  onSelectHospitalForAppointment,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [hospitals, setHospitals] = useState<BeninHospital[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Tous");
  const [selectedType, setSelectedType] = useState<"Tous" | "national" | "department" | "zone" | "private" | "clinic">("Tous");
  const [selectedSpecialty, setSelectedSpecialty] = useState("Tous");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [bloodBankOnly, setBloodBankOnly] = useState(false);

  // Géolocalisation
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Hôpital actif pour fiche détaillée latérale
  const [selectedHospital, setSelectedHospital] = useState<BeninHospital | null>(null);
  const [activeView, setActiveView] = useState<"map_and_list" | "list_only">("map_and_list");

  // Villes principales du Bénin
  const cities = [
    "Tous",
    "Cotonou",
    "Abomey-Calavi",
    "Porto-Novo",
    "Parakou",
    "Abomey",
    "Bohicon",
    "Natitingou",
    "Djougou",
    "Lokossa",
    "Ouidah",
    "Kandi",
    "Dassa-Zoumé",
    "Aplahoué",
    "Allada",
  ];

  // Spécialités médicales majeures
  const specialtiesList = [
    "Tous",
    "Urgences",
    "Chirurgie",
    "Cardiologie",
    "Pédiatrie",
    "Gynécologie",
    "Psychiatrie",
    "Pneumologie",
    "Ophtalmologie",
    "Maternité",
  ];

  // Calcul de la distance Haversine en kilomètres
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Chargement initial des hôpitaux
  useEffect(() => {
    async function fetchHospitals() {
      setLoading(true);
      try {
        const res = await fetch("/api/hospitals");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.hospitals) && data.hospitals.length > 0) {
            setHospitals(data.hospitals);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback sur les données complètes de référence
      }

      // Fallback local certifié
      setHospitals(
        REAL_BENIN_HOSPITALS.map((h) => ({
          ...h,
          distance_km: null,
        }))
      );
      setLoading(false);
    }

    fetchHospitals();
  }, []);

  // Recalcul des distances dès que l'utilisateur est géolocalisé
  useEffect(() => {
    if (!userCoords) return;
    setHospitals((prev) =>
      prev.map((h) => ({
        ...h,
        distance_km: calculateDistance(userCoords.lat, userCoords.lng, h.latitude, h.longitude),
      }))
    );
  }, [userCoords]);

  // Initialisation de la carte Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centrage sur le Bénin (centre géographique Cotonou / Bohicon / Parakou)
    const map = L.map(mapContainerRef.current, {
      center: [7.85, 2.35],
      zoom: 7,
      zoomControl: true,
      minZoom: 6,
      maxZoom: 18,
    });

    // Tuiles OpenStreetMap CartoDB Positron / OSM Standard
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors • SANTÉ+ Bénin',
      maxZoom: 19,
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Déclencher la géolocalisation
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserCoords(coords);
        setIsLocating(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([coords.lat, coords.lng], 12);

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([coords.lat, coords.lng]);
          } else {
            const userIcon = L.divIcon({
              className: "custom-user-marker",
              html: `
                <div style="position: relative; width: 28px; height: 28px;">
                  <div style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(0, 168, 107, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                  <div style="position: absolute; inset: 4px; border-radius: 9999px; background: #007048; border: 3px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"></div>
                </div>
              `,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            });

            userMarkerRef.current = L.marker([coords.lat, coords.lng], {
              icon: userIcon,
              title: "Votre position",
            })
              .addTo(mapInstanceRef.current)
              .bindPopup("<strong>Vous êtes ici</strong>");
          }
        }
      },
      () => {
        setIsLocating(false);
        alert("Impossible de récupérer votre position GPS. Veuillez autoriser la géolocalisation.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Filtrage des hôpitaux
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      // Recherche textuelle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = h.name.toLowerCase().includes(q);
        const matchCity = h.city.toLowerCase().includes(q);
        const matchDept = h.department.toLowerCase().includes(q);
        const matchSpecialty = h.specialties.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchCity && !matchDept && !matchSpecialty) {
          return false;
        }
      }

      // Filtre Ville
      if (selectedCity !== "Tous" && h.city !== selectedCity) {
        return false;
      }

      // Filtre Type
      if (selectedType !== "Tous" && h.type !== selectedType) {
        return false;
      }

      // Filtre Spécialité
      if (selectedSpecialty !== "Tous") {
        const hasSpec = h.specialties.some((s) =>
          s.toLowerCase().includes(selectedSpecialty.toLowerCase())
        );
        if (!hasSpec) return false;
      }

      // Filtre Urgences
      if (emergencyOnly && !h.has_emergency) {
        return false;
      }

      // Filtre Banque de sang
      if (bloodBankOnly && !h.has_blood_bank) {
        return false;
      }

      return true;
    });
  }, [
    hospitals,
    searchQuery,
    selectedCity,
    selectedType,
    selectedSpecialty,
    emergencyOnly,
    bloodBankOnly,
  ]);

  // Hôpitaux triés par distance si position connue
  const sortedHospitals = useMemo(() => {
    return [...filteredHospitals].sort((a, b) => {
      if (a.distance_km != null && b.distance_km != null) {
        return a.distance_km - b.distance_km;
      }
      return a.name.localeCompare(b.name);
    });
  }, [filteredHospitals]);

  // Mise à jour des marqueurs sur la carte
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    filteredHospitals.forEach((h) => {
      // Marqueur stylisé SVG sans émoji
      const isNational = h.type === "national";
      const isDepartment = h.type === "department";
      const isPrivate = h.type === "private" || h.type === "clinic";

      const bgCol = isNational
        ? "#007048"
        : isDepartment
        ? "#00A86B"
        : isPrivate
        ? "#0284C7"
        : "#059669";

      const labelType = isNational
        ? "CHU / Hôpital National"
        : isDepartment
        ? "Centre Hospitalier Départemental (CHD)"
        : isPrivate
        ? "Clinique / Privé"
        : "Hôpital de Zone";

      const svgIconHtml = `
        <div style="background-color: ${bgCol}; color: white; border-radius: 9999px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); cursor: pointer; transition: transform 0.15s;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 18h12"></path>
            <path d="M6 14h12"></path>
            <rect width="16" height="20" x="4" y="2" rx="2"></rect>
            <path d="M9 7h6"></path>
            <path d="M12 4v6"></path>
          </svg>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-hospital-marker",
        html: svgIconHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([h.latitude, h.longitude], { icon: customIcon });

      // Contenu du Popup interactif
      const phoneClean = h.phone ? h.phone.replace(/\s+/g, "") : "";
      const popupHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-width: 250px; padding: 4px;">
          <span style="font-size: 10px; font-weight: 800; color: ${bgCol}; text-transform: uppercase; letter-spacing: 0.5px;">
            ${labelType}
          </span>
          <h4 style="font-size: 15px; font-weight: 800; color: #1B362B; margin: 4px 0 6px 0; line-height: 1.25;">
            ${h.name}
          </h4>
          <p style="font-size: 12px; color: #406354; margin: 0 0 8px 0;">
            ${h.address}, ${h.city} (${h.department})
          </p>

          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
            ${
              h.has_emergency
                ? `<span style="background: #FEE2E2; color: #DC2626; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">URGENCES 24/7</span>`
                : ""
            }
            ${
              h.has_blood_bank
                ? `<span style="background: #E6F7F0; color: #007048; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px;">BANQUE DE SANG</span>`
                : ""
            }
          </div>

          <div style="display: flex; gap: 8px;">
            <a href="tel:${phoneClean}" style="flex: 1; background: #00A86B; color: white; text-decoration: none; padding: 8px 10px; border-radius: 8px; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.15);">
              Appeler
            </a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}" target="_blank" rel="noopener noreferrer" style="flex: 1; background: #E6F7F0; color: #007048; text-decoration: none; border: 1px solid #00A86B; padding: 8px 10px; border-radius: 8px; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 4px;">
              Itinéraire
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on("click", () => {
        setSelectedHospital(h);
      });

      markersGroup.addLayer(marker);
    });
  }, [filteredHospitals]);

  // Centrer sur un hôpital sélectionné
  const handleSelectHospital = (h: BeninHospital) => {
    setSelectedHospital(h);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([h.latitude, h.longitude], 14, {
        animate: true,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* En-tête Page Hôpitaux du Bénin */}
      <div className="bg-white border-2 border-[#00A86B] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F7F0] border-2 border-[#00A86B] text-[#007048] flex items-center justify-center shrink-0">
            <Building2 className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#00A86B] uppercase tracking-wider">
                RÉSEAU NATIONAL DE SANTÉ
              </span>
              <span className="text-xs font-extrabold bg-[#E6F7F0] text-[#007048] px-2.5 py-0.5 rounded-full border border-[#C8E6D5]">
                {filteredHospitals.length} hôpitaux trouvés
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B362B] font-display">
              Hôpitaux du Bénin
            </h1>
            <p className="text-sm text-[#406354]">
              Carte interactive officielle, coordonnées directes, urgences 24/7 et itinéraires
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGeolocate}
          disabled={isLocating}
          className="min-h-[56px] px-5 bg-[#E6F7F0] hover:bg-[#D6F2E5] border-2 border-[#00A86B] text-[#007048] font-bold text-base rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-98 shrink-0"
        >
          <Crosshair className={`w-5 h-5 ${isLocating ? "animate-spin" : ""}`} />
          <span>{isLocating ? "Localisation..." : "Autour de moi"}</span>
        </button>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="bg-white border border-[#C8E6D5] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Recherche textuelle */}
        <div className="relative">
          <Search className="w-6 h-6 text-[#688A7C] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom (ex: CNHU, Parakou, Saint Michel, Cardiologie)..."
            className="w-full min-h-[56px] pl-12 pr-4 rounded-xl border-2 border-[#C8E6D5] focus:border-[#00A86B] bg-[#F4FAF7] text-base text-[#1B362B] font-medium outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#688A7C] hover:text-[#1B362B]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Ligne des sélecteurs : Ville, Type, Spécialité */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Filtre Ville */}
          <div>
            <label className="block text-xs font-bold text-[#688A7C] mb-1 uppercase">
              Ville
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full min-h-[48px] px-3 rounded-xl border border-[#C8E6D5] bg-white text-sm font-semibold text-[#1B362B] focus:border-[#00A86B] outline-none"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c === "Tous" ? "Toutes les villes" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Type d'établissement */}
          <div>
            <label className="block text-xs font-bold text-[#688A7C] mb-1 uppercase">
              Type d'hôpital
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full min-h-[48px] px-3 rounded-xl border border-[#C8E6D5] bg-white text-sm font-semibold text-[#1B362B] focus:border-[#00A86B] outline-none"
            >
              <option value="Tous">Tous les types</option>
              <option value="national">Nationaux & Universitaires (CHU)</option>
              <option value="department">Départementaux (CHD)</option>
              <option value="zone">Hôpitaux de Zone</option>
              <option value="private">Cliniques privées</option>
            </select>
          </div>

          {/* Filtre Spécialité */}
          <div>
            <label className="block text-xs font-bold text-[#688A7C] mb-1 uppercase">
              Spécialité
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full min-h-[48px] px-3 rounded-xl border border-[#C8E6D5] bg-white text-sm font-semibold text-[#1B362B] focus:border-[#00A86B] outline-none"
            >
              {specialtiesList.map((s) => (
                <option key={s} value={s}>
                  {s === "Tous" ? "Toutes spécialités" : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Boutons d'activation rapide : Urgences & Banque de sang */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setEmergencyOnly(!emergencyOnly)}
            className={`min-h-[44px] px-4 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${
              emergencyOnly
                ? "bg-[#FEE2E2] border-[#DC2626] text-[#DC2626]"
                : "bg-white border-[#C8E6D5] text-[#406354] hover:border-[#DC2626]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Urgences 24/7 uniquement</span>
          </button>

          <button
            type="button"
            onClick={() => setBloodBankOnly(!bloodBankOnly)}
            className={`min-h-[44px] px-4 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${
              bloodBankOnly
                ? "bg-[#E6F7F0] border-[#00A86B] text-[#007048]"
                : "bg-white border-[#C8E6D5] text-[#406354] hover:border-[#00A86B]"
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>Banque de sang uniquement</span>
          </button>
        </div>
      </div>

      {/* Carte interactive et liste divisée */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Conteneur de la Carte Leaflet */}
        <div className="lg:col-span-7 bg-white border-2 border-[#00A86B] rounded-2xl overflow-hidden shadow-xs h-[420px] lg:h-[620px] relative">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Badge informatif en surimpression */}
          <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#C8E6D5] text-xs font-bold text-[#007048] shadow-xs flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#00A86B]" />
            <span>Carte interactive Leaflet • Bénin</span>
          </div>
        </div>

        {/* Liste des hôpitaux triés et filtrés */}
        <div className="lg:col-span-5 flex flex-col h-[620px]">
          <div className="bg-white border border-[#C8E6D5] rounded-2xl p-4 mb-3 shadow-xs flex items-center justify-between">
            <span className="font-extrabold text-sm text-[#007048] uppercase">
              RÉPERTOIRE DES HÔPITAUX ({sortedHospitals.length})
            </span>
            <span className="text-xs text-[#688A7C]">Cliquez pour localiser</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {loading ? (
              <div className="p-8 text-center text-[#406354]">
                Chargement des hôpitaux du Bénin...
              </div>
            ) : sortedHospitals.length === 0 ? (
              <div className="p-8 bg-white border border-[#C8E6D5] rounded-2xl text-center text-[#406354]">
                Aucun hôpital ne correspond à vos critères de recherche.
              </div>
            ) : (
              sortedHospitals.map((h) => {
                const isSelected = selectedHospital?.id === h.id;
                const phoneClean = h.phone ? h.phone.replace(/\s+/g, "") : "";

                return (
                  <div
                    key={h.id}
                    onClick={() => handleSelectHospital(h)}
                    className={`bg-white border-2 rounded-2xl p-4 cursor-pointer transition-all shadow-xs ${
                      isSelected
                        ? "border-[#00A86B] bg-[#F4FAF7] shadow-sm"
                        : "border-[#C8E6D5] hover:border-[#00A86B]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide bg-[#E6F7F0] text-[#007048] inline-block mb-1">
                          {h.type === "national"
                            ? "CHU National"
                            : h.type === "department"
                            ? "CHD Département"
                            : h.type === "private"
                            ? "Clinique privée"
                            : "Hôpital de Zone"}
                        </span>
                        <h3 className="font-extrabold text-base text-[#1B362B] leading-tight">
                          {h.name}
                        </h3>
                        <p className="text-xs text-[#406354] mt-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#00A86B] shrink-0" />
                          <span>{h.address}, {h.city}</span>
                        </p>
                      </div>

                      {h.distance_km != null && (
                        <span className="text-xs font-black text-[#007048] bg-[#E6F7F0] px-2 py-1 rounded-lg shrink-0">
                          {h.distance_km} km
                        </span>
                      )}
                    </div>

                    {/* Badges Urgences et Banque de sang */}
                    <div className="flex items-center gap-2 mt-2.5">
                      {h.has_emergency && (
                        <span className="text-[10px] font-extrabold bg-[#FEE2E2] text-[#DC2626] px-2 py-0.5 rounded-full">
                          Urgences 24/7
                        </span>
                      )}
                      {h.has_blood_bank && (
                        <span className="text-[10px] font-extrabold bg-[#E6F7F0] text-[#007048] px-2 py-0.5 rounded-full">
                          Banque de sang
                        </span>
                      )}
                    </div>

                    {/* Bouton d'Appel Direct & Itinéraire */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#E2F0E8]">
                      <a
                        href={`tel:${phoneClean}`}
                        onClick={(e) => e.stopPropagation()}
                        className="min-h-[48px] bg-[#00A86B] hover:bg-[#00965F] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Appeler</span>
                      </a>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="min-h-[48px] bg-[#E6F7F0] hover:bg-[#D6F2E5] border border-[#00A86B] text-[#007048] text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Itinéraire</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
