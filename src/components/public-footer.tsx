import React from "react";
import Image from "next/image";

export function PublicFooter() {
  return (
    <footer
      className="text-white px-6 md:px-12 py-8 md:py-10 mt-auto"
      style={{ backgroundColor: "#3d3d3d" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        {/* Column 1 - Contact Info */}
        <div className="flex-1">
          <h3
            className="text-lg font-bold mb-5"
            style={{ color: "#ffc400" }}
          >
            Contact us
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 bg-white/20 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
              <span className="text-xs text-white/60">f</span>
            </div>
            <span>@UMak CSFD</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 bg-white/20 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
              <span className="text-xs">🌐</span>
            </div>
            <span>umak.edu.ph/centers/csfd/</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-6 h-6 bg-white/20 rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
              <span className="text-xs">📞</span>
            </div>
            <span>8883-1875</span>
          </div>
        </div>

        {/* Column 2 - General Concern */}
        <div className="flex-1">
          <div className="mb-4">
            <span
              className="block text-sm underline mb-1"
              style={{ color: "#ffc400" }}
            >
              For general concern
            </span>
            <div className="flex items-center gap-2">
              <span className="text-white">✉</span>
              <span className="text-sm text-white hover:opacity-80 transition-opacity cursor-pointer">
                csfd.umak.edu.ph
              </span>
            </div>
          </div>
        </div>

        {/* Column 3 - Complaint Concern */}
        <div className="flex-1">
          <div className="mb-4">
            <span
              className="block text-sm underline mb-1"
              style={{ color: "#ffc400" }}
            >
              For complaint concern
            </span>
            <div className="flex items-center gap-2">
              <span className="text-white">✉</span>
              <span className="text-sm text-white hover:opacity-80 transition-opacity cursor-pointer">
                umakpsd.umak.edu.ph
              </span>
            </div>
          </div>
        </div>

        {/* Column 4 - Good Moral Certificate */}
        <div className="flex-1">
          <div className="mb-4">
            <span
              className="block text-sm underline mb-1"
              style={{ color: "#ffc400" }}
            >
              For request of good moral certificate concern
            </span>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-white">✉</span>
              <span className="text-sm text-white hover:opacity-80 transition-opacity cursor-pointer">
                csfdgoodmoral.umak.edu.ph
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white">✉</span>
              <span className="text-sm text-white hover:opacity-80 transition-opacity cursor-pointer">
                csfdgoodmoralcertificate@gmail.com
              </span>
            </div>
          </div>
        </div>

        {/* Column 5 - Logos */}
        <div className="flex-1 flex justify-center items-center gap-4">
          <Image
            src="/logos/UMAK LOGO.png"
            alt="University of Makati"
            width={80}
            height={80}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
          />
          <Image
            src="/logos/CSFD LOGO.png"
            alt="CSFD"
            width={80}
            height={80}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
          />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto border-t border-white/20 mt-8 pt-6 text-center">
        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} University of Makati - Center for Student
          Formation and Discipline. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
