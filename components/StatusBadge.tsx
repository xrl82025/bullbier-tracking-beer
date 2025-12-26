
import React from 'react';
import { BarrelStatus } from '../types';
import { STATUS_COLORS, STATUS_LABELS, STATUS_ICONS } from '../constants';

interface StatusBadgeProps {
  status: BarrelStatus;
  showIcon?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-400';
  const label = STATUS_LABELS[status] || status;
  const icon = STATUS_ICONS[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white ${colorClass} shadow-sm`}>
      {showIcon && icon}
      {label}
    </span>
  );
};

export default StatusBadge;
