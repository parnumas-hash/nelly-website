import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/context/Providers";
import { getSiteUrl } from "@/lib/site-config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "NELLY GROUP | Premium Pet Lifestyle",
    template: "%s | NELLY GROUP",
  },
  description:
    "Curated premium pet lifestyle store featuring AIRBUGGY PET, MANDARINE BROTHERS, RADICA, ROSEWOOD, FUKU FUKU PET, HARRY'S PET, Earth Rated, and FuzzYard.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nellygroup.com",
    siteName: "NELLY GROUP",
    title: "NELLY GROUP | Premium Pet Lifestyle",
    description:
      "Curated premium pet lifestyle store with the world's finest pet brands.",
    images: [
      {
        url: "/images/nelly-group-logo.png",
        width: 480,
        height: 240,
        alt: "NELLY GROUP CO., LTD.",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
