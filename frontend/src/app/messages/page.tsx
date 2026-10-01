"use client";

import { LoadingState } from "@/components/loading-state";
import { Suspense } from "react";
import { MessagesPanel } from "@/components/messages-panel";
import { SiteHeader } from "@/components/site-header";
import { RoleFooter } from "@/components/role-footer";
export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SiteHeader />
      <div className="mx-auto max-w-[1280px] px-4 py-7">
        <h1 className="mb-5 text-2xl font-bold">Tin nhắn</h1>
        <Suspense fallback={<LoadingState fullscreen />}>
          <MessagesPanel />
        </Suspense>
      </div>
      <RoleFooter variant="candidate" />
    </main>
  );
}
