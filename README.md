# ARCHIMEDES
### Personal Progression System

```text
ARCHIMEDES
PERSONAL PROGRESSION SYSTEM

CHALLENGE WINDOW:
11 OCTOBER 2026 → 07 FEBRUARY 2027
120 CALENDAR DAYS INCLUSIVE
TIMEZONE: Asia/Kolkata
```

---

## 1. Overview & Purpose

**ARCHIMEDES** is a private, single-operator personal progression system that combines structured training protocols with deterministic progression mechanics:

- **Structured Training Protocols**: Fixed 7-day weekly schedule with dedicated strength, mobility, agility, calisthenics, and active recovery days.
- **Performance Logging**: Real-time set logging (weight, reps, duration, assistance) with Last Session historical visibility.
- **Progression Mechanics**: Cumulative XP, mathematical level thresholds (Levels 1 to 50+), weighted System Power calculations, and tier ranks (`E`, `D`, `C`, `B`, `A`, `S`).
- **Game-Inspired Milestones**: Boss quests with logged performance verification, visible and secret achievements, cosmetic title unlocks, and controlled reward tokens.
- **Progress Verification**: Checkpoints (Day 1, 30, 60, 90, 120) with body measurements and private, EXIF-stripped WebP progress photos.
- **Deterministic Reporting**: Challenge-week performance summaries and milestone reports without reliance on external AI services.

The application is inspired by game-like progression systems and instrument panel operating systems, but is strictly original and is not a direct visual or intellectual copy of Solo Leveling or any commercial video game.

---

## 2. Design Philosophy

- **Absolute Monochrome Visual Language**: Built strictly with `#000000`, `#FFFFFF`, and opacity levels derived from black and white. No hue-based colors, no color-coded graphs, and zero gradients. Hierarchy is established exclusively via contrast, borders, typography, spacing, and inversion.
- **Mobile-First Instrument Panel**: Designed from the ground up for single-thumb mobile interaction, prioritizing clear tabular telemetry over cluttered multi-card SaaS dashboards.
- **Hardware Optimization (OPPO A54 Target)**:
  - Specifically designed and tested for older, resource-constrained Android devices such as the OPPO A54.
  - Zero Three.js, WebGL, canvas animation loops, continuous CPU polling, or heavy charting frameworks.
  - Route-level code splitting using `React.lazy()` and `Suspense` for secondary views (`StatsScreen`, `ProgressScreen`, `ProfileScreen`).
  - Native inline SVG reticles and icons instead of heavy icon bundles.
  - Client-side EXIF stripping and canvas WebP compression before photo upload to preserve device RAM and mobile network bandwidth.
- **Private by Default**: 100% private data isolation keyed by Firebase UID (`users/{uid}/...`). No social feeds, public profiles, followers, or shared leaderboards.
- **Silent Feedback**: Explicitly zero sound effects, countdown beeps, or background music.

---

## 3. Tech Stack

Every technology listed below is installed, configured, and operational in this repository:

- **Frontend Core**: [React 19](https://react.dev/) with [TypeScript 5.7](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite 6](https://vite.dev/) with custom Rollup manual chunking
- **Styling**: Pure Vanilla CSS (`src/index.css`) with CSS custom properties and full `prefers-reduced-motion` compliance
- **Testing**: [Vitest 3](https://vitest.dev/) automated test runner
- **Authentication**: Firebase Authentication (Google OAuth provider only)
- **Database**: Cloud Firestore with strict user UID security rules
- **Object Storage**: Firebase Storage for private, authenticated WebP progress photo timeline
- **Backend Functions**: Firebase Cloud Functions v2 (TypeScript, deployed to `asia-south1` region)
- **Push Reminders**: Firebase Cloud Messaging (FCM) with scheduled notifications at 17:30 IST
- **PWA**: Web App Manifest (`manifest.webmanifest`), monochrome icons, and custom Service Worker (`public/sw.js`) for static asset caching
- **Hosting Target**: [Vercel](https://vercel.com/) with SPA rewrite rules (`vercel.json`)

---

## 4. Features: Implemented vs Planned

### Implemented Features
- [x] **Google Authentication**: Mobile-friendly redirect and popup authentication with per-UID data isolation.
- [x] **Day 1 Onboarding**: Mandatory baseline intake (109 kg, 44 in waist, lift numbers) and 3 progress photos (Front, Side, Back).
- [x] **Deterministic Challenge Date Engine**: Exact 120-day mapping (Day 1: Monday, 12 Oct 2026; Day 120: Monday, 08 Feb 2027) in `Asia/Kolkata` timezone.
- [x] **Weekly Training Engine**: Fully data-driven schedule for all 7 days with exercise tracking, sets, reps, and metric types (`WEIGHT_REPS`, `BODYWEIGHT_REPS`, `DURATION`, `WEIGHT_DURATION`, `ASSISTANCE_REPS`, `TIME_BLOCK`, `CHECK_ONLY`).
- [x] **Real-Time Workout Logging**: Online persistence in `users/{uid}/activeSessions/{dateKey}` allowing session resumption across browser reloads.
- [x] **Silent Rest Timer**: Accurate timestamp-based 3-minute rest timer with `+30s`, `Skip`, and `Pause` controls.
- [x] **Authoritative Finalization**: Calculation of base XP, reduced sessions (60%), minimum viable days (75 XP), and streak rules.
- [x] **Exception Protocols**: Handling for Sick (0 XP, streak paused), Gym Closed, College Exam, Travel, Injury, Unavoidable, and Low Motivation (10-Minute Warm-up Rule).
- [x] **Level Progression**: Mathematical formula $\Delta\text{XP} = 250 + 40 \times (N - 1)$ supporting 50+ levels.
- [x] **Automatic PR Detection**: Weight PR (+50 XP), Rep PR (+25 XP), Volume PR (+25 XP), Duration PR (+25 XP), Assistance PR (+25 XP) capped at 150 XP per session.
- [x] **Attribute Progression**: Six attributes (`STR`, `END`, `AGI`, `MOB`, `DIS`, `FOC`) starting at 20, maxing at 100, driving weighted System Power and Ranks (`E` to `S`).
- [x] **Boss Quests**: Milestone challenges verified against logged workout sets (e.g., Day 30 Iron Gate).
- [x] **Achievements & Cosmetic Titles**: Visible and hidden achievements with single-grant idempotency; cosmetic title equip system.
- [x] **Reward Vault**: Controlled random reward token generator (~2/week cap with bad-luck protection) and self-treat redemption ledger.
- [x] **Progress Photo Timeline**: Checkpoints at Day 1, 30, 60, 90, and 120 with EXIF stripping.
- [x] **120-Day Calendar**: Monochrome interactive challenge calendar grid.
- [x] **Account Deletion**: Complete multi-collection Firestore and Storage purge with confirmation.

### Planned Features
- [ ] Automated weekly PDF/image snapshot export of milestone reports.
- [ ] Offline local draft queuing for zero-connectivity environments (current implementation enforces online cloud persistence to prevent XP desynchronization).

---

## 5. Project Structure

```text
d:\ARCHIMEDES_-_fitness_tracker\
├── .env.example
├── .gitignore
├── CHANGELOG.md
├── README.md
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── storage.rules
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
├── vite.config.ts
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   ├── PROGRESSION-SYSTEM.md
│   ├── SECURITY.md
│   ├── TESTING.md
│   └── WORKOUT-SYSTEM.md
├── functions/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts
├── public/
│   ├── favicon.ico
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-monochrome.svg
│   ├── manifest.webmanifest
│   └── sw.js
└── src/
    ├── App.tsx
    ├── index.css
    ├── main.tsx
    ├── vite-env.d.ts
    ├── components/
    │   ├── common/
    │   ├── layout/
    │   └── overlays/
    ├── context/
    ├── data/
    ├── features/
    │   ├── auth/
    │   ├── profile/
    │   ├── progress/
    │   ├── quest/
    │   ├── stats/
    │   └── system/
    ├── lib/
    │   ├── compression/
    │   ├── dates/
    │   ├── firebase/
    │   ├── formatting/
    │   └── progression/
    └── tests/
```

---

## 6. Installation & Local Development

### 1. Prerequisites
- Node.js >= 18.0.0 (Tested on Node v24.12.0)
- npm >= 9.0.0

### 2. Frontend Setup
```bash
# Clone the repository
git clone https://github.com/Kishore-2007-web/ARCHIMEDES-fitness_tracker.git
cd ARCHIMEDES-fitness_tracker

# Install frontend dependencies
npm install

# Start local development server
npm run dev

# Run automated Vitest test suite
npm test

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

### 3. Backend Cloud Functions Setup
```bash
# Install backend dependencies
npm --prefix functions install

# Compile Cloud Functions TypeScript
npm --prefix functions run build
```

---

## 7. Environment Configuration

The application requires client-side Firebase environment variables. Create a local `.env` file by copying the template:

```bash
cp .env.example .env
```

Populate `.env` with your Firebase project credentials:

```ini
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_optional_vapid_key
```

> [!WARNING]
> `.env` files must NEVER be committed to Git. The `.gitignore` configuration automatically ignores all `.env` and `.env.*` files.

---

## 8. Deployment Overview

- **Frontend (Vercel)**: Configured via `vercel.json` with SPA routing rewrites. Simply import the repository into Vercel and provide the environment variables.
- **Backend (Firebase)**: Configured via `firebase.json` for Firestore rules, Storage rules, and Cloud Functions in `asia-south1`. Deploy using the Firebase CLI.

For detailed, step-by-step instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 9. Security & Privacy Overview

- **Authorization**: Firestore and Storage rules strictly verify `request.auth.uid == userId`.
- **Private Progress Photos**: Photos are stored under `users/{uid}/progress/...` and cannot be accessed publicly.
- **Server Authoritative**: Critical fields (XP, levels, ranks, tokens, boss status) are computed server-side or validated via transactional Firestore rules.
- **Account Erasure**: Full compliance with private data standards via a permanent account deletion workflow that purges all subcollections and storage objects.

For the complete security model and rules specification, see [docs/SECURITY.md](docs/SECURITY.md).

---

## 10. Technical Documentation Index

For in-depth architectural and mechanical specifications, refer to the documents in `/docs`:

1. [Architecture Documentation](docs/ARCHITECTURE.md) — System layers, component tree, and mobile performance patterns.
2. [Database Schema](docs/DATABASE.md) — Firestore collection paths, document schemas, and Storage paths.
3. [Progression System Specification](docs/PROGRESSION-SYSTEM.md) — Exact mathematical formulas for XP, levels, PRs, System Power, attributes, and rewards.
4. [Workout System Specification](docs/WORKOUT-SYSTEM.md) — Full weekly schedule, exercise metric types, rest timer, and exception handling.
5. [Security Architecture](docs/SECURITY.md) — Rules, token authorization, client trust boundaries, and data deletion.
6. [Deployment Guide](docs/DEPLOYMENT.md) — Production setup for Vercel, Firebase Firestore, Storage, and Cloud Functions.
7. [Testing Strategy](docs/TESTING.md) — Unit tests, test coverage, and mobile hardware verification.

---

## 11. Project Status & License

- **Current Status**: Production Core Completed (v1.0.0). All baseline requirements, workout logging, progression formulas, and tests are implemented and active.
- **License**: Private Personal Progression System. All rights reserved. Not licensed for public distribution or commercial reproduction.
