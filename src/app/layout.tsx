import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "도파민빵 팩토리",
  description: "배송 · KEEP · 랜깡 · 카드도감",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
