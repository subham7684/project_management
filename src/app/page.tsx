"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../lib/hooks/redux';

export default function HomePage() {
  const router = useRouter();
  const { token } = useAppSelector(state => state.auth);

  useEffect(() => {
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router, token]);

  return null;
}
