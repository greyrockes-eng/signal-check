'use client';

interface ScoreRingProps {
  score: number; // 0-10
  size?: number;
  label?: string;
}

export default function ScoreRing({ score, size = 64, label }: ScoreRingProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 10) * circumference;
  const offset = circumference - progress;

  const getColor = (s: number) => {
    if (s >= 8) return '#10b981'; // green
    if (s >= 6) return '#3b82f6'; // blue
    if (s >= 4) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e2540"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="score-ring"
        />
      </svg>
      <span
        className="absolute text-sm font-bold"
        style={{
          color,
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {score.toFixed(1)}
      </span>
      {label && (
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
      )}
    </div>
  );
}
