import { PublicNavbar } from "./public-navbar";
import { Footer } from "./footer";

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
      {showFooter && <Footer />}
    </div>
  );
}
