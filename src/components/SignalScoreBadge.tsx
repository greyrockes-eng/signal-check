interface SignalScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md';
}

export default function SignalScoreBadge({ score, size = 'sm' }: SignalScoreBadgeProps) {
  const color =
    score >= 8 ? 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' :
    score >= 6.5 ? 'text-blue-400 border-blue-400/40 bg-blue-400/10' :
    score >= 5 ? 'text-amber-400 border-amber-400/40 bg-amber-400/10' :
    'text-rose-400 border-rose-400/40 bg-rose-400/10';

  const sizeClass = size === 'md' ? 'text-sm px-2.5 py-1' : 'text-[11px] px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-semibold ${color} ${sizeClass}`}>
      <span className="opacity-70">★</span>
      {score.toFixed(1)}
    </span>
  );
}
