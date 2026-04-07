'use client';

interface BiasMeterProps {
  bias: number; // -5 to 5
  compact?: boolean;
}

export default function BiasMeter({ bias, compact = false }: BiasMeterProps) {
  // Convert -5 to 5 range to 0-100 percentage
  const position = ((bias + 5) / 10) * 100;

  const getLabel = (b: number) => {
    if (b <= -3) return 'Far Left';
    if (b <= -1.5) return 'Left';
    if (b <= -0.5) return 'Center-Left';
    if (b <= 0.5) return 'Center';
    if (b <= 1.5) return 'Center-Right';
    if (b <= 3) return 'Right';
    return 'Far Right';
  };

  const getColor = (b: number) => {
    const abs = Math.abs(b);
    if (abs <= 0.5) return '#10b981'; // green - center
    if (abs <= 1.5) return '#3b82f6'; // blue
    if (abs <= 3) return '#f59e0b'; // amber
    return '#ef4444'; // red - extreme
  };

  return (
    <div className={`flex flex-col ${compact ? 'gap-0.5' : 'gap-1'}`}>
      {!compact && (
        <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider">
          <span>Left</span>
          <span>Center</span>
          <span>Right</span>
        </div>
      )}
      <div className="relative">
        <div
          className="w-full rounded-full bias-gradient"
          style={{ height: compact ? 4 : 6 }}
        />
        {/* Center marker */}
        <div
          className="absolute top-0 w-0.5 bg-white/30"
          style={{
            left: '50%',
            height: compact ? 4 : 6,
            transform: 'translateX(-50%)',
          }}
        />
        {/* Position indicator */}
        <div
          className="absolute rounded-full border-2 border-white shadow-lg"
          style={{
            left: `${position}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: compact ? 10 : 14,
            height: compact ? 10 : 14,
            backgroundColor: getColor(bias),
          }}
        />
      </div>
      <div className="flex justify-center">
        <span
          className="text-xs font-medium"
          style={{ color: getColor(bias) }}
        >
          {getLabel(bias)}
        </span>
      </div>
    </div>
  );
}
