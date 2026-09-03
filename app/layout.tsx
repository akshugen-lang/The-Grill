import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Grill — Repository Specialist Audit",
  description: "Scans public GitHub repos and puts your code through a 3-agent specialist interview.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-[#7C9B7E]/30 selection:text-[#EAE6DC]">
        {children}
      </body>
    </html>
  );
}
