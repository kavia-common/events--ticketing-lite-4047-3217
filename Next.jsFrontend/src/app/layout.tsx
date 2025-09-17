import type { Metadata } from "next";
import "./globals.css";
import Nav from "./(ui)/Nav";

export const metadata: Metadata = {
  title: "Event Ticketing",
  description: "Manage events, tickets, and check-in",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-black">
        <Nav />
        <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
