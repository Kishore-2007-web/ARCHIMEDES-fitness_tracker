import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * Authoritative Server-side Workout Session Finalization
 */
export const finalizeSession = onCall(
  { region: 'asia-south1', enforceAppCheck: false },
  async (request: CallableRequest<any>) => {
    // 1. Verify caller authentication
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'Authentication required to finalize session.'
      );
    }

    const { params } = request.data;
    const uid = request.auth.uid;

    if (params.uid !== uid) {
      throw new HttpsError(
        'permission-denied',
        'Cannot finalize session for another user.'
      );
    }

    const { activeSession, exceptionReason, isReduced } = params;
    const dateKey = activeSession.date;
    const sessionId = `session_${dateKey}`;

    // 2. Check Idempotency: prevent double finalization
    const sessionDocRef = db.doc(`users/${uid}/sessions/${sessionId}`);
    const existingSnap = await sessionDocRef.get();
    if (existingSnap.exists) {
      throw new HttpsError(
        'already-exists',
        'Session for this date is already finalized.'
      );
    }

    // 3. Read Authoritative Profile
    const userDocRef = db.doc(`users/${uid}`);
    const userSnap = await userDocRef.get();
    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'User profile not found.');
    }
    const userProfile = userSnap.data()!;

    // 4. Calculate Server-side XP & Progression
    const weekday = new Date(dateKey + 'T00:00:00Z').getUTCDay();
    const baseXPMap: Record<number, number> = {
      1: 300, 2: 200, 3: 300, 4: 200, 5: 300, 6: 250, 0: 100
    };
    const reducedXPMap: Record<number, number> = {
      1: 180, 2: 120, 3: 180, 4: 120, 5: 180, 6: 150, 0: 60
    };

    let baseXP = 0;
    let status = 'completed';
    let streakIncrement = true;

    if (exceptionReason) {
      status = exceptionReason === 'NORMAL_MISS' ? 'missed' : 'exception';
      streakIncrement = false;
      if (exceptionReason === 'GYM_CLOSED' || exceptionReason === 'TRAVEL' || exceptionReason === 'COLLEGE_EXAM') {
        baseXP = 75;
      } else if (exceptionReason === 'LOW_MOTIVATION') {
        baseXP = isReduced ? (reducedXPMap[weekday] ?? 120) : (baseXPMap[weekday] ?? 200);
        status = isReduced ? 'reduced' : 'completed';
        streakIncrement = true;
      }
    } else if (isReduced) {
      baseXP = reducedXPMap[weekday] ?? 120;
      status = 'reduced';
    } else {
      baseXP = baseXPMap[weekday] ?? 200;
    }

    const dailyMissionCompleted = activeSession.dailyMissionStatus === 'completed' && status !== 'missed';
    const missionXP = dailyMissionCompleted ? 25 : 0;
    const totalXP = baseXP + missionXP;

    // Calculate level thresholds
    const newTotalXP = (userProfile.xp || 0) + totalXP;
    let newLevel = 1;
    while (((newLevel) * 250 + 20 * (newLevel) * (newLevel - 1)) <= newTotalXP) {
      newLevel++;
    }

    const prevLevel = userProfile.level || 1;
    const leveledUp = newLevel > prevLevel;

    // Streaks
    const currentStreak = userProfile.trainingStreak || 0;
    const newStreak = streakIncrement ? currentStreak + 1 : exceptionReason === 'NORMAL_MISS' ? 0 : currentStreak;

    // Write Atomic Batch
    const batch = db.batch();

    // 1. Immutable session log
    batch.set(sessionDocRef, {
      id: sessionId,
      date: dateKey,
      dayNumber: activeSession.dayNumber,
      scheduleId: activeSession.scheduleId,
      weekday,
      status,
      reason: exceptionReason || null,
      baseXP,
      bonusXP: missionXP,
      totalXP,
      dailyMissionCompleted,
      completedAt: new Date().toISOString()
    });

    // 2. Remove active session
    batch.delete(db.doc(`users/${uid}/activeSessions/${dateKey}`));

    // 3. Update authoritative user progression
    batch.update(userDocRef, {
      xp: newTotalXP,
      level: newLevel,
      trainingStreak: newStreak,
      consistencyStreak: streakIncrement ? (userProfile.consistencyStreak || 0) + 1 : (userProfile.consistencyStreak || 0),
      updatedAt: new Date().toISOString()
    });

    // 4. Create system audit event
    const eventRef = db.collection(`users/${uid}/events`).doc(`ev_${Date.now()}`);
    batch.set(eventRef, {
      id: eventRef.id,
      type: 'SESSION_COMPLETE',
      title: 'SESSION FINALIZED',
      detail: `Authoritative server finalization: +${totalXP} XP. Status: ${status.toUpperCase()}`,
      timestamp: new Date().toISOString()
    });

    await batch.commit();

    return {
      success: true,
      totalXP,
      newLevel,
      leveledUp,
      status
    };
  }
);

/**
 * Scheduled Training Reminder
 * Runs daily at 17:30 (5:30 PM) Asia/Kolkata timezone
 */
export const scheduledTrainingReminder = onSchedule(
  {
    schedule: '30 17 * * *',
    timeZone: 'Asia/Kolkata',
    region: 'asia-south1'
  },
  async () => {
    // Current date in Asia/Kolkata
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const todayStr = formatter.format(new Date());

    // Check challenge date bounds (2026-10-07 to 2027-02-07)
    if (todayStr < '2026-10-07' || todayStr > '2027-02-07') {
      return;
    }

    const usersSnap = await db.collection('users')
      .where('settings.reminderEnabled', '==', true)
      .get();

    for (const docSnap of usersSnap.docs) {
      const uid = docSnap.id;
      const sessionSnap = await db.doc(`users/${uid}/sessions/session_${todayStr}`).get();
      if (!sessionSnap.exists) {
        const userProfile = docSnap.data();
        if (userProfile.fcmToken) {
          await admin.messaging().send({
            token: userProfile.fcmToken,
            notification: {
              title: 'ARCHIMEDES // MISSION AVAILABLE',
              body: "Today's training is waiting."
            },
            data: {
              click_action: '/quest',
              date: todayStr
            }
          }).catch((err) => console.warn(`FCM send failed for ${uid}:`, err.message));
        }
      }
    }
  }
);

/**
 * Authoritative User Account & Storage Deletion
 */
export const deleteUserData = onCall(
  { region: 'asia-south1' },
  async (request: CallableRequest<any>) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }
    const uid = request.auth.uid;
    const bucket = admin.storage().bucket();
    await bucket.deleteFiles({ prefix: `users/${uid}/` }).catch(() => {});
    await admin.auth().deleteUser(uid);
    return { success: true };
  }
);
