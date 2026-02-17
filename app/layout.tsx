import type { Metadata } from "next";
import { Inter, Amiri } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const amiri = Amiri({
  subsets: ["latin", "arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri"
});

export const metadata: Metadata = {
  title: "Kejut Sahur - Servis Kejut Sahur by Friend",
  description: "Biar member kejut kau bangun sahur, confirm bangun!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${amiri.variable} antialiased bg-slate-950 text-slate-100 min-h-screen`}>
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
