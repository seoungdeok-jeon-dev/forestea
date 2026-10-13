import type { Metadata } from "next";
import { Suspense } from "react";
import { Fraunces, Outfit } from "next/font/google";
import { CartProvider } from "@/context/cart-context";
import { ProgressProvider } from "@/context/progress-context";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";
import { AuthSessionProvider } from "@/components/session-provider";
import { FavoritesProvider } from "@/context/favorites-context";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Forestea",
  description: "Forest café & tea house — order ahead for pickup.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <Suspense fallback={null}>
          <AuthSessionProvider>
            <FavoritesProvider>
              <ProgressProvider>
                <CartProvider>
                  <Header />
                  <main className="flex flex-1 flex-col">{children}</main>
                  <SiteFooter />
                </CartProvider>
              </ProgressProvider>
            </FavoritesProvider>
          </AuthSessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
