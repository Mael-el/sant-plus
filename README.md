# SANTÉ+ Bénin

Plateforme de santé numérique nationale pour la République du Bénin.

## Fonctionnalités Portées

1. **Portail Citoyen & Dossier Médical Partagé (FHIR R4)**
   - Authentification NPI (Numéro Personnel d'Identification ANIP Bénin)
   - Profil médical (groupe sanguin, électrophorèse AA/AS/SS, allergies)
   - Consultations et ordonnances certifiées avec preuve d'intégrité Bitcoin (OP_RETURN) et visualiseur QR Code
   - Relevé des constantes vitales (Tension artérielle, Glycémie, Température, FC, Hémoglobine)
   - Export du dossier médical au format standardisé FHIR R4 JSON

2. **Triage Clinique IA & Détection des Interactions Médicamenteuses**
   - Moteur de triage alimenté par Google Gemini avec heuristiques de repli adaptées à la zone intertropicale et aux directives du PNLP Bénin
   - Détection des interactions médicamenteuses critiques (AINS, Coartem/CTA, Paracétamol)

3. **Géoregistre Sanitaire IASO & Carte Nationale**
   - Référentiel des hôpitaux et centres de santé des 12 départements du Bénin
   - Filtrage par département, lits disponibles, urgences 24h/24 et calcul d'itinéraires

4. **Paiements Santé Sécurisés (PI-SPI & Mobile Money)**
   - Intégration MTN Mobile Money, Moov Money, Celtiis Cash et PI-SPI (BCEAO)
   - Génération de quittances avec QR Code vérifiable

5. **Banque de Sang & Urgences Transfusionnelles**
   - Alertes de pénurie par groupe sanguin dans les hôpitaux du Bénin
   - Fiche d'appels d'urgence (SAMU 15, Sapeurs Pompiers 118, ANTS)

6. **Espaces Professionnels & Administration DSI**
   - Parcours de demande praticien (Ordre National des Médecins du Bénin - ONMB)
   - Enrôlement établissement IASO
   - Portail d'administration centrale avec contrôle d'accès, audit logs et double authentification (2FA)

## Architecture Technique

- **Frontend** : React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend** : Node.js, Express, @google/genai SDK (Gemini 2.5 Flash)
- **Palette** : Charte institutionnelle "Vert & Blanc" (Vert émeraude #00A86B, Vert profond #007048, Blanc pur #FFFFFF)
