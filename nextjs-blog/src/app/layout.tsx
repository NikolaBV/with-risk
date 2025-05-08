import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WithRisk",
  description: "Risk Management Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <html lang="en" className="dark">
        <body className={inter.className}>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <Toaster />
        </body>
      </html>
    </AuthProvider>
  );
}
