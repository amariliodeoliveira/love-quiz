import "./globals.css";

import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Couples Card Deck",
  description: "A little game for the two of you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerifDisplay.variable} antialiased`}
    >
      {/* min-h-dvh (dynamic viewport height), not min-h-full: `full` is a percentage
          chained through html's own height, which is fragile (breaks if any ancestor
          in that chain loses an explicit height) and doesn't account for mobile browser
          chrome showing/hiding. `dvh` always reflects the actual visible viewport, so
          the body — and any `flex-1` main content inside it — reliably fills at least
          one full screen, keeping a page footer pinned to the bottom instead of
          floating right after short content. */}
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
