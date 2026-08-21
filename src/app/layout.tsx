import "./globals.css";

import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";

import { getSessionUser } from "@/lib/appHeaderData";
import { DEFAULT_THEME } from "@/lib/theme";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();
  const theme = user?.theme ?? DEFAULT_THEME;

  return (
    <html
      lang="en"
      data-theme={theme}
      className={`${dmSans.variable} ${dmSerifDisplay.variable} antialiased`}
    >
      {/* min-h-dvh (dynamic viewport height), not min-h-full: `full` is a percentage
          chained through html's own height, which is fragile (breaks if any ancestor
          in that chain loses an explicit height) and doesn't account for mobile browser
          chrome showing/hiding. `dvh` always reflects the actual visible viewport, so
          the body — and any `flex-1` main content inside it — reliably fills at least
          one full screen, keeping a page footer pinned to the bottom instead of
          floating right after short content. */}
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
