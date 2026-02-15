# Cahier des Charges — Charity Impact Suite

## 1. Présentation Générale du Projet

### 1.1 Intitulé
**Charity Impact Suite** — Plateforme web de gestion des dons et des aides pour les associations caritatives en Tunisie.

### 1.2 Contexte
Les associations caritatives tunisiennes font face à plusieurs problèmes récurrents :
- Difficulté de suivi des bénéficiaires et des familles aidées
- Risque de doublons dans la distribution des aides
- Manque de transparence envers les donateurs
- Absence d'outils pour appliquer des règles de distribution équitable
- Gestion manuelle et peu fiable des contributions et des dépenses

### 1.3 Objectif
Développer une plateforme web complète permettant aux associations de gérer leurs bénéficiaires, de suivre les contributions reçues, de distribuer les aides de manière équitable et de garantir une transparence totale envers les donateurs et le public.

### 1.4 Public Cible
- **Associations caritatives** : gestion quotidienne des aides
- **Donateurs** : suivi de l'impact de leurs contributions
- **Public** : consultation des statistiques de transparence

---

## 2. Acteurs du Système

| Acteur | Rôle |
|---|---|
| **Super Admin** | Gestion globale de la plateforme (associations, utilisateurs) |
| **Admin Association** | Gestion complète de son association (bénéficiaires, budget, règles, membres) |
| **Membre Association** | Opérations courantes (distribution d'aides, consultation) |
| **Donateur** | Effectuer et suivre ses contributions |
| **Visiteur (Public)** | Consulter les associations et les statistiques publiques |

---

## 3. Besoins Fonctionnels

### 3.1 Authentification & Gestion des Utilisateurs
- Inscription avec choix de rôle (donateur par défaut)
- Connexion par email et mot de passe (JWT)
- Consultation et modification du profil
- Gestion des utilisateurs par le Super Admin (CRUD)
- Contrôle d'accès basé sur les rôles (RBAC)

### 3.2 Gestion des Associations
- Création d'une association (statut en attente par défaut)
- Modification des informations (nom, description, logo, email, téléphone, adresse, catégorie)
- Activation / Suspension d'une association par le Super Admin
- Consultation de la liste des associations (public)
- Page de détail d'une association avec ses statistiques d'impact
- Suivi du budget disponible (alimenté par les contributions approuvées)

### 3.3 Gestion des Familles
- Ajout d'une famille rattachée à une association
- Informations : nom, nombre de membres, adresse
- Statut d'éligibilité : `Éligible`, `Non éligible`, `En période de carence`
- Suivi du montant total reçu et de la date de la dernière aide
- Vérification de la période de carence (cooldown) avant distribution
- Suppression d'une famille

### 3.4 Gestion des Bénéficiaires
- Ajout d'un bénéficiaire rattaché à une famille et une association
- Informations : nom, prénom, CIN, email, téléphone, adresse
- Statut : `Éligible`, `Non éligible`, `En attente de révision`
- Suivi du montant total reçu et de la date de la dernière aide
- Modification du statut d'éligibilité avec notes

### 3.5 Gestion des Contributions (Entrées d'argent)
Une contribution représente un don financier d'un donateur vers une association.

- Création d'une contribution (donateur authentifié ou anonyme)
- Informations : montant, devise (TND), type (`Unique` / `Récurrent`), méthode (`Carte`, `Virement`, `Espèces`, `Chèque`), notes
- Donateur anonyme : nom et email optionnels
- Statut : `En attente` → `Approuvée` ou `Rejetée`
- Approbation par un admin/membre → le budget de l'association augmente
- Consultation par le donateur de ses propres contributions
- Statistiques des contributions par association

### 3.6 Gestion des Donations (Sorties d'aide)
Une donation représente une aide distribuée par l'association à un bénéficiaire, prélevée sur le budget.

- Création d'une donation par un membre ou admin
- Informations : montant, bénéficiaire, famille, type d'aide (`Espèces`, `Nourriture`, `Vêtements`, `Médical`, `Éducation`, `Autre`), notes
- Vérification automatique des règles de distribution avant validation
- Statut : `Complétée` ou `Annulée`
- Déduction du budget de l'association
- Mise à jour du total reçu par le bénéficiaire et la famille
- Consultation des bénéficiaires éligibles
- Statistiques des donations

### 3.7 Règles de Distribution
Les associations peuvent configurer des règles pour garantir une distribution équitable :

| Type de règle | Description | Exemple |
|---|---|---|
| **Fréquence (cooldown)** | Délai minimum entre deux aides pour une même famille | 30 jours |
| **Montant** | Montant maximum par membre de famille | 200 TND/membre |
| **Éligibilité** | Nombre minimum de membres dans une famille | 3 membres |

- Création, modification et suppression de règles
- Activation / Désactivation individuelle
- Vérification automatique lors de la création d'une donation

### 3.8 Journal d'Audit
- Enregistrement automatique de toutes les actions (création, modification, approbation, etc.)
- Informations : action, détails, type d'entité, identifiant, utilisateur, date
- Consultation filtrée par association
- Traçabilité complète pour la transparence

### 3.9 Tableau de Bord
- **Admin/Membre** : statistiques de l'association (budget, bénéficiaires, donations, contributions)
- **Donateur** : historique et impact de ses contributions
- **Public** : statistiques globales (associations actives, familles aidées, montants distribués)

### 3.10 Pages Publiques
- Page d'accueil présentant la plateforme
- Liste des associations avec détails
- Page "Comment ça marche"
- Page "Impact" avec statistiques globales

### 3.11 Export de Données
- Export des données au format CSV pour les rapports

---

## 4. Besoins Non Fonctionnels

| Exigence | Description |
|---|---|
| **Sécurité** | Authentification JWT, hachage des mots de passe (bcrypt), validation des entrées, RBAC |
| **Performance** | Temps de réponse API < 500ms pour les requêtes courantes |
| **Ergonomie** | Interface responsive (desktop et tablette), design moderne avec composants accessibles |
| **Disponibilité** | Application web accessible 24h/24 |
| **Maintenabilité** | Code structuré en modules, séparation frontend/backend, documentation API (Swagger) |
| **Transparence** | Données publiques consultables sans authentification |

---

## 5. Architecture Technique

### 5.1 Architecture Globale
Architecture **client-serveur** avec séparation complète frontend / backend communiquant via une API REST.

### 5.2 Stack Technique

| Couche | Technologie |
|---|---|
| **Frontend** | React 18, TypeScript, Vite |
| **UI** | Tailwind CSS, shadcn/ui (Radix UI), Recharts (graphiques) |
| **Gestion d'état** | React Query (TanStack Query) |
| **Routing** | React Router v6 |
| **Backend** | NestJS (Node.js), TypeScript |
| **ORM** | Prisma |
| **Base de données** | SQLite (développement) |
| **Authentification** | JWT (Passport.js) |
| **Documentation API** | Swagger (OpenAPI) |

### 5.3 Structure du Projet

```
charity-impact-suite/
├── src/                    # Frontend React
│   ├── components/         # Composants UI réutilisables
│   ├── contexts/           # Contexte d'authentification
│   ├── hooks/              # Hooks personnalisés (API calls)
│   ├── lib/                # Client API, utilitaires
│   ├── pages/              # Pages de l'application
│   └── types/              # Types TypeScript
├── api/                    # Backend NestJS
│   ├── src/
│   │   ├── auth/           # Module authentification
│   │   ├── associations/   # Module associations
│   │   ├── beneficiaries/  # Module bénéficiaires
│   │   ├── families/       # Module familles
│   │   ├── contributions/  # Module contributions
│   │   ├── donations/      # Module donations
│   │   ├── rules/          # Module règles
│   │   ├── users/          # Module utilisateurs
│   │   ├── audit/          # Module journal d'audit
│   │   └── prisma/         # Service Prisma
│   └── prisma/
│       └── schema.prisma   # Schéma base de données
```

---

## 6. Modèle de Données

### Entités principales

| Entité | Description |
|---|---|
| **User** | Utilisateur de la plateforme (email, mot de passe, nom, rôle, association) |
| **Association** | Association caritative (nom, description, budget, statut, catégorie) |
| **Family** | Famille bénéficiaire (nom, nombre de membres, statut, total reçu) |
| **Beneficiary** | Bénéficiaire individuel rattaché à une famille (CIN, statut, total reçu) |
| **Contribution** | Don financier entrant d'un donateur vers une association |
| **Donation** | Aide sortante de l'association vers un bénéficiaire |
| **DonationRule** | Règle de distribution configurable par association |
| **ActivityLog** | Trace d'audit de chaque action effectuée |

### Relations clés
- Un **User** appartient à une **Association** (optionnel)
- Une **Association** contient plusieurs **Familles**, **Bénéficiaires**, **Contributions**, **Donations** et **Règles**
- Une **Famille** contient plusieurs **Bénéficiaires**
- Une **Contribution** est liée à un **Donateur** (optionnel si anonyme)
- Une **Donation** est liée à un **Bénéficiaire** et une **Famille**

---

## 7. Endpoints API Principaux

| Module | Endpoints | Méthodes |
|---|---|---|
| **Auth** | `/api/auth/register`, `/api/auth/login`, `/api/auth/me` | POST, GET, PUT |
| **Associations** | `/api/associations`, `/api/associations/:id`, `/api/associations/public-stats` | GET, POST, PUT |
| **Bénéficiaires** | `/api/beneficiaries`, `/api/beneficiaries/:id`, `/api/beneficiaries/:id/status` | GET, POST, PUT, PATCH |
| **Familles** | `/api/families`, `/api/families/:id`, `/api/families/:id/cooldown` | GET, POST, PUT, DELETE |
| **Contributions** | `/api/contributions`, `/api/contributions/:id/approve`, `/api/contributions/:id/reject`, `/api/contributions/my-contributions` | GET, POST, PUT |
| **Donations** | `/api/donations`, `/api/donations/:id/cancel`, `/api/donations/eligible-beneficiaries`, `/api/donations/stats` | GET, POST, PATCH |
| **Règles** | `/api/rules`, `/api/rules/:id`, `/api/rules/:id/toggle` | GET, POST, PUT, PATCH, DELETE |
| **Utilisateurs** | `/api/users`, `/api/users/:id` | GET, POST, PUT, DELETE |
| **Audit** | `/api/audit` | GET |

---

## 8. Interfaces Utilisateur (Pages)

| Page | Accès | Description |
|---|---|---|
| Accueil (`/`) | Public | Présentation de la plateforme |
| Authentification (`/auth`) | Public | Inscription et connexion |
| Associations (`/associations`) | Public | Liste des associations |
| Détail Association (`/associations/:id`) | Public | Détails et statistiques d'une association |
| Comment ça marche (`/how-it-works`) | Public | Explication du fonctionnement |
| Impact (`/impact`) | Public | Statistiques globales d'impact |
| Tableau de bord (`/dashboard`) | Authentifié | Vue principale selon le rôle |
| Gestion Associations (`/dashboard/associations`) | Super Admin | CRUD associations |
| Gestion Utilisateurs (`/dashboard/users`) | Admin | CRUD utilisateurs |
| Gestion Bénéficiaires (`/dashboard/beneficiaries`) | Admin/Membre | CRUD bénéficiaires |
| Gestion Familles (`/dashboard/families`) | Admin/Membre | CRUD familles |
| Donations (`/dashboard/donations`) | Admin/Membre | Liste et gestion des donations |
| Nouvelle Donation (`/dashboard/donations/new`) | Admin/Membre | Formulaire de contribution |
| Nouvelle Distribution (`/dashboard/dispatch/new`) | Admin/Membre | Formulaire de distribution d'aide |
| Règles (`/dashboard/rules`) | Admin | Configuration des règles |
| Rapports (`/dashboard/reports`) | Admin | Rapports et exports |
| Journal d'audit (`/dashboard/audit`) | Admin | Historique des actions |
| Paramètres (`/dashboard/settings`) | Authentifié | Paramètres du profil |

---

## 9. Flux Principaux

### 9.1 Flux de Contribution (Entrée d'argent)
```
Donateur → Crée une contribution → Statut "En attente"
    → Admin/Membre approuve → Budget association augmenté
    → Admin/Membre rejette → Contribution refusée
```

### 9.2 Flux de Distribution (Sortie d'aide)
```
Membre/Admin → Sélectionne un bénéficiaire éligible
    → Saisit le montant et le type d'aide
    → Système vérifie les règles (cooldown, montant max, éligibilité)
    → Si conforme → Donation créée, budget déduit, totaux mis à jour
    → Si non conforme → Rejet avec motif
```

### 9.3 Flux de Transparence
```
Visiteur → Consulte les associations publiques
    → Voit les statistiques (familles aidées, montants, taux de succès)
    → Aucune authentification requise
```

---

## 10. Livrables

| Livrable | Description |
|---|---|
| Code source frontend | Application React (SPA) |
| Code source backend | API NestJS |
| Base de données | Schéma Prisma + seed de données |
| Documentation API | Swagger auto-générée (`/api/docs`) |
| Documentation technique | README, diagrammes (cas d'utilisation, classes, séquences, architecture) |
