import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { DestinationProvider } from "@/lib/destinationContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Echoes of a Place — Conversations with History",
    template: "%s · Echoes of a Place",
  },
  description:
    "Tourists visit places. We help them have conversations with history. Discover destinations through stories, traditions, local voices, and living heritage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <AuthProvider>
          <DestinationProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 sm:px-6">
                {children}
              </main>
              <Footer />
            </div>
          </DestinationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
