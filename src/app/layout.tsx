import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Signal Check — Truth in Every Story",
  description: "Unbiased, fact-checked news aggregated from multiple sources with transparency scores and bias analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
        <Header />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
