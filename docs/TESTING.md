# ARCHIMEDES — Testing & Quality Assurance Strategy

## 1. Automated Unit Test Suite

ARCHIMEDES includes a comprehensive automated test suite powered by [Vitest](https://vitest.dev/) (`src/tests/archimedes.test.ts`), covering all core mathematical and operational engines.

### Running Automated Tests
```bash
npm test
```

### Verified Test Suites (23 Total Passing Tests)
1. **Challenge Date Engine**:
   - `Day 1` verifies as Monday, 12 October 2026 (`SQUAT + BENCH STRENGTH A`, Base 300 XP, `day001` checkpoint).
   - `Day 30` verifies as Tuesday, 10 November 2026 with `boss_iron_gate` unlock and `day030` checkpoint.
   - `Day 60` verifies as Thursday, 10 December 2026 (`day060` checkpoint).
   - `Day 90` verifies as Saturday, 09 January 2027 (`day090` checkpoint).
   - `Day 120` verifies as Monday, 08 February 2027 (`SQUAT + BENCH STRENGTH A`, Base 300 XP, protocol culmination).
   - Boundary checks confirm dates before 12 Oct 2026 and after 08 Feb 2027 are properly flagged outside challenge window.
2. **Progression & XP Engine**:
   - Base XP mapping verified for each weekday: Mon (300), Tue (200), Wed (300), Thu (200), Fri (300), Sat (250), Sun (100).
   - Reduced sessions correctly award ~60% XP (180, 120, 150, 60 XP).
   - Exception handling:
     - `SICK`: 0 XP, streak paused, consistency maintained.
     - `GYM_CLOSED`, `COLLEGE_EXAM`, `TRAVEL`, `GENUINELY_UNAVOIDABLE`: 75 XP (minimum viable walk & mobility), consistency maintained.
     - `INJURY_PAIN`: 0 XP, streak paused, consistency maintained.
     - `NORMAL_MISS`: 0 XP, training streak reset to 0, consistency streak reset to 0.
   - Daily mission completes with +25 XP bonus.
3. **Level Progression Formulas**:
   - Incremental formula verified: $\Delta\text{XP} = 250 + 40 \times (N - 1)$.
   - Cumulative thresholds verified: $(L - 1) \times 250 + 20 \times (L - 1) \times (L - 2)$.
   - Sub-level XP tracking and percentage completion calculations.
4. **Personal Record (PR) Detection Engine**:
   - Weight PR detected when logged load surpasses historical high (+50 XP).
   - Unearned or duplicate loads do not trigger false PRs.
   - PR bonus strictly respects the 150 XP ceiling per session.
5. **Boss Quest Verification**:
   - Verifies Iron Gate defeat when 85 kg × 8 reps is logged.
   - Ensures boss remains locked if logged reps or loads fall below threshold.
   - Enforces single-grant reward idempotency.
6. **System Power & Attribute Calculations**:
   - Weighted composite formula clamped between 0 and 100.
   - Rank tier boundaries (`E`, `D`, `C`, `B`, `A`, `S`).
7. **Reward Token Generation**:
   - Enforces weekly 2-token cap.
   - Validates deterministic bad-luck protection triggering guaranteed drops after 4 dry sessions.

---

## 2. Integration Testing

### 2.1 Online Session Synchronization
- Verified in `UserProgressionContext.tsx` via Firestore `onSnapshot` listener.
- When an operator completes a set on their mobile device, the active session document (`users/{uid}/activeSessions/{dateKey}`) updates in real time.
- Refreshing the browser or killing the mobile app tab restores the active session in progress without data loss.

### 2.2 Finalization & Idempotency
- Calling `finalizeWorkoutSession` writes an immutable record to `users/{uid}/sessions/{sessionId}` and deletes the active session.
- Repeating a finalization call for an already-finalized date triggers an `already-exists` HttpsError or prevents duplicate credit.

---

## 3. Security & Isolation Testing

### 3.1 UID Scope Testing
- Verified against `firestore.rules` and `storage.rules`.
- A request with `request.auth.uid = 'userA'` attempting to read, update, or delete `users/userB/...` is rejected with `PERMISSION_DENIED`.

### 3.2 Immutability Testing
- Finalized sessions in `/sessions/{sessionId}` reject all `update` and `delete` operations.

---

## 4. Mobile & Touch Ergonomics Testing (OPPO A54 Target)

### 4.1 Viewport Responsiveness
Tested across critical mobile viewports:
- **320px width**: Small legacy screens. Elements stack without horizontal scroll.
- **360px width**: Android baseline.
- **390px – 412px width**: Modern Android and iOS devices.
- **768px – 1024px+**: Tablet and desktop views expand cleanly with centered instrument telemetry.

### 4.2 Touch Targets & Keyboard Types
- All primary buttons exceed the 44px minimum comfortable touch target.
- Set logging inputs explicitly declare `inputMode="decimal"` and `inputMode="numeric"` to automatically trigger numeric keyboards on Android, eliminating alpha keyboard switching in the gym.

### 4.3 Rest Timer Background Verification
- The Rest Timer utilizes epoch timestamp checks (`targetEndTime`) rather than interval ticks.
- Tested: Locking the device or navigating away for 2 minutes and resuming correctly advances the countdown without freezing.

---

## 5. Performance Budget & Bundle Analysis

Running `npm run build` confirms tight bundle sizes with route-level chunk splitting:
```text
dist/index.html                           1.92 kB │ gzip:   0.89 kB
dist/assets/index-iiPCVKz3.css            6.15 kB │ gzip:   1.78 kB
dist/assets/StatsScreen-CNlJH5sr.js      10.80 kB │ gzip:   2.70 kB
dist/assets/ProgressScreen-BPi8tRsW.js   10.96 kB │ gzip:   3.05 kB
dist/assets/ProfileScreen-Cz1fftd6.js    53.13 kB │ gzip:  10.30 kB
dist/assets/index-Bfu84zpZ.js           311.61 kB │ gzip:  92.74 kB
dist/assets/firebase-BZlonyMK.js        516.59 kB │ gzip: 122.75 kB
```
Zero continuous CPU loops when idle ensure minimal battery drain on the target device.
