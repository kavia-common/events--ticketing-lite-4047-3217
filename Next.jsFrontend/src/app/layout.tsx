import type { Metadata } from "next";
import "./globals.css";
import Nav from "./(ui)/Nav";
import MotionProvider from "@/components/ui/MotionProvider";

export const metadata: Metadata = {
  title: "Event Ticketing - Modern Event Management",
  description: "Create events, manage tickets, and handle check-ins with style",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 text-gray-900">
        <MotionProvider>
          <Nav />
          <main className="app-container">{children}</main>
        </MotionProvider>
      </body>
    </html>
  );
}
