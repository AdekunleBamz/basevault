import { motion } from 'framer-motion';

/**
 * Skeleton loading component for displaying placeholder content
 * while data is being fetched
 */
export function Skeleton({ className = '', variant = 'text', width, height, rounded = 'lg' }) {
  const baseClasses = 'bg-base-border animate-pulse';
  const roundedClass = `rounded-${rounded}`;
  
  const variantStyles = {
    text: 'h-4',
    title: 'h-6',
    card: 'h-32',
    circle: 'rounded-full',
    button: 'h-12',
    avatar: 'w-10 h-10 rounded-full',
  };
  
  const style = {
    width: width || '100%',
    height: height || undefined,
  };

  return (
    <div 
      className={`${baseClasses} ${variantStyles[variant] || ''} ${roundedClass} ${className}`}
      style={style}
    />
  );
}

/**
 * Skeleton loader for stats cards
 */
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 rounded-2xl bg-base-card border border-base-border">
          <Skeleton variant="avatar" className="mb-3" />
          <Skeleton className="mb-2" width="60%" />
          <Skeleton variant="title" width="80%" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton loader for vault/lottery cards
 */
export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-base-card border border-base-border">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton variant="avatar" />
        <Skeleton width="40%" variant="title" />
      </div>
      <Skeleton className="mb-4" height="60px" />
      <Skeleton className="mb-3" />
      <Skeleton className="mb-3" />
      <Skeleton variant="button" />
    </div>
  );
}

/**
 * Skeleton loader for leaderboard
 */
export function LeaderboardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-base-card border border-base-border">
      <div className="flex items-center gap-2 mb-6">
        <Skeleton variant="avatar" />
        <Skeleton width="40%" variant="title" />
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-base-dark">
            <Skeleton width="32px" height="32px" rounded="full" />
            <Skeleton className="flex-1" />
            <Skeleton width="80px" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Full page loading skeleton
 */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-base-darker p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-8 p-4 rounded-xl bg-base-card">
          <div className="flex items-center gap-3">
            <Skeleton variant="avatar" />
            <Skeleton width="120px" variant="title" />
          </div>
          <Skeleton width="160px" variant="button" />
        </div>
        
        {/* Stats skeleton */}
        <div className="mb-8">
          <StatsSkeleton />
        </div>
        
        {/* Cards skeleton */}
        <div className="grid lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <LeaderboardSkeleton />
        </div>
      </div>
    </div>
  );
}

/**
 * Inline spinner for buttons
 */
export function Spinner({ size = 'sm', className = '' }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.div
      className={`border-2 border-current border-t-transparent rounded-full ${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}
