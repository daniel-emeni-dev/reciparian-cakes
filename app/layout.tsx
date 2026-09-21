import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "./components/SiteHeader";
import { Toaster } from "sonner";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Reciparian Cakes | Fresh Bakery in Port Harcourt",
    template: "%s | Reciparian Cakes",
  },
  description:
    "Fresh cakes, cupcakes, pastries, and custom cake orders, baked daily in Port Harcourt. Order online for delivery across Rivers State or pickup at our Rumuigbo location.",
  keywords: [
    "Reciparian Cakes",
    "Port Harcourt bakery",
    "custom cakes Port Harcourt",
    "cake delivery Rivers State",
    "cupcakes Port Harcourt",
  ],
  openGraph: {
    title: "Reciparian Cakes | Fresh Bakery in Port Harcourt",
    description:
      "Fresh cakes, cupcakes, pastries, and custom cake orders, baked daily in Port Harcourt.",
    type: "website",
    locale: "en_NG",
    siteName: "Reciparian Cakes",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
