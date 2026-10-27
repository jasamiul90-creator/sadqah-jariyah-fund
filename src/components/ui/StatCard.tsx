import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
  badge?: string;
}

const variantStyles = {
  emerald: {
    bg: 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-100',
    iconBg: 'bg-emerald-800 text-white shadow-emerald-900/10',
    text: 'text-emerald-950',
    subText: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  amber: {
    bg: 'bg-amber-50/60 hover:bg-amber-50 border-amber-100',
    iconBg: 'bg-amber-600 text-white shadow-amber-900/10',
    text: 'text-amber-950',
    subText: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  rose: {
    bg: 'bg-rose-50/60 hover:bg-rose-50 border-rose-100',
    iconBg: 'bg-rose-600 text-white shadow-rose-900/10',
    text: 'text-rose-950',
    subText: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  blue: {
    bg: 'bg-sky-50/60 hover:bg-sky-50 border-sky-100',
    iconBg: 'bg-sky-700 text-white shadow-sky-900/10',
    text: 'text-sky-950',
    subText: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
  },
  purple: {
    bg: 'bg-purple-50/60 hover:bg-purple-50 border-purple-100',
    iconBg: 'bg-purple-700 text-white shadow-purple-900/10',
    text: 'text-purple-950',
    subText: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'emerald',
  badge,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'relative p-6 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between bg-white',
        styles.bg
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
            {title}
          </span>
          <div className={cn('text-2xl sm:text-3xl font-extrabold tracking-tight', styles.text)}>
            {value}
          </div>
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shadow-md', styles.iconBg)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-100">
        <span className={cn('font-medium', styles.subText)}>{subtitle}</span>
        {badge && (
          <span className={cn('px-2.5 py-0.5 rounded-full font-semibold border', styles.badge)}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
