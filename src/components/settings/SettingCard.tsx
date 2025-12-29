/**
 * SettingCard Component
 * Professional card container for settings sections
 * Eye-comfortable color scheme with soft grays
 */

import * as React from 'react';
import { Icon, type IconName } from '@/components/icons/Icon';
import { cn } from '@/lib/cn';

interface SettingCardProps {
  title: string;
  description?: string;
  icon: IconName;
  children: React.ReactNode;
  className?: string;
}

export const SettingCard: React.FC<SettingCardProps> = ({
  title,
  description,
  icon,
  children,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#3A3A3A] bg-[#1A1A1A] p-6',
        'hover:border-[#4A4A4A] transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <Icon name={icon} className="text-[#F0F0F0]" size={24} />
        <div>
          <h2 className="text-xl font-semibold text-[#F0F0F0]">{title}</h2>
          {description && (
            <p className="text-sm text-[#808080] mt-1">{description}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  );
};

SettingCard.displayName = 'SettingCard';
