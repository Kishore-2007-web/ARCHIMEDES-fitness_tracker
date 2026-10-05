# ARCHIMEDES — Deployment Guide

## 1. Architecture Split

ARCHIMEDES employs a modern decoupled architecture:
- **Frontend SPA**: Hosted on [Vercel](https://vercel.com/) with SPA route rewrites.
- **Backend & Persistence**: Hosted on [Google Firebase](https://firebase.google.com/) (Authentication, Cloud Firestore, Cloud Storage, Cloud Functions, and Cloud Messaging).

---

## 2. Firebase Backend Setup

### 2.1 Project Creation
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project**, name it (e.g., `archimedes-tracker`), and disable Google Analytics if not needed.
3. In Project Settings, register a **Web Application** and copy the configuration snippet.

### 2.2 Google Authentication Configuration
1. In the Firebase Console, navigate to **Build** → **Authentication**.
2. Click **Get Started**, choose **Google** under Sign-in providers, and enable it.
3. Add your authorized domains:
   - `localhost` (for local development)
   - `your-vercel-domain.vercel.app` (for production)

### 2.3 Cloud Firestore Setup
1. In the console, navigate to **Build** → **Firestore Database**.
2. Click **Create database**, select a region close to your user (e.g., `asia-south1` Mumbai).
3. Start in production mode.

### 2.4 Cloud Storage Setup
1. Navigate to **Build** → **Storage**.
2. Click **Get Started**, select the same regional location (`asia-south1`).

### 2.5 Deploying Security Rules & Functions via CLI
Install the Firebase CLI and log in:
```bash
npm install -g firebase-tools
firebase login
```

Link your project:
```bash
firebase use your-firebase-project-id
```

Deploy Firestore Security Rules and Indexes:
```bash
firebase deploy --only firestore
```

Deploy Storage Rules:
```bash
firebase deploy --only storage
```

Deploy Cloud Functions:
```bash
npm --prefix functions install
npm --prefix functions run build
firebase deploy --only functions
```

---

## 3. Frontend Deployment to Vercel

### 3.1 Vercel Import
1. Push your repository to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **Add New...** → **Project**.
3. Select your `ARCHIMEDES-fitness_tracker` repository.

### 3.2 Build & Output Settings
- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Environment Variables
Configure the environment variables in the Vercel project dashboard under **Settings** → **Environment Variables**:

| Variable Name | Example / Description |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | From Firebase Web App configuration |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `your-project` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`| Sender ID number from Firebase |
| `VITE_FIREBASE_APP_ID` | `1:1234567890:web:abcdef123456` |
| `VITE_FIREBASE_VAPID_KEY` | Optional Web Push VAPID key from FCM tab |

### 3.4 SPA Routing Rewrites (`vercel.json`)
The included `vercel.json` ensures that direct navigations to deep routes (`/system`, `/quest`, `/stats`, `/progress`, `/profile`) resolve to `index.html`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 4. Progressive Web App (PWA) Verification

1. Open the deployed application URL in Google Chrome on your target Android device (e.g., OPPO A54).
2. Authenticate with your Google account and complete Day 1 onboarding.
3. Tap the **INSTALL ARCHIMEDES** prompt or the Chrome menu (three dots) → **Install app / Add to Home screen**.
4. Launch ARCHIMEDES from the home screen: it will launch in standalone display mode with a black status bar and offline static asset caching.
