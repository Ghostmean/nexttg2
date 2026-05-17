"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { init, isTMA } from "@telegram-apps/sdk";

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isTMA()) {
      try {
        init();
      } catch (e) {
        console.error("Telegram SDK init error:", e);
      }
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-pulse rounded-full bg-orange-accent" />
      </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.14 0.025 286)",
            color: "oklch(0.97 0 0)",
            border: "1px solid oklch(0.2 0.025 286)",
          },
        }}
      />
    </ThemeProvider>
  );
}
