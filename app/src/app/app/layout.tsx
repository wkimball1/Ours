import { AppShell } from "@/components/app-shell";
import { ensureProfile } from "@/lib/ours";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await ensureProfile();
  return <AppShell>{children}</AppShell>;
}
