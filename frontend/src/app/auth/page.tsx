import { AuthCard } from "@/components/auth-card";
import { RoleFooter } from "@/components/role-footer";

export default function Page() {
  return (
    <div className="route-auth flex min-h-svh flex-col bg-background">
      <main className="relative flex w-full flex-1 items-center justify-center overflow-hidden px-4 py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:44px_44px] opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
        />
        <div className="relative z-10 w-full">
          <div className="mx-auto flex w-full justify-center">
            <AuthCard />
          </div>
        </div>
      </main>
      <RoleFooter variant="minimal" />
    </div>
  );
}
