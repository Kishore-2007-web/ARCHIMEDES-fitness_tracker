# ARCHIMEDES — Progression System Specification

## 1. Mathematical Level Formulas

System levels scale continuously from Level 1 up to Level 50 and beyond. The XP required to level up grows deterministically with each completed rank tier.

### 1.1 XP Required for Increment ($N \to N + 1$)
$$\Delta\text{XP}(N) = 250 + 40 \times (N - 1)$$

| Transition | Calculation | Increment |
| :--- | :--- | :--- |
| **Level 1 → 2** | $250 + 40 \times 0$ | 250 XP |
| **Level 2 → 3** | $250 + 40 \times 1$ | 290 XP |
| **Level 3 → 4** | $250 + 40 \times 2$ | 330 XP |
| **Level 4 → 5** | $250 + 40 \times 3$ | 370 XP |
| **Level 10 → 11** | $250 + 40 \times 9$ | 610 XP |
| **Level 20 → 21** | $250 + 40 \times 19$ | 1,010 XP |

### 1.2 Cumulative XP Threshold to Reach Level $L$
$$\text{Cumulative}(L) = (L - 1) \times 250 + 20 \times (L - 1) \times (L - 2)$$

```text
Level 01: 0 XP
Level 02: 250 XP
Level 03: 540 XP
Level 04: 870 XP
Level 05: 1,240 XP
Level 10: 4,050 XP
Level 20: 12,350 XP
Level 30: 24,650 XP
Level 50: 60,850 XP
```

---

## 2. Experience Point (XP) Rules

Opening ARCHIMEDES awards strictly **0 XP**. XP is awarded authoritatively only upon session finalization.

### 2.1 Base Workout XP
- **Monday**: 300 XP
- **Tuesday**: 200 XP
- **Wednesday**: 300 XP
- **Thursday**: 200 XP
- **Friday**: 300 XP
- **Saturday**: 250 XP
- **Sunday**: 100 XP

### 2.2 Reduced Sessions (~60% Base Yield)
For low-motivation sessions reduced under the 10-Minute Warm-up Rule:
- 300 XP → **180 XP**
- 250 XP → **150 XP**
- 200 XP → **120 XP**
- 100 XP → **60 XP**

### 2.3 Minimum Viable Day
For unavoidable scheduling conflicts where the user completes 10–15 min mobility and a 20–30 min walk:
- Award: **75 XP**
- Status: **CONSISTENCY STATUS MAINTAINED**

### 2.4 Daily Mission Objective
Every challenge day presents a focused objective within the scheduled workout:
- Award: **+25 XP**

### 2.5 Streak Milestone Bonuses (Single Grant Only)
Awarded the first time a consistency streak reaches a milestone:
- **7 Days**: +100 XP
- **14 Days**: +150 XP
- **30 Days**: +300 XP
- **60 Days**: +500 XP
- **90 Days**: +800 XP
- **120 Days**: +1,500 XP

---

## 3. Personal Record (PR) Detection Engine

PRs are automatically evaluated during session finalization against prior historical records and the Day 1 baseline.

### 3.1 PR Categories & Bonus XP
1. **Weight PR (+50 XP)**: Verified load exceeds previous historical high.
2. **Rep PR (+25 XP)**: Rep count at the same or greater weight exceeds prior best.
3. **Volume PR (+25 XP)**: Total exercise session volume $\sum(\text{weight} \times \text{reps})$ exceeds prior high.
4. **Duration PR (+25 XP)**: Continuous isometric hold duration exceeds prior high.
5. **Assistance PR (+25 XP)**: Lower machine/band assistance at equivalent or higher repetitions.

### 3.2 Anti-Exploit Capping
- **Session PR Bonus Cap**: Maximum **150 XP** per session from combined PR bonuses.
- **Data Validation**: Zero, negative, or malformed inputs are discarded.

---

## 4. Attributes, System Power & Rank Tiers

### 4.1 Primary Attributes
Six attributes start at **20** and max at **100**:
- `STR` (Strength)
- `END` (Endurance)
- `AGI` (Agility)
- `MOB` (Mobility)
- `DIS` (Discipline)
- `FOC` (Focus)

### 4.2 Weighted Attribute Composite
$$\text{Composite} = \text{STR} \times 0.20 + \text{END} \times 0.15 + \text{AGI} \times 0.15 + \text{MOB} \times 0.15 + \text{DIS} \times 0.20 + \text{FOC} \times 0.15$$

### 4.3 System Power Calculation
System Power combines physical attributes, consistency, workout completion, benchmark evolution, and boss victories:
$$\text{System Power} = \text{Composite} \times 0.35 + \text{Consistency} \times 0.20 + \text{Completion} \times 0.20 + \text{Performance} \times 0.15 + \text{Boss} \times 0.10$$
*Clamped strictly between 0 and 100.*

### 4.4 Rank Tiers
| Rank | System Power Range | Description |
| :--- | :--- | :--- |
| **E** | 0 – 24 | Baseline operator level |
| **D** | 25 – 39 | Established routine & initial adaptation |
| **C** | 40 – 54 | Intermediate structural conditioning |
| **B** | 55 – 69 | Advanced performance & steady consistency |
| **A** | 70 – 84 | High-tier mastery & physical capacity |
| **S** | 85 – 100 | Culmination protocol achievement |

---

## 5. Boss Quests

Bosses cannot be manually marked complete; completion requires verifiable proof in workout logs.

| Boss | Day | Target Metric | Rewards |
| :--- | :--- | :--- | :--- |
| **Kinetic Threshold** | 14 | 14-day unbroken consistency | +400 XP, +3 DIS |
| **Iron Gate** | 30 | Back Squat 85 kg × 8 (or Deadlift 85 kg × 8) | +500 XP, +5 STR, Token ×1, Title: *BOSS BREAKER* |
| **Steel Grip** | 45 | Dead Hang 60 seconds continuous | +450 XP, +3 END |
| **The Monolith** | 60 | Conventional Deadlift 95 kg × 5 | +700 XP, +6 STR, Token ×1, Title: *IRON DISCIPLE* |
| **Agility Tempest** | 75 | Jump Rope 15 min continuous cadence | +500 XP, +4 AGI |
| **Gravity Breaker** | 90 | Push-ups 15 strict unbroken reps | +800 XP, +6 END, Token ×1 |
| **Unbreakable Chain**| 105| 105-day unbroken consistency | +600 XP, +5 DIS |
| **Archimedes Core** | 120| Final Challenge Completion | +1,500 XP, +10 FOC, Token ×3, Title: *ASCENDED* |

---

## 6. System Feature Unlocks by Level

Essential workout logging is never locked. Secondary system tools unlock progressively:
- **Level 1**: Core Workout Engine & Real-time Set Logger
- **Level 2**: Detailed Historical Exercise Logs
- **Level 5**: Title Equipment & Profile Designations
- **Level 8**: Advanced Personal Record Archive
- **Level 10**: Boss Quest Archive & Telegraphs
- **Level 15**: Advanced Weekly Analytical Reports
- **Level 20**: Reward Vault & Custom Self-Treats
- **Level 25**: Extended Multi-Checkpoint Progress Analysis
- **Level 30**: Final Phase Culmination Preview

---

## 7. Controlled Random Rewards & Vault

- **Weekly Drop Cap**: Maximum ~2 token drops per week.
- **Deterministic Bad-Luck Protection**: If an operator completes 4 full workouts without a token drop, the 5th session guarantees a reward token drop (provided the weekly ceiling is not reached).
- **Self-Treat Redemption**: Tokens can be redeemed for operator-defined treats (e.g., Movie Night, Gaming Session, Favorite Feast, Personal Gear).
