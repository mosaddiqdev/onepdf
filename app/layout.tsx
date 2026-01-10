import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#DC4C4C",
};

export const metadata: Metadata = {
  title: "1PDF - Combine PDF Pages",
  description:
    "Merge multiple PDF pages onto single sheets. Save paper, save ink, save money. Built for students who print lecture notes.",
  keywords: [
    "PDF",
    "combine",
    "merge",
    "pages",
    "sheets",
    "print",
    "students",
    "lecture notes",
    "save paper",
  ],
  authors: [{ name: "1PDF" }],
  creator: "1PDF",
  publisher: "1PDF",
  applicationName: "1PDF",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "1PDF",
  },
  metadataBase: new URL("https://1pdf-app.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "1PDF - Combine PDF Pages",
    description: "Merge multiple PDF pages onto single sheets. Save paper, save ink, save money.",
    url: "https://1pdf-app.vercel.app",
    siteName: "1PDF",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/icons/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "1PDF Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "1PDF - Combine PDF Pages",
    description: "Merge multiple PDF pages onto single sheets. Save paper, save ink, save money.",
    images: ["/icons/web-app-manifest-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "32x32" },
      { url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${figtree.variable}`} data-scroll-behavior="smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <PWAProvider>{children}</PWAProvider>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
