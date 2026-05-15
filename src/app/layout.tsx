import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AdminShortcut } from "@/components/layout/AdminShortcut";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finance — Powered by Sociusin",
  description: "Track Every Rupee Smartly. Finance Powered by Sociusin helps you manage income, expenses, and business cash flow effortlessly.",
  keywords: ["finance", "tracking", "expense manager", "business finance", "sociusin"],
};

import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>
          {children}
          <AdminShortcut />
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

