import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { LayoutContent } from "./layout-content";

export const metadata: Metadata = {
  title: "Clinical Excellence 3D",
  description: "Advanced Clinical Dashboard with 3D Anatomical Analysis",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-surface">
        <Providers>
          <LayoutContent>
            {children}
          </LayoutContent>
        </Providers>
      </body>
    </html>
  );
}
