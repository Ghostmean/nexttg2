import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AuthProvider } from "./auth-context";
import { TabBar } from "@/components/shared/tab-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Attendance Tracker",
  description: "Telegram Mini App для учёта посещаемости",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Providers>
          <AuthProvider>
            <div className="mx-auto flex min-h-screen max-w-lg flex-col">
              <main className="flex-1">{children}</main>
              <TabBar />
            </div>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
