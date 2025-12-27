// components/admin/analytics/TimeRangeSelector.tsx
'use client';

import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';
import { TimeRange } from '@/types/analytics';

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onChange: (range: TimeRange) => void;
}

const TIME_RANGES: Array<{ value: TimeRange; label: string }> = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '90 Days' },
  { value: '1y', label: '1 Year' },
  { value: 'all', label: 'All Time' }
];

export function TimeRangeSelector({ selected, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center gap-3 p-2 bg-background-elevated rounded-xl border border-white/10">
      <div className="flex items-center gap-2 px-3 text-white/60">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Period</span>
      </div>

      <div className="flex gap-1">
        {TIME_RANGES.map((range) => (
          <motion.button
            key={range.value}
            onClick={() => onChange(range.value)}
            className={`
              relative px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${selected === range.value
                ? 'text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {selected === range.value && (
              <motion.div
                layoutId="activeRange"
                className="absolute inset-0 bg-gradient-to-r from-accent-primary to-accent-secondary rounded-lg"
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10">{range.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
