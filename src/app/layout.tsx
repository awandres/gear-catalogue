import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { AdminProvider } from "@/contexts/AdminContext";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { AdminToolbar } from "@/components/admin/AdminToolbar";
import { Navigation } from "@/components/Navigation";
import { VersionBadge } from "@/components/VersionBadge";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gear Catalogue - Professional Studio Equipment",
  description: "Browse and manage professional studio gear",
  icons: {
    icon: [
      { url: '/vinyl-record.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/vinyl-record.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AdminProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                padding: '16px',
                borderRadius: '8px',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#fff',
                },
              },
            }}
          />
          <div className="min-h-screen">
            <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <Link href="/" className="text-xl font-bold">Gear Catalogue</Link>
                  <Navigation />
                </div>
                <AdminToggle />
              </div>
            </header>
            
            {/* Version badge - floating bottom right */}
            <VersionBadge />
            
            <main className="pt-16">
              {children}
            </main>
            
            <AdminToolbar />
          </div>
        </AdminProvider>
      </body>
    </html>
  );
}
