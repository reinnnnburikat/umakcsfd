import Link from "next/link";
import { Facebook, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold text-sm">
                CSFD
              </div>
              <div>
                <div className="font-semibold text-foreground">iCSFD+</div>
                <div className="text-xs text-muted-foreground">UMak Student Services</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Center for Student Formation and Discipline - Your digital gateway to student services at the University of Makati.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Request a Service
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Track Request
                </Link>
              </li>
              <li>
                <Link href="/verify" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services/gmc" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Good Moral Certificate
                </Link>
              </li>
              <li>
                <Link href="/services/uer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Uniform Exemption
                </Link>
              </li>
              <li>
                <Link href="/services/cdc" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cross-Dressing Clearance
                </Link>
              </li>
              <li>
                <Link href="/services/cac" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Child Admission Clearance
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>University of Makati, J.P. Rizal St., West Rembo, Makati City</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>8883-1875</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span>csfd@umak.edu.ph</span>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <Link
                href="https://facebook.com/umakcsfd"
                target="_blank"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} University of Makati - Center for Student Formation and Discipline. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
