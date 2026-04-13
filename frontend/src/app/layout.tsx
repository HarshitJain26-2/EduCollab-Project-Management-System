import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "EduCollab — Project Management for College Teams",
  description: "A modern project management and collaboration platform for college project groups, guides, and team leaders.",
};

import { SocketProvider } from "@/context/SocketContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={inter.variable}>
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#16213e',
                  color: '#f1f5f9',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                },
                success: { iconTheme: { primary: '#34d399', secondary: '#16213e' } },
                error: { iconTheme: { primary: '#f87171', secondary: '#16213e' } },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
