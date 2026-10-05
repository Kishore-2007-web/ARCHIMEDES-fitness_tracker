import React from 'react';
import { RankTier } from '../../types/auth';

interface RankBadgeProps {
  rank: RankTier;
  size?: 'sm' | 'md' | 'lg';
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, size = 'md' }) => {
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  return (
    <span
      className="font-mono inline-flex items-center justify-center font-bold"
      style={{
        border: '1px solid #ffffff',
        backgroundColor: rank === 'S' || rank === 'A' ? 'var(--bg-inverted)' : 'transparent',
        color: rank === 'S' || rank === 'A' ? 'var(--text-inverted)' : 'var(--text-primary)',
        width: isLarge ? '38px' : isSmall ? '20px' : '28px',
        height: isLarge ? '38px' : isSmall ? '20px' : '28px',
        fontSize: isLarge ? '18px' : isSmall ? '10px' : '14px',
        letterSpacing: '0.05em',
        borderRadius: '2px',
        userSelect: 'none'
      }}
      title={`System Rank ${rank}`}
    >
      {rank}
    </span>
  );
};
