import type { Metadata } from "next";
import "./globals.css";
import { RoleProvider } from "@/lib/context/RoleContext";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

export const metadata: Metadata = {
  title: "Winery Management Suite - VinoSphere",
  description:
    "Winery proprietor portal and management suite for Nashik vineyard estates.",
  keywords: [
    "winery dashboard",
    "winery management",
    "wine portfolio tracker",
    "vineyard SaaS",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#F8F9FB]" suppressHydrationWarning>
        <ThemeProvider>
          <RoleProvider>
            <main className="min-h-screen">{children}</main>
          </RoleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
