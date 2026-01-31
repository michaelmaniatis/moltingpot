'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pill?: boolean;
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
};

const sizeStyles = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-2.5 py-1 text-sm',
};

const dotStyles = {
  default: 'bg-gray-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  purple: 'bg-purple-500',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pill = true,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${pill ? 'rounded-full' : 'rounded'}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />
      )}
      {children}
    </span>
  );
}

// Preset badges
export function StatusBadge({ status }: { status: 'available' | 'busy' | 'offline' }) {
  const variants = {
    available: { variant: 'success' as const, label: 'Available' },
    busy: { variant: 'warning' as const, label: 'Busy' },
    offline: { variant: 'default' as const, label: 'Offline' },
  };

  const { variant, label } = variants[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function PRStatusBadge({ status }: { status: 'pending' | 'merged' | 'closed' }) {
  const variants = {
    pending: { variant: 'warning' as const, label: 'Open' },
    merged: { variant: 'purple' as const, label: 'Merged' },
    closed: { variant: 'default' as const, label: 'Closed' },
  };

  const { variant, label } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function SkillBadge({ skill }: { skill: string }) {
  return (
    <Badge variant="default" size="sm">
      {skill}
    </Badge>
  );
}

export function PointsBadge({ points }: { points: number }) {
  return (
    <Badge variant="purple" size="md">
      {points} pts
    </Badge>
  );
}

export function CountBadge({ count, max = 99 }: { count: number; max?: number }) {
  return (
    <Badge
      variant="error"
      size="sm"
      pill
      className="min-w-[20px] justify-center"
    >
      {count > max ? `${max}+` : count}
    </Badge>
  );
}

export function NewBadge() {
  return (
    <Badge variant="success" size="sm">
      New
    </Badge>
  );
}
