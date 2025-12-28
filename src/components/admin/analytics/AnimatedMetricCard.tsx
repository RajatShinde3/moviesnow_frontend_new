// components/admin/analytics/AnimatedMetricCard.tsx
'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricCardData } from '@/types/analytics';

interface AnimatedMetricCardProps {
  data: MetricCardData;
  delay?: number;
}

export function AnimatedMetricCard({ data, delay = 0 }: AnimatedMetricCardProps) {
  const Icon = data.icon;
  const isPositive = data.trend === 'up';
  const isNegative = data.trend === 'down';
  const isNeutral = data.trend === 'neutral';

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendColor = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-white/40';
  const trendBg = isPositive ? 'bg-green-500/20' : isNegative ? 'bg-red-500/20' : 'bg-white/5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay,
        type: 'spring',
        damping: 25,
        stiffness: 300
      }}
      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background-elevated to-background-hover p-6 border border-white/10 hover:border-white/30 transition-all"
      whileHover={{ scale: 1.02, y: -4 }}
    >
      {/* Animated Background Glow */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top right, ${data.color}15, transparent 70%)`
        }}
      />

      {/* Content */}
      <div className="relative">
        {/* Icon */}
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${data.color}20`, borderColor: `${data.color}30` }}
      //@ts-expect-error
            className="border"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>

          {/* Trend Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${trendBg} ${trendColor}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">
              {Math.abs(data.change)}%
            </span>
          </div>
        </div>

        {/* Label */}
        <p className="text-sm text-white/60 mb-1">{data.label}</p>

        {/* Value with Count Up Animation */}
        <motion.h3
          className="text-3xl font-bold mb-2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
        >
          {typeof data.value === 'number' ? data.value.toLocaleString() : data.value}
        </motion.h3>

        {/* Change Label */}
        <p className="text-xs text-white/50">{data.changeLabel}</p>

        {/* Progress Bar */}
        <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: data.color }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.abs(data.change) * 2, 100)}%` }}
            transition={{ delay: delay + 0.3, duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Hover Sparkle Effect */}
      <motion.div
        className="absolute -top-10 -right-10 w-20 h-20 rounded-full opacity-0 group-hover:opacity-20 blur-2xl"
        style={{ backgroundColor: data.color }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </motion.div>
  );
}
