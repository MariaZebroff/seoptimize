import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";
import { NotificationProvider } from "@/contexts/NotificationContext";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "SEO Optimize",
  description: "SEO optimization tool with authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --font-lato: ${lato.style.fontFamily};
            }
          `
        }} />
      </head>
      <body
        className={`${lato.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <NotificationProvider>
          <GoogleAnalytics />
          {children}
          <CookieConsent />
        </NotificationProvider>
      </body>
    </html>
  );
}
