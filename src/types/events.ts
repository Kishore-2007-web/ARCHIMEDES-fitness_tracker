export type SystemEventType =
  | 'SESSION_COMPLETE'
  | 'PR_DETECTED'
  | 'LEVEL_UP'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'TITLE_UNLOCKED'
  | 'BOSS_UNLOCKED'
  | 'BOSS_COMPLETE'
  | 'REWARD_TOKEN'
  | 'CHECKPOINT_REACHED'
  | 'PROTOCOL_COMPLETE';

export interface SystemEvent {
  id: string;
  type: SystemEventType;
  title: string;
  detail: string;
  timestamp: string;
  metadata?: Record<string, string | number>;
}
