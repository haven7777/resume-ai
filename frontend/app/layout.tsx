import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ResumeAI — AI-Powered Resume & Job Match Analyzer",
  description:
    "Upload your resume and job description. Get a comprehensive analysis from 3 specialized AI agents in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-purple-700 focus:shadow-lg focus:font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
