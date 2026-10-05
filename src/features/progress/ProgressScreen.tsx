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
import { getDateStringForDayNumber } from '../../lib/dates/challengeDates';

export const ProgressScreen: React.FC = () => {
  const { currentUser, userProfile, updateProfileData } = useAuth();
  const { challengeDay, setSelectedDayNumber } = useUserProgression();

  const [checkpoints, setCheckpoints] = useState<Record<string, ProgressCheckpoint>>({});
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>([]);
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistoricalRecord[]>([]);

  // Selected photo checkpoint modal
  const [activeCheckpointView, setActiveCheckpointView] = useState<'day001' | 'day030' | 'day060' | 'day090' | 'day120' | null>(null);
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
    let bestW = 0, bestR = 0;
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

  // Photo upload handler for current checkpoint
  const handlePhotoUpload = async (
    cpId: 'day001' | 'day030' | 'day060' | 'day090' | 'day120',
    type: 'front' | 'side' | 'back',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploadingPhoto(true);
    setUploadError(null);

    try {
      const { blob } = await compressAndStripExif(file);
      const url = await uploadProgressPhoto(currentUser.uid, cpId, type, blob);

      const existingCp = checkpoints[cpId] || {
        checkpointId: cpId,
        dayNumber: cpId === 'day001' ? 1 : cpId === 'day030' ? 30 : cpId === 'day060' ? 60 : cpId === 'day090' ? 90 : 120,
        date: getDateStringForDayNumber(cpId === 'day001' ? 1 : cpId === 'day030' ? 30 : cpId === 'day060' ? 60 : cpId === 'day090' ? 90 : 120),
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

  return (
    <div>
      <div className="sys-header">
        <div className="flex-between">
          <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
            ARCHIMEDES // EVOLUTION AUDIT
          </span>
          <span className="sys-tag">DAY {padDayNumber(challengeDay.dayNumber)} / 120</span>
        </div>
        <h1 className="font-mono" style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 2px 0' }}>
          PROGRESS & MEASUREMENTS
        </h1>
        <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          120-DAY PHYSICAL & PERFORMANCE TIMELINE
        </div>
      </div>

      {/* BODY METRICS */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>BODY MEASUREMENTS</span>
          <button
            type="button"
            className="sys-btn sys-btn-subtle"
            style={{ width: 'auto', minHeight: '28px', padding: '2px 8px', fontSize: '10px' }}
            onClick={() => setIsEditingMeasurements(!isEditingMeasurements)}
          >
            {isEditingMeasurements ? 'CANCEL' : 'RECORD UPDATE'}
          </button>
        </div>

        {isEditingMeasurements ? (
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>WEIGHT (KG)</label>
                <input
                  type="number"
                  className="sys-input"
                  value={newWeight}
                  onChange={(e) => setNewWeight(Number(e.target.value))}
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>WAIST (INCHES)</label>
                <input
                  type="number"
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ borderLeft: '2px solid #ffffff', paddingLeft: '10px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>BODY WEIGHT</div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                {baseline.bodyWeightKg} kg
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>BASELINE: 109 kg</div>
            </div>

            <div style={{ borderLeft: '2px solid #ffffff', paddingLeft: '10px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>WAIST CIRCUMFERENCE</div>
              <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '2px' }}>
                {baseline.waistIn} in
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>BASELINE: 44 in</div>
            </div>
          </div>
        )}
      </section>

      {/* PERFORMANCE BENCHMARKS */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>CALISTHENIC CAPACITY</span>
          <span className="sys-tag">BENCHMARKS</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div style={{ border: '1px solid var(--border-subtle)', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PUSH-UPS</div>
            <div style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0' }}>{baseline.maxPushUps}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>BASE: 3</div>
          </div>

          <div style={{ border: '1px solid var(--border-subtle)', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PULL-UPS</div>
            <div style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0' }}>{baseline.maxPullUps}</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>BASE: 0</div>
          </div>

          <div style={{ border: '1px solid var(--border-subtle)', padding: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PLANK</div>
            <div style={{ fontSize: '16px', fontWeight: 800, margin: '2px 0' }}>{baseline.maxPlankSec}s</div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>BASE: 30s</div>
          </div>
        </div>
      </section>

      {/* KEY LIFTS BENCHMARKS */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>KEY BARBELL LIFTS</span>
          <span className="sys-tag">STRENGTH AUDIT</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="flex-between" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
            <div>
              <span style={{ fontWeight: 700 }}>BACK SQUAT</span>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Baseline: {baseline.squatBestWeightKg} kg × {baseline.squatBestReps}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontWeight: 800 }}>
              {squatBest.weight > 0 ? `${squatBest.weight} kg × ${squatBest.reps}` : `${baseline.squatBestWeightKg} kg × ${baseline.squatBestReps}`}
            </div>
          </div>

          <div className="flex-between" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px' }}>
            <div>
              <span style={{ fontWeight: 700 }}>BENCH PRESS</span>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Baseline: {baseline.benchBestWeightKg} kg × {baseline.benchBestReps}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontWeight: 800 }}>
              {benchBest.weight > 0 ? `${benchBest.weight} kg × ${benchBest.reps}` : `${baseline.benchBestWeightKg} kg × ${baseline.benchBestReps}`}
            </div>
          </div>

          <div className="flex-between">
            <div>
              <span style={{ fontWeight: 700 }}>DEADLIFT</span>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Baseline: {baseline.deadliftBestWeightKg} kg × {baseline.deadliftBestReps}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontWeight: 800 }}>
              {deadliftBest.weight > 0 ? `${deadliftBest.weight} kg × ${deadliftBest.reps}` : `${baseline.deadliftBestWeightKg} kg × ${baseline.deadliftBestReps}`}
            </div>
          </div>
        </div>
      </section>

      {/* PHOTO TIMELINE */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>PROGRESS PHOTO CHECKPOINTS</span>
          <span className="sys-tag">5 CHECKPOINTS</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center' }}>
          {(['day001', 'day030', 'day060', 'day090', 'day120'] as const).map((cpId) => {
            const cp = checkpoints[cpId];
            const isComplete = cp?.photosComplete;
            return (
              <button
                key={cpId}
                type="button"
                className="sys-btn sys-btn-subtle"
                style={{
                  minHeight: '44px',
                  padding: '4px',
                  border: isComplete ? '1px solid #ffffff' : '1px dashed var(--border-subtle)',
                  backgroundColor: activeCheckpointView === cpId ? 'var(--bg-inverted)' : 'transparent',
                  color: activeCheckpointView === cpId ? 'var(--text-inverted)' : 'inherit'
                }}
                onClick={() => setActiveCheckpointView(cpId)}
              >
                <div style={{ fontSize: '9px' }}>{cpId.toUpperCase()}</div>
                <div style={{ fontSize: '10px', fontWeight: 700, marginTop: '2px' }}>
                  {isComplete ? '✓ VIEW' : '+ ADD'}
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
                    <div style={{ fontSize: '9px', marginBottom: '4px' }}>{ptype.toUpperCase()}</div>
                    {photoUrl ? (
                      <img src={photoUrl} alt={ptype} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'var(--text-muted)' }}>
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

      {/* CHALLENGE CALENDAR (120 DAYS) */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>CHALLENGE CALENDAR</span>
          <span className="sys-tag">120 DAYS</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '8px' }}>
          {Array.from({ length: 120 }, (_, i) => i + 1).map((d) => {
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
                style={{
                  width: 'calc(100% / 14 - 3px)',
                  aspectRatio: '1',
                  backgroundColor: bg,
                  border,
                  color,
                  fontSize: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  cursor: 'pointer'
                }}
                title={`Day ${d}: ${status || (isToday ? 'Today' : 'Pending')}`}
              >
                {d}
              </button>
            );
          })}
        </div>

        <div className="flex-between" style={{ marginTop: '10px', fontSize: '9px', color: 'var(--text-muted)' }}>
          <span>■ COMPLETED</span>
          <span>□ EXCEPTION / TODAY</span>
          <span>· FUTURE</span>
        </div>
      </section>
    </div>
  );
};
