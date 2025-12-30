/**
 * SettingItem Component
 * Individual setting row within a card
 * Eye-comfortable colors with proper contrast
 */

import * as React from 'react';
import { Icon, type IconName } from '@/components/icons/Icon';
import { cn } from '@/lib/cn';

interface SettingItemProps {
  icon: IconName;
  label: string;
  description?: string;
  value?: string | React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  label,
  description,
  value,
  action,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-3',
        'border-b border-[#3A3A3A] last:border-0',
        className
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Icon name={icon} className="text-[#B0B0B0] flex-shrink-0" size={20} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#F0F0F0]">{label}</p>
          {description && (
            <p className="text-xs text-[#808080] mt-0.5">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {value && (
          <span className="text-sm text-[#B0B0B0]">
            {typeof value === 'string' ? value : value}
          </span>
        )}
        {action}
      </div>
    </div>
  );
};

SettingItem.displayName = 'SettingItem';
