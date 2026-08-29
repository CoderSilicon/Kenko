import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "./components/SiteHeader";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kenko",
  description:
    "A guided symptom evaluation tool that turns health uncertainty into clear, actionable next steps.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-paper font-sans text-ink">
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="no-print w-full border-t border-line bg-surface">
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold tracking-tight">
                  Kenko<span className="text-accent">.</span>
                </p>
                <p className="max-w-3xl text-xs font-light leading-relaxed text-muted">
                  <span className="font-medium text-body">
                    Medical Disclaimer:
                  </span>{" "}
                  Kenko is an AI-powered educational tool. It does not diagnose,
                  treat, or replace professional medical advice. Outputs may
                  contain inaccuracies. Always consult a licensed healthcare
                  provider to confirm any evaluation before making health
                  decisions.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
