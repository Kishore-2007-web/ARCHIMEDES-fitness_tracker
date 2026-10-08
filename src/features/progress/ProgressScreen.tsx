import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUserProgression } from '../../context/UserProgressionContext';
import { getProgressCheckpoints, getCompletedSessions, getExerciseHistory, saveProgressCheckpoint } from '../../lib/firebase/db';
import { uploadProgressPhoto } from '../../lib/firebase/storage';
import { compressAndStripExif } from '../../lib/compression/imageCompressor';
import { ProgressCheckpoint, ExerciseHistoricalRecord } from '../../types/progress';
import { CompletedSession } from '../../types/workout';
import { Button } from '../../components/common/Button';
import { padDayNumber } from '../../lib/formatting/formatters';
import { getDateStringForDayNumber, getChallengeDay, TOTAL_CHALLENGE_DAYS } from '../../lib/dates/challengeDates';

type CheckpointId = 'day001' | 'day030' | 'day060' | 'day090' | 'day124';

const CHECKPOINTS_CONFIG: { id: CheckpointId; label: string; day: number }[] = [
  { id: 'day001', label: 'Day 1', day: 1 },
  { id: 'day030', label: 'Day 30', day: 30 },
  { id: 'day060', label: 'Day 60', day: 60 },
  { id: 'day090', label: 'Day 90', day: 90 },
  { id: 'day124', label: 'Day 124', day: 124 }
];

export const ProgressScreen: React.FC = () => {
  const { currentUser, userProfile, updateProfileData } = useAuth();
  const {
    challengeDay,
    selectedDayNumber,
    setSelectedDayNumber,
    completedDays,
    recentlyCompletedDay,
    toggleDayCompletion
  } = useUserProgression();

  const [checkpoints, setCheckpoints] = useState<Record<string, ProgressCheckpoint>>({});
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistoricalRecord[]>([]);

  // Selected photo checkpoint
  const [activeCheckpointView, setActiveCheckpointView] = useState<CheckpointId | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Manual measurement update state
  const [isEditingMeasurements, setIsEditingMeasurements] = useState(false);
  const [newWeight, setNewWeight] = useState<number>(userProfile?.baseline.bodyWeightKg ?? 109);
  const [newWaist, setNewWaist] = useState<number>(userProfile?.baseline.waistIn ?? 44);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      getProgressCheckpoints(currentUser.uid),
      getCompletedSessions(currentUser.uid),
      getExerciseHistory(currentUser.uid, undefined, 50)
    ]).then(([cps, sess, recs]) => {
      setCheckpoints(cps);
      setCompletedSessions(sess);
      setExerciseHistory(recs);
    });
  }, [currentUser]);

  if (!userProfile) return null;

  const baseline = userProfile.baseline;

  // Best recorded lifts
  const getBestForExercise = (exerciseId: string) => {
    const matches = exerciseHistory.filter((r) => r.exerciseId === exerciseId);
    let bestW = 0;
    let bestR = 0;
    matches.forEach((m) => {
      if ((m.bestWeight ?? 0) > bestW) {
        bestW = m.bestWeight ?? 0;
        bestR = m.bestReps ?? 0;
      }
    });
    return { weight: bestW, reps: bestR };
  };

  const squatBest = getBestForExercise('back_squat');
  const benchBest = getBestForExercise('bench_press');
  const deadliftBest = getBestForExercise('conventional_deadlift');

  // Photo upload handler
  const handlePhotoUpload = async (
    cpId: CheckpointId,
    type: 'front' | 'side' | 'back',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploadingPhoto(true);
    setUploadError(null);

    const targetDay = cpId === 'day001' ? 1 : cpId === 'day030' ? 30 : cpId === 'day060' ? 60 : cpId === 'day090' ? 90 : 124;

    try {
      const { blob } = await compressAndStripExif(file);
      const url = await uploadProgressPhoto(currentUser.uid, cpId, type, blob);

      const existingCp = checkpoints[cpId] || {
        checkpointId: cpId,
        dayNumber: targetDay,
        date: getDateStringForDayNumber(targetDay),
        photos: {},
        photosComplete: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedPhotos = { ...existingCp.photos, [type]: url };
      const photosComplete = Boolean(updatedPhotos.front && updatedPhotos.side && updatedPhotos.back);

      const updatedCp: ProgressCheckpoint = {
        ...existingCp,
        photos: updatedPhotos,
        photosComplete,
        updatedAt: new Date().toISOString()
      };

      await saveProgressCheckpoint(currentUser.uid, updatedCp);
      setCheckpoints((prev) => ({ ...prev, [cpId]: updatedCp }));
    } catch (err: any) {
      setUploadError(err.message || 'Photo upload failed.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveMeasurements = async () => {
    if (!currentUser) return;
    await updateProfileData({
      baseline: {
        ...userProfile.baseline,
        bodyWeightKg: newWeight,
        waistIn: newWaist
      }
    });
    setIsEditingMeasurements(false);
  };

  // Calendar session map
  const sessionStatusMap = new Map<number, string>();
  completedSessions.forEach((s) => {
    sessionStatusMap.set(s.dayNumber, s.status);
  });

  // Current active / upcoming challenge day based on dynamic completedDays state
  const currentDayNumber = completedDays.includes(challengeDay.dayNumber)
    ? Math.min(TOTAL_CHALLENGE_DAYS, Math.max(0, ...completedDays) + 1)
    : challengeDay.dayNumber;

  // Selected calendar day info
  const selectedDateStr = getDateStringForDayNumber(selectedDayNumber);
  const selectedDayInfo = getChallengeDay(selectedDateStr);

  return (
    <div className="anim-fade-in">
      {/* TOP HEADER */}
      <div style={{ marginBottom: '20px' }}>
        <div className="font-mono flex-between" style={{ marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
            ARCHIMEDES // EVOLUTION
          </span>
          <span style={{ fontSize: '12px', fontWeight: 800 }}>
            DAY {padDayNumber(challengeDay.dayNumber)} / {TOTAL_CHALLENGE_DAYS}
          </span>
        </div>
        <h1 className="font-mono" style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '0.04em', margin: '4px 0 2px 0' }}>
          REAL-WORLD PROGRESS
        </h1>
        <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {TOTAL_CHALLENGE_DAYS}-DAY PHYSICAL & PERFORMANCE AUDIT
        </div>
      </div>

      {/* 1. BODY MEASUREMENTS */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>BODY</span>
          <button
            type="button"
            className="sys-btn sys-btn-subtle"
            style={{ width: 'auto', minHeight: '28px', padding: '2px 8px', fontSize: '10px' }}
            onClick={() => setIsEditingMeasurements(!isEditingMeasurements)}
          >
            {isEditingMeasurements ? 'CANCEL' : 'UPDATE'}
          </button>
        </div>

        {isEditingMeasurements ? (
          <div style={{ padding: '6px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  WEIGHT (KG)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="sys-input"
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  WAIST (INCHES)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="sys-input"
                  value={newWaist}
                  onChange={(e) => setNewWaist(Number(e.target.value))}
                />
              </div>
            </div>
            <Button variant="inverted" onClick={handleSaveMeasurements}>
              SAVE MEASUREMENTS
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ borderLeft: '2px solid #ffffff', paddingLeft: '10px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>WEIGHT</div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                109 kg → {baseline.bodyWeightKg} kg
              </div>
            </div>

            <div style={{ borderLeft: '2px solid #ffffff', paddingLeft: '10px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>WAIST</div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                44 in → {baseline.waistIn} in
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. PERFORMANCE */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>PERFORMANCE</span>
          <span className="sys-tag">CAPACITY</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div style={{ border: '1px solid var(--border-subtle)', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PUSH-UPS</div>
            <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px' }}>
              3 → {baseline.maxPushUps}
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-subtle)', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PULL-UPS</div>
            <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px' }}>
              0 → {baseline.maxPullUps}
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-subtle)', padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PLANK</div>
            <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '4px' }}>
              30s → {baseline.maxPlankSec}s
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY LIFTS */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>KEY LIFTS</span>
          <span className="sys-tag">BASELINE → BEST</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="flex-between" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
            <span style={{ fontWeight: 700 }}>Squat</span>
            <span style={{ fontWeight: 800 }}>
              80 kg × 8 → {squatBest.weight > 0 ? `${squatBest.weight} kg × ${squatBest.reps}` : `${baseline.squatBestWeightKg} kg × ${baseline.squatBestReps}`}
            </span>
          </div>

          <div className="flex-between" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
            <span style={{ fontWeight: 700 }}>Bench</span>
            <span style={{ fontWeight: 800 }}>
              30 kg × 12 → {benchBest.weight > 0 ? `${benchBest.weight} kg × ${benchBest.reps}` : `${baseline.benchBestWeightKg} kg × ${baseline.benchBestReps}`}
            </span>
          </div>

          <div className="flex-between">
            <span style={{ fontWeight: 700 }}>Deadlift</span>
            <span style={{ fontWeight: 800 }}>
              80 kg × 8 → {deadliftBest.weight > 0 ? `${deadliftBest.weight} kg × ${deadliftBest.reps}` : `${baseline.deadliftBestWeightKg} kg × ${baseline.deadliftBestReps}`}
            </span>
          </div>
        </div>
      </section>

      {/* 4. PHOTO TIMELINE */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>PHOTO TIMELINE</span>
          <span className="sys-tag">5 CHECKPOINTS</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center' }}>
          {CHECKPOINTS_CONFIG.map(({ id: cpId, label }) => {
            const cp = checkpoints[cpId];
            const isComplete = cp?.photosComplete;
            const isSelected = activeCheckpointView === cpId;

            return (
              <button
                key={cpId}
                type="button"
                className="sys-btn sys-btn-subtle"
                style={{
                  minHeight: '44px',
                  padding: '4px',
                  border: isComplete ? '1px solid #ffffff' : '1px dashed var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--bg-inverted)' : 'transparent',
                  color: isSelected ? 'var(--text-inverted)' : 'inherit'
                }}
                onClick={() => setActiveCheckpointView(isSelected ? null : cpId)}
              >
                <div style={{ fontSize: '10px', fontWeight: 800 }}>{label}</div>
                <div style={{ fontSize: '9px', marginTop: '2px', opacity: 0.8 }}>
                  {isComplete ? '✓' : '+ ADD'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Checkpoint Photo Modal / Section */}
        {activeCheckpointView && (
          <div className="sys-section anim-scale-in" style={{ marginTop: '14px', backgroundColor: 'var(--bg-primary)' }}>
            <div className="sys-section-title">
              <span>{activeCheckpointView.toUpperCase()} PHOTOS</span>
              <button
                type="button"
                className="sys-btn sys-btn-subtle"
                style={{ width: 'auto', minHeight: '24px', padding: '0 6px', fontSize: '10px' }}
                onClick={() => setActiveCheckpointView(null)}
              >
                ✕ CLOSE
              </button>
            </div>

            {uploadError && (
              <div className="sys-alert-inverted font-mono" style={{ fontSize: '11px', padding: '6px', marginBottom: '8px' }}>
                {uploadError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {(['front', 'side', 'back'] as const).map((ptype) => {
                const photoUrl = checkpoints[activeCheckpointView]?.photos?.[ptype];
                return (
                  <div key={ptype} style={{ border: '1px solid var(--border-subtle)', padding: '6px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}>{ptype}</div>
                    {photoUrl ? (
                      <img src={photoUrl} alt={ptype} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'var(--text-muted)' }}>
                        NO PHOTO
                      </div>
                    )}
                    <label style={{ display: 'block', marginTop: '6px', fontSize: '9px', cursor: 'pointer', border: '1px solid var(--border-medium)', padding: '4px 2px' }}>
                      {isUploadingPhoto ? '...' : photoUrl ? 'UPDATE' : 'UPLOAD'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handlePhotoUpload(activeCheckpointView, ptype, e)}
                        disabled={isUploadingPhoto}
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 5. 124-DAY CHALLENGE CALENDAR */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>CHALLENGE CALENDAR</span>
          <span className="sys-tag">{TOTAL_CHALLENGE_DAYS} DAYS</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '8px' }}>
          {Array.from({ length: TOTAL_CHALLENGE_DAYS }, (_, i) => i + 1).map((d) => {
            const status = sessionStatusMap.get(d);
            const isToday = d === challengeDay.dayNumber;

            let bg = 'transparent';
            let border = '1px solid var(--border-faint)';
            let color = 'var(--text-muted)';

            if (status === 'completed') {
              bg = '#ffffff';
              border = '1px solid #ffffff';
              color = '#000000';
            } else if (status === 'reduced') {
              bg = 'rgba(255, 255, 255, 0.4)';
              border = '1px solid #ffffff';
              color = '#000000';
            } else if (status === 'exception') {
              border = '1px solid #ffffff';
              color = '#ffffff';
            } else if (status === 'missed') {
              border = '1px solid #ffffff';
              color = 'var(--text-muted)';
            } else if (isToday) {
              border = '1px solid #ffffff';
              color = '#ffffff';
            }

            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDayNumber(d)}
                title={`Day ${d}`}
                style={{
                  width: '26px',
                  height: '26px',
                  backgroundColor: bg,
                  border,
                  color,
                  fontSize: '9px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                {d}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
