import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FontLoader } from "@/components/font-loader";
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CO'WATCH! - Digital Clock & Focus Timer",
  description: "A beautiful digital clock and focus timer app with customizable themes",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: "CO'WATCH!"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#EBEBEB" id="theme-color-meta" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CO'WATCH!" />
        {/* Preload SF Pro Rounded fonts - Only 3 weights */}
        <link
          rel="preload"
          href="/fonts/SF-Pro-Rounded-Semibold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/SF-Pro-Rounded-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/SF-Pro-Rounded-Black.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Force font loading - Only 3 weights */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @font-face {
                font-family: 'SF Pro Rounded';
                src: url('/fonts/SF-Pro-Rounded-Semibold.woff2') format('woff2');
                font-weight: 600;
                font-style: normal;
                font-display: block;
              }
              @font-face {
                font-family: 'SF Pro Rounded';
                src: url('/fonts/SF-Pro-Rounded-Bold.woff2') format('woff2');
                font-weight: 700;
                font-style: normal;
                font-display: block;
              }
              @font-face {
                font-family: 'SF Pro Rounded';
                src: url('/fonts/SF-Pro-Rounded-Black.woff2') format('woff2');
                font-weight: 900;
                font-style: normal;
                font-display: block;
              }
              * {
                font-family: 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, system-ui, sans-serif !important;
              }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div suppressHydrationWarning={true}>
          <FontLoader />
        </div>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
