'use client';
import { useEffect } from 'react';
import { useAccountStore } from '@/stores/auth.store';

export default function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { account, setAccount } = useAccountStore();
  useEffect(() => {
    if (!account) {
      setAccount();
    }
  }, [account, setAccount]);

  return <>{children}</>;
}