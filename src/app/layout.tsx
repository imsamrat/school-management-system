import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "School Management System",
  description: "A comprehensive school management system built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress hydration warnings caused by browser extensions
              (function() {
                const originalError = console.error;
                const originalWarn = console.warn;
                
                const shouldSuppress = (message) => {
                  if (typeof message !== 'string') return false;
                  return message.includes('Hydration') || 
                         message.includes('hydration') ||
                         message.includes('did not match') ||
                         message.includes('tree hydrated') ||
                         message.includes('server rendered HTML') ||
                         message.includes('bis_skin_checked') ||
                         message.includes('react.dev/link/hydration-mismatch');
                };
                
                console.error = function(...args) {
                  if (shouldSuppress(args[0])) return;
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  if (shouldSuppress(args[0])) return;
                  originalWarn.apply(console, args);
                };
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
