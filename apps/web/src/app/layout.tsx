import type { Metadata } from "next";
import { Suspense } from "react";
import { CartProvider } from "@/context/cart-context";
import { ProgressProvider } from "@/context/progress-context";
import { Header } from "@/components/header";
import { AuthSessionProvider } from "@/components/session-provider";
import { FavoritesProvider } from "@/context/favorites-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Forestea — Forest Café",
  description: "Order coffee, tea, and pastries. Powered by Clover.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <Suspense fallback={null}>
          <AuthSessionProvider>
            <FavoritesProvider>
              <ProgressProvider>
                <CartProvider>
                  <Header />
                  <main className="flex flex-1 flex-col">{children}</main>
                  <footer className="border-t border-forest-800/10 bg-forest-900 py-12 text-center text-sm text-moss-200">
                    <p className="font-display text-lg text-cream-50">Forestea</p>
                    <p className="mt-2">15127 Main St E, Ste 102, Sumner, WA 98390 · Open daily 10:30am–9pm</p>
                  </footer>
                </CartProvider>
              </ProgressProvider>
            </FavoritesProvider>
          </AuthSessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
