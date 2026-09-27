import type { Metadata } from "next";
import "./globals.css";
import { MedcinProvider } from "@/lib/store";
import { BrandingProvider } from "@/lib/branding";
import brandingData from "@/config/branding.json";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: `${brandingData.client.name} — ${brandingData.client.tagline}`,
  description: brandingData.client.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans-ledger bg-[var(--paper)] text-[var(--ink)] transition-colors">
        <BrandingProvider>
          <MedcinProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </MedcinProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}
