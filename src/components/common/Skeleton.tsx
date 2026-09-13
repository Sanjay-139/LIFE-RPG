import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-surface-container-high/70 rounded ${className}`}
      aria-hidden="true"
    />
  );
};

export const QuestCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-3 w-full max-w-xl">
        <Skeleton className="w-5 h-5 rounded mt-1 shrink-0" />
        <div className="flex flex-col gap-2 w-full">
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-14 rounded" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
};

export const DashboardCardSkeleton: React.FC = () => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 flex flex-col gap-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="space-y-3 pt-2">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
};
