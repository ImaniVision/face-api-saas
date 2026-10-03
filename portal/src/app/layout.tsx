import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthSessionProvider } from "@/components/session-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Imani Vision: 1:1 face verification API",
  description:
    "Enroll a person from 5 photos, then check whether a new photo is the same person. Stored templates can't be turned back into a face.",
};

import { ThemeProvider } from "@/components/theme-provider";
import { PrivacyNotice } from "@/components/privacy-notice";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthSessionProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="bottom-right" />
            <PrivacyNotice />
          </ThemeProvider>
        </body>
      </html>
    </AuthSessionProvider>
  );
}
