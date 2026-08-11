import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理画面",
  robots: { index: false, follow: false },
};

// Passthrough layout. The dashboard pages wrap themselves in <AdminShell>;
// the login page renders its own full-screen UI. Auth is enforced by proxy.ts.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
