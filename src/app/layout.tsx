import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "./providers";
import { EventsQueueProvider } from "@/lib/events-queue-context";
import { Toaster } from "sonner";
import { BugReporterInit } from "@/components/BugReporterInit";
import { ErrorLoggerInit } from "@/components/ErrorLoggerInit";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KeyDrop — Secure Credential Sharing",
  description: "Send and receive API keys and credentials through encrypted one-time links",
  openGraph: {
    title: "KeyDrop — Secure Credential Sharing",
    description: "Send and receive API keys and credentials through encrypted one-time links",
    url: "https://1-2clicks.vercel.app",
    siteName: "KeyDrop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KeyDrop — Secure Credential Sharing",
    description: "Send and receive API keys and credentials through encrypted one-time links",
  },
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
        <BugReporterInit />
        <ErrorLoggerInit />
        <Providers>
          <EventsQueueProvider>{children}</EventsQueueProvider>
        </Providers>
      </body>
    </html>
  );
}
