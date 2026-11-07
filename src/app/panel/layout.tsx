import AuthProvider from "@/components/auth/AuthProvider";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
