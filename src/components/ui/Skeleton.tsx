'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export default function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent',
    none: '',
  };

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
}

// Preset skeleton components
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <Skeleton
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar />
        <div className="flex-1">
          <Skeleton width="40%" height={16} className="mb-2" />
          <Skeleton width="25%" height={12} />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonPostCard() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-start gap-3">
        <SkeletonAvatar size={48} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton width={100} height={16} />
            <Skeleton width={60} height={12} />
          </div>
          <SkeletonText lines={3} />
          <div className="flex gap-4 mt-3">
            <Skeleton width={50} height={20} />
            <Skeleton width={50} height={20} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <SkeletonAvatar size={32} />
          <div className="flex-1">
            <Skeleton width="50%" height={14} className="mb-1" />
            <Skeleton width="30%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}
