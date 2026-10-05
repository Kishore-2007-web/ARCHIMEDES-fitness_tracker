import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DAY1_DEFAULT_BASELINE } from '../../data/baseline';
import { UserBaseline } from '../../types/auth';
import { Button } from '../../components/common/Button';
import { compressAndStripExif } from '../../lib/compression/imageCompressor';
import { uploadProgressPhoto } from '../../lib/firebase/storage';
import { saveProgressCheckpoint } from '../../lib/firebase/db';
import { CHALLENGE_START_DATE } from '../../lib/dates/challengeDates';

export const OnboardingScreen: React.FC = () => {
  const { currentUser, userProfile, updateProfileData } = useAuth();

  const [step, setStep] = useState<'baseline' | 'photos' | 'saving'>('baseline');
  const [baseline, setBaseline] = useState<UserBaseline>(userProfile?.baseline || DAY1_DEFAULT_BASELINE);

  // Photos state
  const [frontBlob, setFrontBlob] = useState<Blob | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [sideBlob, setSideBlob] = useState<Blob | null>(null);
  const [sidePreview, setSidePreview] = useState<string | null>(null);
  const [backBlob, setBackBlob] = useState<Blob | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);

  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePhotoSelect = async (
    type: 'front' | 'side' | 'back',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPhoto(true);
    setErrorMsg(null);
    try {
      const { blob, dataUrl } = await compressAndStripExif(file, { maxWidth: 1080, quality: 0.82 });
      if (type === 'front') {
        setFrontBlob(blob);
        setFrontPreview(dataUrl);
      } else if (type === 'side') {
        setSideBlob(blob);
        setSidePreview(dataUrl);
      } else if (type === 'back') {
        setBackBlob(blob);
        setBackPreview(dataUrl);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Image processing failed.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    if (!currentUser) return;
    if (!frontBlob || !sideBlob || !backBlob) {
      setErrorMsg('All 3 Day 1 baseline photos (Front, Side, Back) are mandatory.');
      return;
    }

    setStep('saving');
    setErrorMsg(null);

    try {
      // 1. Upload photos to Firebase Storage under authenticated user path
      const [frontUrl, sideUrl, backUrl] = await Promise.all([
        uploadProgressPhoto(currentUser.uid, 'day001', 'front', frontBlob),
        uploadProgressPhoto(currentUser.uid, 'day001', 'side', sideBlob),
        uploadProgressPhoto(currentUser.uid, 'day001', 'back', backBlob)
      ]);

      // 2. Save Day 1 progress checkpoint document in Firestore
      await saveProgressCheckpoint(currentUser.uid, {
        checkpointId: 'day001',
        dayNumber: 1,
        date: CHALLENGE_START_DATE,
        bodyWeightKg: baseline.bodyWeightKg,
        waistIn: baseline.waistIn,
        maxPushUps: baseline.maxPushUps,
        maxPullUps: baseline.maxPullUps,
        maxPlankSec: baseline.maxPlankSec,
        photos: {
          front: frontUrl,
          side: sideUrl,
          back: backUrl
        },
        photosComplete: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 3. Update User Profile with baseline and complete onboarding
      await updateProfileData({
        baseline,
        onboardingComplete: true,
        day1PhotosComplete: true
      });
    } catch (err: any) {
      console.error('Onboarding save error:', err);
      setErrorMsg(err.message || 'Failed to complete initialization.');
      setStep('photos');
    }
  };

  return (
    <div className="sys-container" style={{ paddingTop: '24px' }}>
      <div className="sys-header">
        <div className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
          ARCHIMEDES // ONBOARDING
        </div>
        <h1 className="font-mono" style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.08em', marginTop: '4px' }}>
          SYSTEM INITIALIZATION
        </h1>
        <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          DAY 1 BASELINE REQUIRED
        </div>
      </div>

      {errorMsg && (
        <div className="sys-alert-inverted font-mono" style={{ fontSize: '12px', padding: '10px' }}>
          {errorMsg}
        </div>
      )}

      {step === 'baseline' && (
        <div className="sys-section anim-fade-in">
          <div className="sys-section-title">
            <span>DAY 1 PHYSICAL BASELINE</span>
            <span className="sys-tag">VERIFIED</span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Verify your Day 1 baseline metrics. These values anchor all subsequent progression tracking.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                BODY WEIGHT (KG)
              </label>
              <input
                type="number"
                className="sys-input"
                value={baseline.bodyWeightKg}
                onChange={(e) => setBaseline({ ...baseline, bodyWeightKg: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                WAIST (INCHES)
              </label>
              <input
                type="number"
                className="sys-input"
                value={baseline.waistIn}
                onChange={(e) => setBaseline({ ...baseline, waistIn: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                MAX PUSH-UPS
              </label>
              <input
                type="number"
                className="sys-input"
                value={baseline.maxPushUps}
                onChange={(e) => setBaseline({ ...baseline, maxPushUps: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                MAX PULL-UPS
              </label>
              <input
                type="number"
                className="sys-input"
                value={baseline.maxPullUps}
                onChange={(e) => setBaseline({ ...baseline, maxPullUps: Number(e.target.value) })}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                MAX PLANK HOLD (SECONDS)
              </label>
              <input
                type="number"
                className="sys-input"
                value={baseline.maxPlankSec}
                onChange={(e) => setBaseline({ ...baseline, maxPlankSec: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="sys-divider" />

          <div className="font-mono" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '12px' }}>
            KEY LIFTS BASELINE
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                BACK SQUAT (KG)
              </label>
              <input
                type="number"
                className="sys-input"
                value={baseline.squatBestWeightKg}
                onChange={(e) => setBaseline({ ...baseline, squatBestWeightKg: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                SQUAT REPS
              </label>
              <input
                type="number"
                className="sys-input"
                value={baseline.squatBestReps}
                onChange={(e) => setBaseline({ ...baseline, squatBestReps: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                BENCH PRESS (KG)
              </label>
              <input
                type="number"
                className="sys-input"
                value={baseline.benchBestWeightKg}
                onChange={(e) => setBaseline({ ...baseline, benchBestWeightKg: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                BENCH REPS
              </label>
              <input
                type="number"
                className="sys-input"
                value={baseline.benchBestReps}
                onChange={(e) => setBaseline({ ...baseline, benchBestReps: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                DEADLIFT (KG)
              </label>
              <input
                type="number"
                className="sys-input"
                value={baseline.deadliftBestWeightKg}
                onChange={(e) => setBaseline({ ...baseline, deadliftBestWeightKg: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                DEADLIFT REPS
              </label>
              <input
                type="number"
                className="sys-input"
                value={baseline.deadliftBestReps}
                onChange={(e) => setBaseline({ ...baseline, deadliftBestReps: Number(e.target.value) })}
              />
            </div>
          </div>

          <Button variant="inverted" onClick={() => setStep('photos')}>
            NEXT: DAY 1 PROGRESS PHOTOS
          </Button>
        </div>
      )}

      {step === 'photos' && (
        <div className="sys-section anim-fade-in">
          <div className="sys-section-title">
            <span>DAY 1 PROGRESS PHOTOS</span>
            <span className="sys-tag">MANDATORY</span>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Day 1 front, side, and back photos anchor your 120-day physical timeline. Photos are compressed client-side, stripped of EXIF metadata, and stored privately under your UID.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            {/* Front Photo */}
            <div style={{ border: '1px solid var(--border-subtle)', padding: '12px' }}>
              <div className="flex-between font-mono" style={{ fontSize: '12px', marginBottom: '8px' }}>
                <span>1. FRONT PROFILE</span>
                <span>{frontBlob ? '✓ READY' : 'REQUIRED'}</span>
              </div>
              {frontPreview && (
                <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                  <img src={frontPreview} alt="Front Preview" style={{ maxHeight: '140px', objectFit: 'cover', border: '1px solid #ffffff' }} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoSelect('front', e)}
                disabled={isProcessingPhoto}
                style={{ fontSize: '12px' }}
              />
            </div>

            {/* Side Photo */}
            <div style={{ border: '1px solid var(--border-subtle)', padding: '12px' }}>
              <div className="flex-between font-mono" style={{ fontSize: '12px', marginBottom: '8px' }}>
                <span>2. SIDE PROFILE</span>
                <span>{sideBlob ? '✓ READY' : 'REQUIRED'}</span>
              </div>
              {sidePreview && (
                <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                  <img src={sidePreview} alt="Side Preview" style={{ maxHeight: '140px', objectFit: 'cover', border: '1px solid #ffffff' }} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoSelect('side', e)}
                disabled={isProcessingPhoto}
                style={{ fontSize: '12px' }}
              />
            </div>

            {/* Back Photo */}
            <div style={{ border: '1px solid var(--border-subtle)', padding: '12px' }}>
              <div className="flex-between font-mono" style={{ fontSize: '12px', marginBottom: '8px' }}>
                <span>3. BACK PROFILE</span>
                <span>{backBlob ? '✓ READY' : 'REQUIRED'}</span>
              </div>
              {backPreview && (
                <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                  <img src={backPreview} alt="Back Preview" style={{ maxHeight: '140px', objectFit: 'cover', border: '1px solid #ffffff' }} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoSelect('back', e)}
                disabled={isProcessingPhoto}
                style={{ fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Button variant="subtle" onClick={() => setStep('baseline')}>
              BACK
            </Button>
            <Button
              variant="inverted"
              onClick={handleCompleteOnboarding}
              disabled={!frontBlob || !sideBlob || !backBlob || isProcessingPhoto}
            >
              {isProcessingPhoto ? 'PROCESSING...' : 'INITIALIZE SYSTEM'}
            </Button>
          </div>
        </div>
      )}

      {step === 'saving' && (
        <div className="sys-section anim-scale-in text-center font-mono" style={{ padding: '40px 20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.2em' }}>
            UPLOADING & COMMITTING
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, margin: '14px 0' }}>
            INITIALIZING ARCHIMEDES...
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Establishing Day 1 Baseline and Private Photo Timeline
          </div>
        </div>
      )}
    </div>
  );
};
