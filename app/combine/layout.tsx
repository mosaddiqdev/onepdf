import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Combine | 1PDF",
  description:
    "Configure your PDF combining settings. Choose quality, pages per sheet, and apply filters like grayscale and color inversion.",
  keywords: [
    "PDF combine",
    "merge PDFs",
    "PDF settings",
    "pages per sheet",
    "PDF quality",
    "grayscale PDF",
  ],
  openGraph: {
    title: "Combine PDFs | 1PDF",
    description:
      "Configure your PDF combining settings. Choose quality, pages per sheet, and apply filters.",
    url: "/combine",
  },
  twitter: {
    title: "Combine PDFs | 1PDF",
    description:
      "Configure your PDF combining settings. Choose quality, pages per sheet, and apply filters.",
  },
};

export default function CombineLayout({ children }: { children: React.ReactNode }) {
  return children;
}
