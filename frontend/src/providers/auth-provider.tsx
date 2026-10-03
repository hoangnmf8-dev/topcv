"use client";
import { useAccountStore } from "@/stores/auth.store";
import React, { ReactNode, useEffect } from "react";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { account, setAccount } = useAccountStore((state) => state);
  useEffect(() => {
    if (!account) {
      void setAccount().catch(() => undefined);
    }
  }, [account, setAccount]);
  return <>{children}</>;
}
