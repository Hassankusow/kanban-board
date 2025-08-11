import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ApolloWrapper from "@/lib/ApolloWrapper";

const geistSans = Geist({
  subsets: ["latin"],
  display: "block",
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "block",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "MyCritters Onboarding",
  description: "Kanban board demo app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <ApolloWrapper>{children}</ApolloWrapper> {}
      </body>
    </html>
  );
}
