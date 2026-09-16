// Carte interactive officielle de localisation des Hôpitaux et Pharmacies du Bénin
// Leaflet + OpenStreetMap avec géolocalisation, filtres, recherche et calcul d'itinéraire

import React, { useState, useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import {
  Search,
  MapPin,
  Phone,
  Navigation,
  Crosshair,
  Building2,
  Pill,
  ShieldCheck,
  Clock,
  Droplet,
  ExternalLink,
  ChevronRight,
  List,
  Map as MapIcon,
  X,
  Compass,
} from "lucide-react";

export interface HospitalItem {
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

export interface PharmacyItem {
  id: string;
  name: string;
  address: string;
  city: string;
  department: string;
  latitude: number;
  longitude: number;
  phone: string;
  is_on_duty: boolean;
  duty_start_date?: string;
  duty_end_date?: string;
  distance_km?: number | null;
}

interface BeninHealthMapProps {
  initialFilter?: "all" | "hospitals" | "pharmacies" | "duty";
  onSelectFacility?: (facility: HospitalItem | PharmacyItem) => void;
}

export const BeninHealthMap: React.FC<BeninHealthMapProps> = ({
  initialFilter = "all",
  onSelectFacility,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [pharmacies, setPharmacies] = useState<PharmacyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtres
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "hospitals" | "pharmacies">(
    initialFilter === "pharmacies" ? "pharmacies" : initialFilter === "hospitals" ? "hospitals" : "all"
  );
  const [dutyOnly, setDutyOnly] = useState(initialFilter === "duty");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Tous");

  // Géolocalisation utilisateur
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locatingUser, setLocatingUser] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Sélection active pour fiche détail
  const [activeFacility, setActiveFacility] = useState<HospitalItem | PharmacyItem | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  // Villes disponibles au Bénin
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
    "Savalou",
  ];

  // Chargement des données depuis l'API REST SQLite
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [hospRes, pharmRes] = await Promise.all([
          fetch("/api/hospitals"),
          fetch("/api/pharmacies"),
        ]);
        const hospJson = await hospRes.json();
        const pharmJson = await pharmRes.json();

        if (hospJson.success && Array.isArray(hospJson.hospitals)) {
          setHospitals(hospJson.hospitals);
        }
        if (pharmJson.success && Array.isArray(pharmJson.pharmacies)) {
          setPharmacies(pharmJson.pharmacies);
        }
      } catch (err) {
        console.error("Erreur de chargement des établissements de santé:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calcul de la distance si l'utilisateur est géolocalisé
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Filtrage combiné
  const filteredFacilities = useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim();

    let hospList: (HospitalItem & { facilityType: "hospital" })[] = [];
    let pharmList: (PharmacyItem & { facilityType: "pharmacy" })[] = [];

    if (categoryFilter === "all" || categoryFilter === "hospitals") {
      hospList = hospitals
        .filter((h) => {
          const matchCity = selectedCity === "Tous" || h.city.toLowerCase() === selectedCity.toLowerCase();
          const matchEmergency = !emergencyOnly || h.has_emergency;
          const matchSearch =
            !searchLower ||
            h.name.toLowerCase().includes(searchLower) ||
            h.city.toLowerCase().includes(searchLower) ||
            h.address.toLowerCase().includes(searchLower) ||
            h.specialties.some((s) => s.toLowerCase().includes(searchLower));
          return matchCity && matchEmergency && matchSearch && !dutyOnly;
        })
        .map((h) => ({
          ...h,
          facilityType: "hospital" as const,
          distance_km: userCoords
            ? calculateDistance(userCoords.lat, userCoords.lng, h.latitude, h.longitude)
            : h.distance_km,
        }));
    }

    if (categoryFilter === "all" || categoryFilter === "pharmacies" || dutyOnly) {
      pharmList = pharmacies
        .filter((p) => {
          const matchCity = selectedCity === "Tous" || p.city.toLowerCase() === selectedCity.toLowerCase();
          const matchDuty = !dutyOnly || p.is_on_duty;
          const matchSearch =
            !searchLower ||
            p.name.toLowerCase().includes(searchLower) ||
            p.city.toLowerCase().includes(searchLower) ||
            p.address.toLowerCase().includes(searchLower);
          return matchCity && matchDuty && matchSearch;
        })
        .map((p) => ({
          ...p,
          facilityType: "pharmacy" as const,
          distance_km: userCoords
            ? calculateDistance(userCoords.lat, userCoords.lng, p.latitude, p.longitude)
            : p.distance_km,
        }));
    }

    const combined: ((HospitalItem & { facilityType: "hospital" }) | (PharmacyItem & { facilityType: "pharmacy" }))[] = [
      ...hospList,
      ...pharmList,
    ];

    if (userCoords) {
      combined.sort((a, b) => (a.distance_km ?? 99999) - (b.distance_km ?? 99999));
    }

    return combined;
  }, [hospitals, pharmacies, categoryFilter, dutyOnly, emergencyOnly, selectedCity, searchQuery, userCoords]);

  // Initialisation de la carte Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centre initial : Cotonou, Bénin
      const map = L.map(mapContainerRef.current, {
        center: [6.3654, 2.4285],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Nettoyage lors du démontage
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Mise à jour des marqueurs Leaflet avec DivIcons personnalisés sans émojis
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    filteredFacilities.forEach((item) => {
      const isHospital = item.facilityType === "hospital";
      const isDuty = !isHospital && (item as PharmacyItem).is_on_duty;

      // Définition des styles et couleurs par type
      let bgColor = "#007048";
      let borderColor = "#FFFFFF";
      let iconSvg = "";
      let labelTag = "";

      if (isHospital) {
        const hosp = item as HospitalItem;
        if (hosp.type === "national") {
          bgColor = "#007048"; // Vert officiel hôpital national
          labelTag = "CHU";
        } else if (hosp.type === "department") {
          bgColor = "#00A86B"; // Vert départemental
          labelTag = "CHD";
        } else if (hosp.type === "zone") {
          bgColor = "#059669"; // Vert de zone
          labelTag = "HZ";
        } else {
          bgColor = "#0284C7"; // Bleu médical clinique privée
          labelTag = "PRV";
        }

        iconSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 6v12M6 12h12"/>
          </svg>
        `;
      } else {
        if (isDuty) {
          bgColor = "#D97706"; // Ambre / Or vif pour garde
          borderColor = "#FEF3C7";
          labelTag = "GARDE";
        } else {
          bgColor = "#10B981"; // Vert émeraude pharmacie
          labelTag = "PHARM";
        }

        iconSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/>
            <path d="m8.5 8.5 7 7"/>
          </svg>
        `;
      }

      // Marqueur HTML avec Leaflet.divIcon
      const customIcon = L.divIcon({
        className: "custom-sante-marker",
        html: `
          <div style="
            position: relative;
            width: 42px;
            height: 42px;
            background-color: ${bgColor};
            border: 2.5px solid ${borderColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
            cursor: pointer;
            transition: transform 0.2s;
          ">
            ${iconSvg}
            ${
              isDuty
                ? `<span style="
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background: #DC2626;
                    color: #FFFFFF;
                    font-size: 8px;
                    font-weight: 800;
                    padding: 1px 4px;
                    border-radius: 8px;
                    border: 1px solid #FFFFFF;
                    letter-spacing: 0.5px;
                  ">GARDE</span>`
                : ""
            }
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 42],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([item.latitude, item.longitude], { icon: customIcon });

      // Contenu du Popup Leaflet
      const popupContent = document.createElement("div");
      popupContent.className = "sante-popup-card";
      popupContent.style.minWidth = "240px";
      popupContent.style.padding = "4px";

      const distanceBadge =
        item.distance_km !== undefined && item.distance_km !== null
          ? `<span style="display: inline-block; background: #E6F7F0; color: #007048; font-weight: 700; font-size: 12px; padding: 2px 8px; border-radius: 6px; margin-bottom: 6px;">À ${item.distance_km} km</span>`
          : "";

      const dutyBadge = isDuty
        ? `<span style="display: inline-block; background: #FEF3C7; color: #92400E; font-weight: 800; font-size: 11px; padding: 2px 8px; border-radius: 6px; margin-left: 6px;">DE GARDE</span>`
        : "";

      popupContent.innerHTML = `
        <div style="font-family: 'Atkinson Hyperlegible', sans-serif;">
          <div style="margin-bottom: 4px;">
            ${distanceBadge}
            ${dutyBadge}
          </div>
          <h4 style="margin: 0 0 4px 0; color: #1B362B; font-weight: 800; font-size: 16px; line-height: 1.3;">
            ${item.name}
          </h4>
          <p style="margin: 0 0 8px 0; color: #406354; font-size: 13px;">
            ${item.address}, ${item.city}
          </p>
          <div style="display: flex; gap: 8px; margin-top: 10px;">
            <a href="tel:${item.phone}" style="
              flex: 1;
              background-color: #00A86B;
              color: #FFFFFF;
              font-weight: 700;
              font-size: 13px;
              text-align: center;
              padding: 8px 10px;
              border-radius: 8px;
              text-decoration: none;
              display: inline-flex;
              align-items: center;
              justify-content: center;
            ">
              Appeler
            </a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}" target="_blank" rel="noopener noreferrer" style="
              flex: 1;
              background-color: #F0FDF4;
              color: #007048;
              border: 1px solid #C8E6D5;
              font-weight: 700;
              font-size: 13px;
              text-align: center;
              padding: 8px 10px;
              border-radius: 8px;
              text-decoration: none;
              display: inline-flex;
              align-items: center;
              justify-content: center;
            ">
              Itinéraire
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on("click", () => {
        setActiveFacility(item);
        if (onSelectFacility) {
          onSelectFacility(item);
        }
      });

      layer.addLayer(marker);
    });

    // Ajustement automatique du cadrage si des résultats existent
    if (filteredFacilities.length > 0 && mapInstanceRef.current) {
      const bounds = L.latLngBounds(
        filteredFacilities.map((f) => [f.latitude, f.longitude] as [number, number])
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [filteredFacilities, onSelectFacility]);

  // Fonction de géolocalisation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }

    setLocatingUser(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setLocatingUser(false);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 14);

          // Supprimer l'ancien marqueur utilisateur s'il existe
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          // Marqueur position utilisateur (Point bleu pulsant)
          const userIcon = L.divIcon({
            className: "user-location-marker",
            html: `
              <div style="
                width: 24px;
                height: 24px;
                background-color: #2563EB;
                border: 3px solid #FFFFFF;
                border-radius: 50%;
                box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.35);
              "></div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const userMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(
            mapInstanceRef.current
          );
          userMarker.bindPopup("<b>Vous êtes ici</b><br/>Position détectée au Bénin").openPopup();
          userMarkerRef.current = userMarker;
        }
      },
      (error) => {
        setLocatingUser(false);
        console.warn("Erreur géolocalisation:", error.message);
        setGeoError("Impossible de détecter votre position. Veuillez vérifier les autorisations GPS.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Zoomer sur un établissement particulier depuis la liste
  const handleFocusFacility = (item: HospitalItem | PharmacyItem) => {
    setActiveFacility(item);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([item.latitude, item.longitude], 16);
      setViewMode("map");
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* 1. BARRE D'OUTILS ET RECHERCHE */}
      <div className="bg-white border border-[#C8E6D5] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Recherche par mot-clé */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#688A7C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un hôpital, pharmacie, spécialité..."
            className="w-full pl-13 pr-4 min-h-[56px] text-lg rounded-xl border border-[#C8E6D5] bg-[#F9FDFB] text-[#1B362B] placeholder:text-[#688A7C] focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
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

        {/* Filtres par boutons de catégories */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setCategoryFilter("all");
              setDutyOnly(false);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-base transition-colors ${
              categoryFilter === "all" && !dutyOnly
                ? "bg-[#00A86B] text-white"
                : "bg-[#F0F9F4] text-[#1B362B] border border-[#C8E6D5] hover:bg-[#E6F7F0]"
            }`}
          >
            Tous ({hospitals.length + pharmacies.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter("hospitals");
              setDutyOnly(false);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-base transition-colors flex items-center gap-2 ${
              categoryFilter === "hospitals" && !dutyOnly
                ? "bg-[#00A86B] text-white"
                : "bg-[#F0F9F4] text-[#1B362B] border border-[#C8E6D5] hover:bg-[#E6F7F0]"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Hôpitaux ({hospitals.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter("pharmacies");
              setDutyOnly(false);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-base transition-colors flex items-center gap-2 ${
              categoryFilter === "pharmacies" && !dutyOnly
                ? "bg-[#00A86B] text-white"
                : "bg-[#F0F9F4] text-[#1B362B] border border-[#C8E6D5] hover:bg-[#E6F7F0]"
            }`}
          >
            <Pill className="w-4 h-4" />
            Pharmacies ({pharmacies.length})
          </button>

          <button
            type="button"
            onClick={() => setDutyOnly(!dutyOnly)}
            className={`px-4 py-2.5 rounded-xl font-bold text-base transition-colors flex items-center gap-2 ${
              dutyOnly
                ? "bg-[#D97706] text-white"
                : "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] hover:bg-[#FDE68A]"
            }`}
          >
            <Clock className="w-4 h-4" />
            Pharmacies de garde ({pharmacies.filter((p) => p.is_on_duty).length})
          </button>

          {/* Filtre Urgences */}
          {categoryFilter !== "pharmacies" && (
            <button
              type="button"
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`px-4 py-2.5 rounded-xl font-bold text-base transition-colors flex items-center gap-2 ${
                emergencyOnly
                  ? "bg-[#DC2626] text-white"
                  : "bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] hover:bg-[#FECACA]"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Urgences 24/7
            </button>
          )}
        </div>

        {/* Sélection par Ville et Boutons d'actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6F7F0]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#406354]">Ville :</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#C8E6D5] bg-[#F9FDFB] text-base font-bold text-[#1B362B] focus:outline-none"
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {/* Bouton Géolocalisation */}
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={locatingUser}
              className="min-h-[48px] px-4 rounded-xl bg-[#E6F7F0] border border-[#C8E6D5] text-[#007048] font-bold text-base flex items-center gap-2 hover:bg-[#D6F2E5] transition-colors"
              title="Centrer sur ma position"
            >
              <Crosshair className={`w-5 h-5 ${locatingUser ? "animate-spin text-[#00A86B]" : ""}`} />
              <span>{locatingUser ? "Localisation..." : "Ma position"}</span>
            </button>

            {/* Bascule Vue Carte / Liste */}
            <div className="flex bg-[#F0F9F4] border border-[#C8E6D5] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewMode("map")}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === "map" ? "bg-[#00A86B] text-white shadow-xs" : "text-[#406354]"
                }`}
              >
                <MapIcon className="w-4 h-4" />
                Carte
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === "list" ? "bg-[#00A86B] text-white shadow-xs" : "text-[#406354]"
                }`}
              >
                <List className="w-4 h-4" />
                Liste ({filteredFacilities.length})
              </button>
            </div>
          </div>
        </div>

        {geoError && (
          <div className="p-3 bg-[#FEE2E2] border border-[#FECACA] rounded-xl text-[#991B1B] text-sm">
            {geoError}
          </div>
        )}
      </div>

      {/* 2. ZONE PRINCIPALE : CARTE OU LISTE */}
      {viewMode === "map" ? (
        <div className="relative w-full rounded-2xl overflow-hidden border border-[#C8E6D5] shadow-sm">
          {/* Conteneur de la carte Leaflet */}
          <div
            ref={mapContainerRef}
            className="w-full h-[520px] sm:h-[600px] z-10"
            style={{ minHeight: "450px" }}
          />

          {/* Légende rapide en superposition */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs border border-[#C8E6D5] rounded-xl p-3 shadow-md max-w-xs text-xs space-y-1.5">
            <div className="font-bold text-[#1B362B] text-sm mb-1">Légende :</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#007048]"></span>
              <span>Hôpital Public / CHU / CHD / Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0284C7]"></span>
              <span>Clinique Privée</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
              <span>Pharmacie Ouverte</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#D97706]"></span>
              <span className="font-bold text-[#92400E]">Pharmacie de Garde (Urgence 24h)</span>
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 z-30 bg-white/80 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Compass className="w-8 h-8 text-[#00A86B] animate-spin mx-auto" />
                <p className="font-bold text-[#1B362B]">Chargement des établissements...</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VUE LISTE COMPLÈTE AVEC DISTANCE ET ACTIONS */
        <div className="bg-white border border-[#C8E6D5] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E6F7F0]">
            <h3 className="text-xl font-bold text-[#1B362B] font-display">
              Résultats trouvés ({filteredFacilities.length})
            </h3>
            <span className="text-xs text-[#688A7C] font-semibold">
              Données officielles du Bénin
            </span>
          </div>

          <div className="divide-y divide-[#E6F7F0] max-h-[600px] overflow-y-auto pr-1">
            {filteredFacilities.map((item) => {
              const isHosp = item.facilityType === "hospital";
              const isDuty = !isHosp && (item as PharmacyItem).is_on_duty;

              return (
                <div
                  key={item.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9FDFB] transition-colors rounded-xl px-2"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                          isHosp
                            ? "bg-[#E6F7F0] text-[#007048]"
                            : isDuty
                            ? "bg-[#FEF3C7] text-[#92400E]"
                            : "bg-[#F0F9F4] text-[#059669]"
                        }`}
                      >
                        {isHosp
                          ? (item as HospitalItem).type.toUpperCase()
                          : isDuty
                          ? "DE GARDE"
                          : "PHARMACIE"}
                      </span>

                      {item.distance_km !== undefined && item.distance_km !== null && (
                        <span className="text-xs font-bold text-[#00A86B] bg-[#E6F7F0] px-2 py-0.5 rounded-md">
                          {item.distance_km} km
                        </span>
                      )}

                      {isHosp && (item as HospitalItem).has_emergency && (
                        <span className="text-xs font-bold text-[#DC2626] bg-[#FEE2E2] px-2 py-0.5 rounded-md">
                          Urgences 24h
                        </span>
                      )}

                      {isHosp && (item as HospitalItem).has_blood_bank && (
                        <span className="text-xs font-bold text-[#991B1B] bg-[#FFE4E6] px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Droplet className="w-3 h-3" /> Banque de sang
                        </span>
                      )}
                    </div>

                    <h4 className="text-lg font-bold text-[#1B362B]">{item.name}</h4>
                    <p className="text-sm text-[#406354]">
                      {item.address} — <span className="font-semibold">{item.city}</span> ({item.department})
                    </p>

                    {isHosp && (item as HospitalItem).specialties.length > 0 && (
                      <p className="text-xs text-[#688A7C]">
                        Spécialités : {(item as HospitalItem).specialties.slice(0, 4).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${item.phone}`}
                      className="min-h-[48px] px-4 rounded-xl bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Phone className="w-4 h-4" />
                      Appeler
                    </a>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[48px] px-3 rounded-xl bg-[#F0F9F4] border border-[#C8E6D5] text-[#007048] font-bold text-sm flex items-center justify-center gap-1 hover:bg-[#E6F7F0]"
                    >
                      <Navigation className="w-4 h-4" />
                      Itinéraire
                    </a>

                    <button
                      type="button"
                      onClick={() => handleFocusFacility(item)}
                      className="min-h-[48px] px-3 rounded-xl bg-[#E6F7F0] text-[#007048] font-bold text-sm flex items-center justify-center hover:bg-[#D6F2E5]"
                      title="Voir sur la carte"
                    >
                      <MapPin className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredFacilities.length === 0 && (
              <div className="py-12 text-center text-[#688A7C]">
                Aucun établissement ne correspond à vos critères de recherche.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. FICHE DÉTAIL EN BAS LORSQU'UN ÉTABLISSEMENT EST SÉLECTIONNÉ */}
      {activeFacility && (
        <div className="bg-white border-2 border-[#00A86B] rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#E6F7F0] text-[#007048]">
                {"facilityType" in activeFacility && activeFacility.facilityType === "pharmacy"
                  ? "Pharmacie"
                  : "Hôpital"}
              </span>
              {!("specialties" in activeFacility) && (activeFacility as PharmacyItem).is_on_duty && (
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">
                  PHARMACIE DE GARDE OUVERTE
                </span>
              )}
            </div>
            <h3 className="text-xl font-extrabold text-[#1B362B] font-display">
              {activeFacility.name}
            </h3>
            <p className="text-sm text-[#406354]">
              {activeFacility.address} — {activeFacility.city} ({activeFacility.department})
            </p>
            {activeFacility.phone && (
              <p className="text-sm font-semibold text-[#007048]">
                Téléphone : {activeFacility.phone}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${activeFacility.phone}`}
              className="min-h-[56px] px-6 rounded-xl bg-[#00A86B] hover:bg-[#00965F] text-white font-bold text-lg flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Phone className="w-5 h-5" />
              Appel direct
            </a>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${activeFacility.latitude},${activeFacility.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[56px] px-6 rounded-xl bg-[#F0F9F4] border border-[#00A86B] text-[#007048] font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#E6F7F0] transition-all"
            >
              <Navigation className="w-5 h-5" />
              Lancer l'itinéraire
            </a>

            <button
              type="button"
              onClick={() => setActiveFacility(null)}
              className="p-3 text-[#688A7C] hover:text-[#1B362B] rounded-xl hover:bg-[#F0F9F4]"
              title="Fermer la fiche"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
