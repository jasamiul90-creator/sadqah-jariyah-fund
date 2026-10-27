'use client';

import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';
import { toBengaliNumber } from '@/lib/bangla';

interface MonthlyData {
  month: string;
  collection: number;
  expenses: number;
  balance: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const CATEGORY_COLORS = ['#059669', '#0284c7', '#d97706', '#9333ea', '#e11d48', '#64748b'];

export function MonthlyComparisonChart({ data }: { data: MonthlyData[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-72 w-full flex items-center justify-center text-gray-400">চার্ট লোড হচ্ছে...</div>;

  return (
    <div className="h-80 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            tickFormatter={(val) => `৳${toBengaliNumber(val)}`}
          />
          <Tooltip
            formatter={(value: any) => [`৳ ${toBengaliNumber(value)}`, '']}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar name="আদায় (Collection)" dataKey="collection" fill="#059669" radius={[6, 6, 0, 0]} />
          <Bar name="ব্যয় (Expenses)" dataKey="expenses" fill="#e11d48" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FundBalanceTrendChart({ data }: { data: MonthlyData[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-72 w-full flex items-center justify-center text-gray-400">চার্ট লোড হচ্ছে...</div>;

  return (
    <div className="h-80 w-full pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickLine={false}
            tickFormatter={(val) => `৳${toBengaliNumber(val)}`}
          />
          <Tooltip
            formatter={(value: any) => [`৳ ${toBengaliNumber(value)}`, 'তহবিল স্থিতি']}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#047857"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#balanceGradient)"
            name="বর্তমান স্থিতি (Balance)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpenseCategoryPieChart({ data }: { data: CategoryData[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-72 w-full flex items-center justify-center text-gray-400">চার্ট লোড হচ্ছে...</div>;

  const validData = data.filter((d) => d.value > 0);

  if (validData.length === 0) {
    return (
      <div className="h-72 w-full flex flex-col items-center justify-center text-gray-400 text-sm">
        <span>এখনও কোনো ব্যয়ের রেকর্ড নেই</span>
      </div>
    );
  }

  return (
    <div className="h-80 w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPie>
          <Pie
            data={validData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {validData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => [`৳ ${toBengaliNumber(value)}`, 'ব্যয়']} />
          <Legend />
        </RechartsPie>
      </ResponsiveContainer>
    </div>
  );
}
