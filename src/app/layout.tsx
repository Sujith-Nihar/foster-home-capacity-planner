import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { APP_DESCRIPTION, APP_NAME, APP_TITLE } from "@/config/navigation";
import { REPORTING_DATE } from "@/config/metrics";

import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: APP_TITLE,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  other: {
    "reporting-date": REPORTING_DATE,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
