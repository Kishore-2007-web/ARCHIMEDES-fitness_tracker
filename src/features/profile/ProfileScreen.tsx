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
    <div>
      <div className="sys-header">
        <div className="flex-between">
          <span className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
            ARCHIMEDES // USER PROTOCOL
          </span>
          <span className="sys-tag">PRIVATE</span>
        </div>
        <h1 className="font-mono" style={{ fontSize: '20px', fontWeight: 800, margin: '4px 0 2px 0' }}>
          PROFILE & VAULT
        </h1>
        <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          CONFIG, SETTINGS & SELF-TREAT VAULT
        </div>
      </div>

      {/* ACCOUNT IDENTITY */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>AUTHENTICATED OPERATOR</span>
          <span className="sys-tag">GOOGLE AUTH</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="flex-between">
            <span style={{ color: 'var(--text-muted)' }}>NAME</span>
            <span style={{ fontWeight: 700 }}>{userProfile.displayName}</span>
          </div>
          <div className="flex-between">
            <span style={{ color: 'var(--text-muted)' }}>EMAIL</span>
            <span>{userProfile.email}</span>
          </div>
          <div className="flex-between">
            <span style={{ color: 'var(--text-muted)' }}>ACTIVE TITLE</span>
            <span className="sys-tag">{userProfile.currentTitle}</span>
          </div>
        </div>
      </section>

      {/* TITLES SELECTION */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>COSMETIC TITLES</span>
          <span className="sys-tag">EQUIP</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {SYSTEM_TITLES.map((t) => {
            const isEquipped = userProfile.currentTitle === t.name;
            return (
              <button
                key={t.id}
                type="button"
                className={`sys-btn ${isEquipped ? 'sys-btn-inverted' : 'sys-btn-subtle'}`}
                style={{ minHeight: '40px', padding: '6px 8px', fontSize: '11px' }}
                onClick={() => handleEquipTitle(t.name)}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* REWARD VAULT */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>REWARD VAULT</span>
          <span className="sys-tag" style={{ border: '1px solid #ffffff' }}>
            {userProfile.rewardTokens} TOKENS AVAILABLE
          </span>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Tokens are acquired authoritatively via session milestones and boss defeats. Redeem tokens for self-selected rewards.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
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

        {/* Add Custom Reward */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            className="sys-input"
            placeholder="Add custom reward suggestion..."
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

        {/* Transaction History */}
        {transactions.length > 0 && (
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              VAULT LEDGER
            </div>
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex-between" style={{ fontSize: '11px', padding: '2px 0' }}>
                <span>{tx.title}</span>
                <span style={{ color: tx.type === 'EARNED' ? '#ffffff' : 'var(--text-muted)' }}>
                  {tx.type === 'EARNED' ? '+1 TOKEN' : '-1 TOKEN'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SYSTEM SETTINGS */}
      <section className="sys-section font-mono">
        <div className="sys-section-title">
          <span>SYSTEM SETTINGS</span>
          <span className="sys-tag">PREFERENCES</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="flex-between">
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>TRAINING REMINDER</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Daily scheduled alert (Asia/Kolkata)</div>
            </div>
            <button
              type="button"
              className={`sys-btn ${userProfile.settings.reminderEnabled ? 'sys-btn-inverted' : 'sys-btn-outline'}`}
              style={{ width: 'auto', minHeight: '32px', padding: '4px 12px', fontSize: '11px' }}
              onClick={handleToggleNotifications}
            >
              {userProfile.settings.reminderEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="flex-between">
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>REMINDER TIME</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Default: 17:30 (5:30 PM)</div>
            </div>
            <input
              type="time"
              className="sys-input"
              style={{ width: '110px', minHeight: '36px', textAlign: 'center' }}
              value={userProfile.settings.reminderTime || '17:30'}
              onChange={(e) => handleReminderTimeChange(e.target.value)}
            />
          </div>

          <div className="flex-between">
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700 }}>MOTION PROFILE</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Instant transitions for OPPO A54</div>
            </div>
            <button
              type="button"
              className={`sys-btn ${userProfile.settings.reducedMotion ? 'sys-btn-inverted' : 'sys-btn-outline'}`}
              style={{ width: 'auto', minHeight: '32px', padding: '4px 12px', fontSize: '11px' }}
              onClick={handleToggleMotion}
            >
              {userProfile.settings.reducedMotion ? 'REDUCED' : 'STANDARD'}
            </button>
          </div>
        </div>
      </section>

      {/* DANGER ZONE / LOGOUT / DELETE */}
      <section className="sys-section font-mono" style={{ borderColor: '#ffffff' }}>
        <div className="sys-section-title">
          <span>ACCOUNT ACTIONS</span>
          <span className="sys-tag">DANGER ZONE</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button variant="outline" onClick={logout}>
            SIGN OUT OF ARCHIMEDES
          </Button>

          <button
            type="button"
            className="sys-btn sys-btn-subtle"
            style={{ color: '#ffffff', borderColor: 'var(--border-medium)' }}
            onClick={() => setShowDeleteModal(true)}
          >
            DELETE ALL ACCOUNT DATA
          </button>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="DELETE ACCOUNT">
        <div className="font-mono">
          <div className="sys-alert-inverted" style={{ fontSize: '12px', padding: '10px', marginBottom: '14px' }}>
            WARNING: This operation is permanent and irreversible.
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            All user profile data, sessions, exercise records, achievements, bosses, measurements, and private progress photos will be deleted immediately.
          </p>

          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            TYPE "DELETE" TO CONFIRM:
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
