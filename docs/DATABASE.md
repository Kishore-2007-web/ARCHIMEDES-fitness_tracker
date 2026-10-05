# ARCHIMEDES — Database & Storage Specification

## 1. Overview & Data Ownership

All data in ARCHIMEDES is strictly scoped to the authenticated operator's Firebase UID. No public, shared, or top-level unauthenticated collections exist.

```text
Firestore Root
└── users/
    └── {uid}/                          [User Profile Document]
        ├── activeSessions/{dateKey}    [In-progress workout logs]
        ├── sessions/{sessionId}        [Immutable finalized session records]
        ├── exerciseRecords/{recordId}  [Historical lift and benchmark logs]
        ├── achievements/{achievementId}[Achievement unlock states]
        ├── bosses/{bossId}             [Boss quest completion states]
        ├── rewards/{rewardId}          [Custom user-defined reward items]
        ├── rewardTransactions/{txId}   [Token acquisition and redemption ledger]
        ├── events/{eventId}            [System audit trail feed]
        ├── progressCheckpoints/{cpId}  [Checkpoints: Day 1, 30, 60, 90, 124]
        ├── measurements/{measId}       [Body measurement logs]
        ├── reports/{reportId}          [Cached weekly performance summaries]
        └── milestoneReports/{reportId} [Cached milestone reports]
```

---

## 2. Firestore Document Schemas

### 2.1 User Profile Document
- **Path**: `users/{uid}`
- **Purpose**: Authoritative progression metrics, baseline records, and user settings.
- **Ownership**: Read/Write restricted to `request.auth.uid == uid`.

| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | `string` | Unique Firebase Authentication user ID |
| `displayName` | `string` | Operator display name (defaults to "SYSTEM USER") |
| `email` | `string` | Operator Google account email |
| `photoURL` | `string` | Optional Google avatar URL |
| `challengeStart` | `string` | Fixed ISO date: `'2026-10-07'` |
| `challengeEnd` | `string` | Fixed ISO date: `'2027-02-07'` |
| `timezone` | `string` | Fixed challenge timezone: `'Asia/Kolkata'` |
| `level` | `number` | Current system level (1 to 50+) |
| `xp` | `number` | Cumulative lifetime experience points |
| `rank` | `string` | Current rank tier: `'E'`, `'D'`, `'C'`, `'B'`, `'A'`, `'S'` |
| `systemPower` | `number` | Weighted composite score (0–100) |
| `trainingStreak` | `number` | Consecutive completed workout days |
| `longestTrainingStreak` | `number` | Longest recorded training streak |
| `consistencyStreak` | `number` | Consecutive days with verified training or approved exceptions |
| `longestConsistencyStreak` | `number` | Longest recorded consistency streak |
| `attributes` | `map` | Six primary progression attributes (each 20–100): `strength`, `endurance`, `agility`, `mobility`, `discipline`, `focus` |
| `baseline` | `map` | Initial Day 1 baseline: `bodyWeightKg`, `waistIn`, `maxPushUps`, `maxPullUps`, `maxPlankSec`, `squatBestWeightKg`, `squatBestReps`, `benchBestWeightKg`, `benchBestReps`, `deadliftBestWeightKg`, `deadliftBestReps` |
| `settings` | `map` | User preferences: `reminderEnabled` (bool), `reminderTime` (string `'17:30'`), `reducedMotion` (bool) |
| `rewardTokens` | `number` | Available unredeemed reward tokens in vault |
| `currentTitle` | `string` | Currently equipped cosmetic title (e.g., `'INITIATE'`, `'IRON DISCIPLE'`) |
| `onboardingComplete` | `boolean` | Indicates whether Day 1 baseline & photos are completed |
| `day1PhotosComplete` | `boolean` | Indicates whether Day 1 photos are uploaded |
| `createdAt` | `string` | ISO 8601 creation timestamp |
| `updatedAt` | `string` | ISO 8601 last update timestamp |

---

### 2.2 Active Session Document
- **Path**: `users/{uid}/activeSessions/{dateKey}` (e.g., `dateKey = '2026-10-07'`)
- **Purpose**: Persists in-progress workout sets online so workouts can resume if the browser is reloaded or the mobile app is backgrounded.
- **Ownership**: Read/Write restricted to `request.auth.uid == uid`. Deleted upon finalization.

| Field | Type | Description |
| :--- | :--- | :--- |
| `date` | `string` | Date string (`YYYY-MM-DD`) |
| `dayNumber` | `number` | Challenge day number (1 to 124) |
| `scheduleId` | `string` | Schedule identifier (e.g., `'strength_a'`, `'deadlift_strength'`) |
| `startedAt` | `string` | ISO timestamp of session initiation |
| `status` | `string` | `'in_progress'` |
| `exercises` | `map` | Map of exercise ID to `{ sets: LoggedSet[] }` where each set contains `setNumber`, `weightKg`, `reps`, `durationSec`, `assistanceKg`, and `completedAt` |
| `blocks` | `map` | Checklist states: `preparationComplete` (bool), `recoveryComplete` (bool), `walkingComplete` (bool) |
| `dailyMissionStatus` | `string` | `'pending'` or `'completed'` |

---

### 2.3 Finalized Completed Session Document
- **Path**: `users/{uid}/sessions/{sessionId}` (e.g., `sessionId = 'session_2026-10-07'`)
- **Purpose**: Immutable audit log of a finalized training session or approved exception.
- **Ownership**: Read and Create allowed by authenticated owner; Update and Delete explicitly disallowed to ensure audit integrity.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique session ID: `'session_YYYY-MM-DD'` |
| `date` | `string` | Challenge date (`YYYY-MM-DD`) |
| `dayNumber` | `number` | Day number (1 to 124) |
| `scheduleId` | `string` | Schedule ID |
| `weekday` | `number` | Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday) |
| `status` | `string` | Final status: `'completed'`, `'reduced'`, `'exception'`, or `'missed'` |
| `reason` | `string` | Exception reason if applicable (e.g., `'SICK'`, `'GYM_CLOSED'`, `'COLLEGE_EXAM'`, `'TRAVEL'`, `'INJURY_PAIN'`, `'LOW_MOTIVATION'`, `'NORMAL_MISS'`) |
| `baseXP` | `number` | Base session XP earned |
| `bonusXP` | `number` | Total bonuses (daily mission + streak + PR + boss) |
| `totalXP` | `number` | Final computed experience points |
| `dailyMissionCompleted` | `boolean` | Whether daily objective was achieved |
| `performanceBonus` | `number` | Total XP from PRs (capped at 150 XP) |
| `streakBonus` | `number` | Milestone streak bonus if unlocked |
| `bossBonus` | `number` | Boss quest XP if defeated |
| `randomRewardTokenGranted` | `boolean` | Indicates if a controlled random reward token was dropped |
| `prs` | `array` | List of detected PR objects (`exerciseId`, `type`, `previousValue`, `newValue`, `xpAwarded`) |
| `totalSets` | `number` | Sum of all completed working sets |
| `totalVolume` | `number` | Sum of (weight × reps) across all exercises |
| `completedAt` | `string` | ISO timestamp of finalization |

---

### 2.4 Exercise Historical Record
- **Path**: `users/{uid}/exerciseRecords/{recordId}` (e.g., `rec_back_squat_2026-10-07`)
- **Purpose**: Fast chronological queries of performance history and Last Session lookups per movement.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Document ID: `'rec_{exerciseId}_{date}'` |
| `exerciseId` | `string` | Identifier matching schedule exercise (e.g., `'back_squat'`) |
| `exerciseName` | `string` | Display name of exercise |
| `date` | `string` | Date of performance (`YYYY-MM-DD`) |
| `dayNumber` | `number` | Challenge day number (1 to 124) |
| `bestWeight` | `number` | Highest working weight in session |
| `bestReps` | `number` | Reps completed at maximum weight |
| `bestDurationSec`| `number` | Best duration hold if applicable |
| `totalVolume` | `number` | Cumulative volume (weight × reps) |
| `isPR` | `boolean` | True if this record set a new Personal Record |
| `sets` | `array` | Array of completed sets in this session |

---

### 2.5 Progress Checkpoints
- **Path**: `users/{uid}/progressCheckpoints/{checkpointId}`
- **Valid IDs**: `'day001'`, `'day030'`, `'day060'`, `'day090'`, `'day124'`
- **Purpose**: Physical baseline and evolution audits.

| Field | Type | Description |
| :--- | :--- | :--- |
| `checkpointId` | `string` | `'day001'` through `'day124'` |
| `dayNumber` | `number` | 1, 30, 60, 90, or 124 |
| `date` | `string` | Date of checkpoint |
| `bodyWeightKg` | `number` | Recorded body weight |
| `waistIn` | `number` | Recorded waist circumference |
| `maxPushUps` | `number` | Push-up test result |
| `maxPullUps` | `number` | Pull-up test result |
| `maxPlankSec` | `number` | Plank test result |
| `photos` | `map` | Download URLs: `{ front: string, side: string, back: string }` |
| `photosComplete` | `boolean` | True when all three photos are present |

---

### 2.6 Achievements & Bosses
- **Achievements (`users/{uid}/achievements/{achievementId}`)**: Stores `id`, `title`, `description`, `isSecret`, `category`, `xpReward`, `unlocked` (bool), and `unlockedAt`.
- **Boss Quests (`users/{uid}/bosses/{bossId}`)**: Stores `id`, `dayNumber`, `title`, `targetMetric`, `reward` (xp, tokens, attributeBonus, title), `status` (`'locked'`, `'available'`, `'completed'`), and `rewardGranted` (ensures single-grant idempotency).

---

### 2.7 System Events Audit Trail
- **Path**: `users/{uid}/events/{eventId}`
- **Purpose**: Recent chronological audit feed displayed on the System home screen (limited to 50 most recent events).
- **Fields**: `id`, `type` (`'SESSION_COMPLETE'`, `'PR_DETECTED'`, `'LEVEL_UP'`, `'BOSS_COMPLETE'`, `'ACHIEVEMENT_UNLOCKED'`, `'REWARD_TOKEN'`), `title`, `detail`, `timestamp`.

---

## 3. Storage Architecture (Progress Photos)

### Path Structure
```text
users/{uid}/progress/{checkpointId}/{photoType}.webp
```
Examples:
- `users/abc123xyz/progress/day001/front.webp`
- `users/abc123xyz/progress/day001/side.webp`
- `users/abc123xyz/progress/day001/back.webp`
- `users/abc123xyz/progress/day030/front.webp`
- `users/abc123xyz/progress/day124/back.webp`

### Storage Invariants
1. **Private Ownership**: Enforced by `storage.rules`:
   ```javascript
   match /users/{userId}/progress/{checkpointId}/{photoType} {
     allow read, write, delete: if request.auth != null && request.auth.uid == userId;
   }
   ```
2. **Metadata Hygiene**: Client-side canvas compression strips all EXIF metadata (GPS coordinates, camera serial numbers, device models) before upload.
3. **Format**: All photos are normalized to modern `image/webp`.
4. **Account Purge**: Triggering account deletion completely deletes all files under `users/{uid}/progress/`.

---

## 4. Firestore Indexes (`firestore.indexes.json`)

To ensure fast query response times on low-end mobile devices without full collection scans, the following composite indexes are configured:

```json
{
  "indexes": [
    {
      "collectionGroup": "exerciseRecords",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "exerciseId", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "dayNumber", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ]
}
```
