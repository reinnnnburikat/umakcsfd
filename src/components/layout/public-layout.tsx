import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";

interface PublicLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export function PublicLayout({
  children,
  showNavbar = true,
  showFooter = true,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <PublicNavbar />}
      <main className="flex-1">{children}</main>
      {showFooter && <PublicFooter />}
    </div>
  );
}
