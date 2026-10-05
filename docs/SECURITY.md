# ARCHIMEDES — Security & Privacy Architecture

## 1. Core Threat Model & Privacy Standards

ARCHIMEDES is a private personal progression system. It explicitly rejects social features, public profiles, and community visibility:

1. **Zero Public Profiles**: There are no public user search endpoints, profile URLs, or sharing buttons.
2. **Zero Shared Collections**: All database records reside exclusively in subcollections under the operator's authenticated user document (`users/{uid}/...`).
3. **No Unauthenticated Reads or Writes**: Root database security rules reject all unauthenticated requests.
4. **Authoritative Calculation Boundaries**: Client applications submit raw physical telemetry (sets, reps, weight, duration); XP, level calculations, PR awards, and boss checks are computed authoritatively.

---

## 2. Authentication Model

- **Provider**: Exclusively **Google OAuth** via Firebase Authentication.
- **No Passwords**: Eliminates credential stuffing, password reuse, and database credential leaks.
- **Session Tokens**: Handled via standard Firebase ID Tokens with automatic short-lived token rotation.
- **Mobile-Safe Flow**: Uses redirect authentication where appropriate to prevent popup blocking on mobile Chrome/Android.

---

## 3. Cloud Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // 1. Global Deny-All Fallback
    match /{document=**} {
      allow read, write: if false;
    }

    // 2. Strict UID-Isolated User Realm
    match /users/{userId} {
      // Only the authenticated owner can read or write their user document
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;

      // Active workout sessions (in-progress temporary logs)
      match /activeSessions/{dateKey} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      // Finalized completed sessions (IMMUTABLE AUDIT LOG)
      match /sessions/{sessionId} {
        allow read: if request.auth != null && request.auth.uid == userId;
        allow create: if request.auth != null && request.auth.uid == userId;
        allow update, delete: if false; // Immutability guarantee
      }

      // Subcollections: Records, Checkpoints, Achievements, Bosses, Events, Rewards, Reports
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### Key Security Invariants
- **Per-Document UID Verification**: Every rule evaluates `request.auth.uid == userId`. No user can query or modify another user's path.
- **Audit Immutability**: Finalized completed sessions in `/sessions/{sessionId}` permit `create` but explicitly forbid `update` and `delete`, preventing score manipulation.

---

## 4. Firebase Storage Rules (`storage.rules`)

Progress photos contain sensitive personal physical imagery.

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Only the authenticated owner can access progress photos
    match /users/{userId}/progress/{checkpointId}/{photoType} {
      allow read, write, delete: if request.auth != null && request.auth.uid == userId;
    }

    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### EXIF Metadata Sanitation
Prior to upload, camera images are decoded into an offscreen HTML5 canvas element (`src/lib/compression/imageCompressor.ts`). This process inherently discards all EXIF metadata (GPS coordinates, timestamp data, device IDs) before WebP serialization.

---

## 5. Cloud Functions Authorization & Anti-Exploit Measures

### 5.1 Caller Identity Verification
Cloud Functions (`functions/src/index.ts`) verify caller tokens via `request.auth.uid`. If `params.uid !== request.auth.uid`, the call immediately aborts with `permission-denied`.

### 5.2 Finalization Idempotency
To prevent double-counting XP or duplicate token drops from network retries:
```typescript
const sessionDocRef = db.doc(`users/${uid}/sessions/${sessionId}`);
const existingSnap = await sessionDocRef.get();
if (existingSnap.exists) {
  throw new HttpsError('already-exists', 'Session for this date is already finalized.');
}
```

### 5.3 Client Untrusted Fields
The frontend never submits:
- `totalXP`
- `newLevel`
- `newRank`
- `systemPower`
- `rewardTokenGranted`

The server reads raw completed sets, compares them against stored baselines, and authoritatively writes the calculated progression.

---

## 6. Secrets & Environment Variable Management

- **Public Client Variables**:
  All `VITE_FIREBASE_*` variables in `.env` are baked into the frontend build. They identify the Firebase project but do not grant administrative access. Administrative rights are governed strictly by Firestore and Storage security rules.
- **Server Service Accounts**:
  No Firebase Admin SDK service account keys (`serviceAccountKey.json`) are stored or committed. Cloud Functions run under Google Cloud Default Application Credentials (ADC) with minimal IAM scopes.
- **Exclusion Safeguards**:
  `.gitignore` explicitly forbids committing any `.env`, `.env.*`, `serviceAccountKey.json`, or `firebase-adminsdk-*.json` files.

---

## 7. Permanent Account Deletion Workflow

In accordance with strict privacy requirements, the operator can permanently purge their account from the Profile view (`src/lib/firebase/db.ts:deleteEntireAccount`):

1. **Storage Purge**: Deletes all uploaded progress photo objects across all checkpoints.
2. **Subcollection Batch Deletion**: Atomically deletes all documents across 12 subcollections (`activeSessions`, `sessions`, `exerciseRecords`, `measurements`, `achievements`, `bosses`, `rewards`, `rewardTransactions`, `events`, `reports`, `milestoneReports`, `progressCheckpoints`).
3. **Root Document Deletion**: Deletes `users/{uid}`.
4. **Auth Revocation**: Signs the operator out and invalidates active session tokens.
