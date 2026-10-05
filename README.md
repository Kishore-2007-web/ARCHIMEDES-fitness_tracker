# ARCHIMEDES // PERSONAL PROGRESSION SYSTEM
> **07 October 2026 → 07 February 2027**  
> **124 Calendar Days Inclusive // Timezone: Asia/Kolkata**

ARCHIMEDES is a private, single-user personal fitness progression system designed as a high-end instrument panel and operating system inspired by game progression mechanics. Built for mobile-first execution, strict monochrome contrast, cloud-authoritative persistence, and hardware efficiency optimized for older Android devices (specifically OPPO A54 class hardware).

---

## 1. Core Architecture & Philosophy

- **Zero Hue / Absolute Monochrome**: Strict `#000000`, `#FFFFFF`, and opacity levels. No blues, purples, cyans, neons, or gradients. Contrast, borders, inversion, typography, and motion establish hierarchy.
- **Hardware Optimization (OPPO A54)**: Zero Three.js/WebGL, zero continuous canvas loops, zero heavy chart libraries. Pure SVG reticles, CSS transitions, route-level code splitting, and client-side EXIF-stripped WebP compression.
- **100% Privacy**: No social feeds, no public profiles, no followers, no leaderboards. Strict UID-isolated paths (`users/{uid}/...`).
- **Cloud-Authoritative Engine**: No XP awarded on client trust. Server Cloud Functions and Firestore rules prevent XP farming, duplicate boss awards, and milestone tampering.
- **PWA Ready**: Offline detection banner, static asset service worker caching, standalone manifest, monochrome icons.

---

## 2. Challenge Timeline & Baseline

### Schedule Rules
- **Day 1**: Wednesday, 07 October 2026 (`DEADLIFT + FULL BODY STRENGTH`)
- **Day 124**: Sunday, 07 February 2027 (`ACTIVE RECOVERY // PROTOCOL COMPLETE`)
- **Timezone**: `Asia/Kolkata`
- **Duration**: Exactly 124 days.

### User Baseline (Day 1)
```text
Body Weight:         109 kg
Waist Circumference: 44 in
Max Push-ups:        3
Max Pull-ups:        0
Max Plank:           30 sec
Barbell Back Squat:  80 kg × 8 reps
Barbell Bench Press: 30 kg × 12 reps
Deadlift:            80 kg × 8 reps
```

---

## 3. Weekly Workout Schedule

| Day | Title | Focus & Primary Attributes | Base XP |
| :--- | :--- | :--- | :--- |
| **Monday** | Squat + Bench Strength A | Heavy Squat & Bench (5×3–5), Rows, RDL, Carries, Hang (STR, DIS, FOC) | 300 |
| **Tuesday** | Mobility + Agility + Athleticism | Jump Rope, Reaction Ball, Agility Footwork (AGI, MOB, END, DIS) | 200 |
| **Wednesday** | Deadlift + Full Body Strength | Conventional Deadlift (4×3), Leg Press, Lat Pulldown, Grip, Neck (STR, END, DIS) | 300 |
| **Thursday** | Athletic + Mobility | Jump Rope, Reaction Ball, Footwork, Conditioning (AGI, END, MOB) | 200 |
| **Friday** | Squat + Bench Strength B | Squat & Bench (4×4), Light Deadlift (50–65%), Forearms (STR, DIS, FOC) | 300 |
| **Saturday** | Calisthenics + Athletic Strength | Push-ups, Assisted Pull-ups, Planks, Carries (STR, END, AGI, DIS) | 250 |
| **Sunday** | Active Recovery | 30 min Mobility, 15 min Breathing, 45 min Walk (MOB, END, FOC) | 100 |

---

## 4. Progression & Gamification Formulas

### Level Progression
Cumulative XP threshold to reach Level $L$:
$$\text{Cumulative XP}(L) = (L - 1) \times 250 + 20 \times (L - 1) \times (L - 2)$$
XP required to advance from Level $N$ to $N+1$:
$$\Delta\text{XP} = 250 + 40 \times (N - 1)$$

### Attributes & System Power
Attributes start at **20** and max out at **100** (`STR`, `END`, `AGI`, `MOB`, `DIS`, `FOC`).
$$\text{Attribute Composite} = \text{STR} \times 0.20 + \text{END} \times 0.15 + \text{AGI} \times 0.15 + \text{MOB} \times 0.15 + \text{DIS} \times 0.20 + \text{FOC} \times 0.15$$
$$\text{System Power} = \text{Composite} \times 0.35 + \text{Consistency} \times 0.20 + \text{Completion} \times 0.20 + \text{Performance} \times 0.15 + \text{Boss} \times 0.10$$

### Ranks
- **E**: 0–24
- **D**: 25–39
- **C**: 40–54
- **B**: 55–69
- **A**: 70–84
- **S**: 85–100

### Exceptions & 10-Minute Rule
- **Sick / Injury**: 0 XP, streak paused, consistency maintained.
- **Gym Closed / Exam / Travel / Unavoidable**: 75 XP (Minimum viable walk & mobility), consistency maintained.
- **Low Motivation**: 10-Minute Warm-up Rule. If full workout completed: 100% XP; if reduced: ~60% XP.
- **Normal Miss**: 0 XP, training and consistency streaks reset to 0.

---

## 5. Technology Stack & Dependencies

### Frontend Core
- **React 19 & TypeScript 5.7**: Strongly typed interfaces, contexts, and hooks.
- **Vite 6**: Fast bundling, route chunking, and modern ES2020 target.
- **Vanilla CSS (`src/index.css`)**: Zero Tailwind, zero third-party UI libraries. Complete monochrome token system.
- **Firebase Web Modular SDK (v11.4.0)**: Auth, Firestore, Storage, Functions, Messaging.

### Backend & Cloud Infrastructure
- **Firebase Cloud Functions (v2)**: TypeScript functions in `asia-south1` (Asia/Kolkata) region for authoritative session finalization, FCM push reminders, and full account erasure.
- **Firestore**: Strict security rules enforcing UID isolation.
- **Firebase Storage**: Progress photos stored as private WebP files stripped of EXIF metadata.
- **Vercel**: Single-page application hosting with `vercel.json` rewrites.

---

## 6. Project Structure

```text
d:\ARCHIMEDES_-_fitness_tracker\
├── .env.example
├── .gitignore
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── index.html
├── package.json
├── storage.rules
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json
├── vite.config.ts
├── public/
│   ├── favicon.ico
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-monochrome.svg
│   ├── manifest.webmanifest
│   └── sw.js
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── vite-env.d.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── InstallPrompt.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── RankBadge.tsx
│   │   │   └── RestTimer.tsx
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── OfflineBanner.tsx
│   │   │   └── SystemHeader.tsx
│   │   └── overlays/
│   │       ├── ExceptionModal.tsx
│   │       ├── LevelUpOverlay.tsx
│   │       ├── MissionMissedModal.tsx
│   │       └── XPRevealOverlay.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── UserProgressionContext.tsx
│   ├── data/
│   │   ├── achievements.ts
│   │   ├── baseline.ts
│   │   ├── bosses.ts
│   │   ├── titles.ts
│   │   └── workoutSchedule.ts
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── OnboardingScreen.tsx
│   │   ├── profile/
│   │   │   └── ProfileScreen.tsx
│   │   ├── progress/
│   │   │   └── ProgressScreen.tsx
│   │   ├── quest/
│   │   │   ├── BlockChecklist.tsx
│   │   │   ├── ExerciseLogger.tsx
│   │   │   └── QuestScreen.tsx
│   │   ├── stats/
│   │   │   └── StatsScreen.tsx
│   │   └── system/
│   │       ├── SystemEventsFeed.tsx
│   │       └── SystemScreen.tsx
│   ├── lib/
│   │   ├── compression/
│   │   │   └── imageCompressor.ts
│   │   ├── dates/
│   │   │   └── challengeDates.ts
│   │   ├── firebase/
│   │   │   ├── auth.ts
│   │   │   ├── config.ts
│   │   │   ├── db.ts
│   │   │   ├── functions.ts
│   │   │   ├── messaging.ts
│   │   │   └── storage.ts
│   │   ├── formatting/
│   │   │   └── formatters.ts
│   │   └── progression/
│   │       ├── achievementEvaluator.ts
│   │       ├── attributeCalculations.ts
│   │       ├── bossEvaluator.ts
│   │       ├── levelCalculations.ts
│   │       ├── prCalculations.ts
│   │       ├── rewardTokenGenerator.ts
│   │       └── xpCalculations.ts
│   └── tests/
│       └── archimedes.test.ts
└── functions/
    ├── package.json
    ├── tsconfig.json
    └── src/
        └── index.ts
```

---

## 7. Setup & Local Development

### 1. Prerequisites
- Node.js >= 18 (Tested on Node v24)
- npm >= 9

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your Firebase web app configuration in `.env`:
```ini
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

### 3. Install Dependencies
```bash
npm install
npm --prefix functions install
```

### 4. Run Automated Test Suite
```bash
npm test
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Build Production Bundle
```bash
npm run build
npm --prefix functions run build
```

---

## 8. Deployment Guide

### Frontend Deployment (Vercel)
1. Push your repository to GitHub.
2. Import project into Vercel.
3. Configure the Root Directory as `./` and build command as `npm run build`.
4. Add environment variables from `.env` in the Vercel dashboard.
5. Deploy. The included `vercel.json` provides SPA rewrites for all client routes (`/system`, `/quest`, `/stats`, `/progress`, `/profile`).

### Backend Deployment (Firebase)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Log in: `firebase login`
3. Link your project: `firebase use your-project-id`
4. Deploy Firestore Rules and Indexes:
   ```bash
   firebase deploy --only firestore
   ```
5. Deploy Storage Rules:
   ```bash
   firebase deploy --only storage
   ```
6. Deploy Cloud Functions:
   ```bash
   firebase deploy --only functions
   ```
