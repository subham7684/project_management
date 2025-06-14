"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppSelector } from '@/lib/hooks/redux';

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAppSelector(state => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  if (!token) {
    return <div>Loading...</div>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
