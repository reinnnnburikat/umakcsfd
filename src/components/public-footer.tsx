import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-muted/50 border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl">
                i+
              </div>
              <div>
                <div className="font-bold text-xl">iCSFD+</div>
                <div className="text-sm text-muted-foreground">
                  Integrated CSFD Digital Management System
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Your digital gateway to student services at the University of Makati.
              Center for Student Formation and Discipline.
            </p>
            <p className="text-sm font-medium text-foreground">
              University of Makati. University of Character.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/track"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Track Request
                </Link>
              </li>
              <li>
                <Link
                  href="/verify"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link
                  href="/services/gmc"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Good Moral Certificate
                </Link>
              </li>
              <li>
                <Link
                  href="/services/uer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Uniform Exemption
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About CSFD
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  University of Makati, J.P. Rizal Extension, West Rembo, Makati City
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a
                  href="tel:8883-1875"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  8883-1875
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <a
                  href="mailto:csfd@umak.edu.ph"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  csfd@umak.edu.ph
                </a>
              </li>
            </ul>
            <div className="mt-4 flex flex-col gap-1">
              <a
                href="https://umak.edu.ph"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
              >
                umak.edu.ph <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://umak.edu.ph/centers/csfd/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1"
              >
                umak.edu.ph/centers/csfd <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} University of Makati - Center for Student Formation and Discipline. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
