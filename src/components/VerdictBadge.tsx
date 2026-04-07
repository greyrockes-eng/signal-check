'use client';

import { CheckCircle, AlertTriangle, XCircle, HelpCircle, MinusCircle } from 'lucide-react';

type Verdict = 'true' | 'mostly_true' | 'half_true' | 'mostly_false' | 'false' | 'unverifiable';

interface VerdictBadgeProps {
  verdict: Verdict;
  size?: 'sm' | 'md';
}

const verdictConfig: Record<Verdict, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
  true: { label: 'True', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle },
  mostly_true: { label: 'Mostly True', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: CheckCircle },
  half_true: { label: 'Half True', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: MinusCircle },
  mostly_false: { label: 'Mostly False', color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: AlertTriangle },
  false: { label: 'False', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
  unverifiable: { label: 'Unverifiable', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: HelpCircle },
};

export default function VerdictBadge({ verdict, size = 'md' }: VerdictBadgeProps) {
  const config = verdictConfig[verdict];
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 12 : 16;

  return (
    <span
      className={`verdict-badge inline-flex items-center gap-1 rounded-full font-medium ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      }`}
      style={{ color: config.color, backgroundColor: config.bg }}
    >
      <Icon size={iconSize} />
      {config.label}
    </span>
  );
}
