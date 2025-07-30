import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

import ReactQueryProvider from "@/components/ReactQueryProvider";
import { Toaster } from "sonner"; // ✅ importamos el Toaster de sonner

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Actuadores Centralizados",
  description: "Sistema de gestión profesional de actuadores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <Toaster richColors position="top-center" />{" "}
          {/* ✅ Toaster activado */}
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}
