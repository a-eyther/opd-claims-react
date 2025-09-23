import React from 'react';
import { cn } from '../../utils/cn';

const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
  };

  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
};

export default Badge;