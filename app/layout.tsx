import type { Metadata } from "next";
import { DM_Sans, Dancing_Script, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "./components/SiteHeader";
import { Toaster } from "sonner";
import { SiteFooter } from "@/app/components/SiteFooter";
import { MotionProvider } from "@/app/components/MotionProvider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  display: "swap",
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
      className={`${dmSans.variable} ${playfair.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MotionProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </MotionProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}