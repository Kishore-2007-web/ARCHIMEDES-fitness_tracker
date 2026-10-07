import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SYSTEM_TITLES, DEFAULT_REWARDS } from '../../data/titles';
import {
  getCustomRewards,
  saveRewardItem,
  getRewardTransactions,
  addRewardTransaction
} from '../../lib/firebase/db';
import { requestNotificationPermission } from '../../lib/firebase/messaging';
import { RewardItem, RewardTransaction } from '../../types/gamification';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const ProfileScreen: React.FC = () => {
  const { currentUser, userProfile, updateProfileData, deleteAccount, logout } = useAuth();

  const [rewardsList, setRewardsList] = useState<RewardItem[]>([]);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [customRewardInput, setCustomRewardInput] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    Promise.all([
      getCustomRewards(currentUser.uid),
      getRewardTransactions(currentUser.uid)
    ]).then(([customs, txs]) => {
      if (customs.length === 0) {
        setRewardsList(DEFAULT_REWARDS);
      } else {
        setRewardsList(customs);
      }
      setTransactions(txs);
    });
  }, [currentUser]);

  if (!userProfile) return null;

  const handleToggleNotifications = async () => {
    const nextVal = !userProfile.settings.reminderEnabled;
    if (nextVal) {
      await requestNotificationPermission();
    }
    await updateProfileData({
      settings: { ...userProfile.settings, reminderEnabled: nextVal }
    });
  };

  const handleReminderTimeChange = async (newTime: string) => {
    await updateProfileData({
      settings: { ...userProfile.settings, reminderTime: newTime }
    });
  };

  const handleToggleMotion = async () => {
    const nextVal = !userProfile.settings.reducedMotion;
    await updateProfileData({
      settings: { ...userProfile.settings, reducedMotion: nextVal }
    });
  };

  const handleEquipTitle = async (titleName: string) => {
    await updateProfileData({ currentTitle: titleName });
  };

  const handleAddCustomReward = async () => {
    if (!customRewardInput.trim() || !currentUser) return;
    const newItem: RewardItem = {
      id: `rew_${Date.now()}`,
      title: customRewardInput.trim(),
      category: 'Custom',
      isCustom: true
    };
    await saveRewardItem(currentUser.uid, newItem);
    setRewardsList((prev) => [...prev, newItem]);
    setCustomRewardInput('');
  };

  const handleRedeemReward = async (rewardTitle: string) => {
    if (userProfile.rewardTokens <= 0 || !currentUser) return;

    const newTokens = userProfile.rewardTokens - 1;
    const tx: RewardTransaction = {
      id: `tx_${Date.now()}`,
      type: 'REDEEMED',
      title: rewardTitle,
      timestamp: new Date().toISOString(),
      tokens: 1
    };

    await addRewardTransaction(currentUser.uid, tx);
    await updateProfileData({ rewardTokens: newTokens });
    setTransactions((prev) => [tx, ...prev]);
  };

  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await deleteAccount();
    } catch (err) {
      console.error('Account deletion error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="anim-fade-in">
      {/* HEADER */}
      <div style={{ marginBottom: '20px' }}>
        <div className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          ARCHIMEDES // PROFILE
        </div>
        <h1 className="font-mono" style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '0.04em', margin: '4px 0 2px 0' }}>
          SETTINGS & VAULT
        </h1>
        <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          OPERATOR PREFERENCES
        </div>
      </div>

      {/* GOOGLE ACCOUNT */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>GOOGLE ACCOUNT</span>
          <span className="sys-tag">AUTHENTICATED</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="flex-between">
            <span style={{ color: 'var(--text-muted)' }}>Name</span>
            <span style={{ fontWeight: 700 }}>{userProfile.displayName}</span>
          </div>
          <div className="flex-between">
            <span style={{ color: 'var(--text-muted)' }}>Email</span>
            <span style={{ fontSize: '12px' }}>{userProfile.email}</span>
          </div>
        </div>
      </section>

      {/* CURRENT TITLE */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>CURRENT TITLE</span>
          <span className="sys-tag">{userProfile.currentTitle}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
          {SYSTEM_TITLES.map((t) => {
            const isEquipped = userProfile.currentTitle === t.name;
            return (
              <button
                key={t.id}
                type="button"
                className={`sys-btn ${isEquipped ? 'sys-btn-inverted' : 'sys-btn-subtle'}`}
                style={{ minHeight: '38px', padding: '4px 8px', fontSize: '10px' }}
                onClick={() => handleEquipTitle(t.name)}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* REMINDERS & NOTIFICATIONS */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>NOTIFICATIONS & REMINDERS</span>
          <span className="sys-tag">ALERT</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="flex-between">
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>NOTIFICATIONS</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Daily training reminder</div>
            </div>
            <button
              type="button"
              className={`sys-btn ${userProfile.settings.reminderEnabled ? 'sys-btn-inverted' : 'sys-btn-outline'}`}
              style={{ width: 'auto', minHeight: '34px', padding: '2px 14px', fontSize: '11px' }}
              onClick={handleToggleNotifications}
            >
              {userProfile.settings.reminderEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex-between">
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>REMINDER TIME</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Default: 17:30 (Asia/Kolkata)</div>
            </div>
            <input
              type="time"
              className="sys-input"
              style={{ width: '100px', minHeight: '36px', textAlign: 'center' }}
              value={userProfile.settings.reminderTime || '17:30'}
              onChange={(e) => handleReminderTimeChange(e.target.value)}
            />
          </div>

          <div className="flex-between">
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>MOTION</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Optimized for OPPO A54</div>
            </div>
            <button
              type="button"
              className={`sys-btn ${userProfile.settings.reducedMotion ? 'sys-btn-inverted' : 'sys-btn-outline'}`}
              style={{ width: 'auto', minHeight: '34px', padding: '2px 14px', fontSize: '11px' }}
              onClick={handleToggleMotion}
            >
              {userProfile.settings.reducedMotion ? 'REDUCED' : 'STANDARD'}
            </button>
          </div>
        </div>
      </section>

      {/* REWARD VAULT */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>REWARD VAULT</span>
          <span className="sys-tag">{userProfile.rewardTokens} TOKENS</span>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
          Tokens are earned from consistency milestones and boss victories. Redeem tokens for earned rewards.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
          {rewardsList.map((rew) => (
            <div
              key={rew.id}
              className="flex-between"
              style={{
                border: '1px solid var(--border-subtle)',
                padding: '8px 10px',
                backgroundColor: 'var(--bg-primary)'
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700 }}>{rew.title}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{rew.category}</div>
              </div>
              <button
                type="button"
                className="sys-btn sys-btn-outline"
                style={{ width: 'auto', minHeight: '30px', padding: '2px 10px', fontSize: '10px' }}
                onClick={() => handleRedeemReward(rew.title)}
                disabled={userProfile.rewardTokens <= 0}
              >
                REDEEM 1 TOKEN
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="sys-input"
            placeholder="New custom reward..."
            value={customRewardInput}
            onChange={(e) => setCustomRewardInput(e.target.value)}
          />
          <button
            type="button"
            className="sys-btn sys-btn-inverted"
            style={{ width: 'auto', minHeight: '44px', whiteSpace: 'nowrap' }}
            onClick={handleAddCustomReward}
          >
            ADD
          </button>
        </div>

        {transactions.length > 0 && (
          <div style={{ marginTop: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              VAULT ACTIVITY
            </div>
            {transactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex-between" style={{ fontSize: '11px', padding: '2px 0' }}>
                <span>{tx.title}</span>
                <span style={{ color: tx.type === 'EARNED' ? '#ffffff' : 'var(--text-muted)' }}>
                  {tx.type === 'EARNED' ? '+1 Token' : '-1 Token'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PRIVACY & SECURITY */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>PRIVACY</span>
          <span className="sys-tag">ENCRYPTED</span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          All photos are stripped of EXIF metadata and stored in private cloud storage. Workout logs are isolated strictly under your authenticated UID.
        </p>
      </section>

      {/* ACCOUNT ACTIONS (SIGN OUT & DELETE) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
        <Button variant="outline" onClick={logout} style={{ minHeight: '48px' }}>
          SIGN OUT
        </Button>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: '8px 0'
          }}
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="DELETE ACCOUNT">
        <div className="font-mono">
          <div className="sys-alert-inverted" style={{ fontSize: '12px', padding: '10px', marginBottom: '14px' }}>
            Permanent action. This cannot be undone.
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            All progression, session logs, check-ins, and photos will be permanently deleted.
          </p>

          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            Type "DELETE" to confirm:
          </label>
          <input
            type="text"
            className="sys-input"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            style={{ marginBottom: '16px' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Button variant="subtle" onClick={() => setShowDeleteModal(false)}>
              CANCEL
            </Button>
            <Button
              variant="inverted"
              onClick={handleConfirmDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
            >
              {isDeleting ? 'DELETING...' : 'CONFIRM DELETE'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
