import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthSessionProvider } from "@/components/session-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Imani Vision — Facial Verification API",
  description:
    "Verify logins, approve transactions, and run liveness checks with face templates that can't be turned back into a face.",
};

import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthSessionProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* General Sans for headings (§2.3). Inter is the fallback until it loads. */}
          <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
          <link
            href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body
          className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </body>
      </html>
    </AuthSessionProvider>
  );
}
