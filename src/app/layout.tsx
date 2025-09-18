import { config } from "@/config";
import { signOgImageUrl } from "@/lib/og-image";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    absolute: config.home.metadata.title.absolute,
    default: config.home.metadata.title.default,
    template: config.home.metadata.title.template,
  },
  description: config.home.metadata.description,
  openGraph: {
    title: config.home.metadata.title.default,
    description: config.home.metadata.description,
    images: [
      signOgImageUrl({
        title: config.home.name,
      }),
    ],
  },
};

// ✅ Option 1: Remove `params` entirely
export interface RootLayoutProps {
  children: React.ReactNode;
}

// ✅ Option 2: If you want to keep `params` for future use, type as Promise<any>
// export interface RootLayoutProps {
//   children: React.ReactNode;
//   params?: Promise<any>;
// }

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased max-w-6xl m-auto",
          fontSans.variable
        )}
      >
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
