import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "./providers";
import { EventsQueueProvider } from "@/lib/events-queue-context";
import { Toaster } from "sonner";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KeyDrop — Secure Credential Collector",
  description: "Collect API keys from clients securely",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased bg-gray-50 text-gray-900 min-h-screen`}>
        <Toaster position="top-right" richColors closeButton />
        <Providers>
          <EventsQueueProvider>{children}</EventsQueueProvider>
        </Providers>
      </body>
    </html>
  );
}
