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
  title: "Kenko — what your symptoms could mean",
  description:
    "Answer a few easy questions and get a clear, honest answer about what your symptoms could mean and what to do next.",
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
                <p className="max-w-3xl text-xs leading-relaxed text-muted">
                  <span className="font-medium text-body">
                    Please remember:
                  </span>{" "}
                  Kenko is a learning tool, not a doctor. It cannot diagnose or
                  treat you. Health information links come from MedlinePlus.gov,
                  a free service of the U.S. National Library of Medicine, which
                  does not endorse Kenko. If you feel unwell, please talk to a
                  real healthcare professional.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
