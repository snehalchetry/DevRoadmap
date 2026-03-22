import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "DevRoadmap.live",
  description:
    "AI-generated developer roadmaps built from your public GitHub profile.",
  metadataBase: new URL("https://devroadmap.live"),
  openGraph: {
    title: "DevRoadmap.live",
    description:
      "Know exactly what to learn next from an AI analysis of your GitHub profile.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "DevRoadmap.live",
    description:
      "Personalized developer roadmaps generated from your GitHub profile."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} bg-[var(--bg)] text-[var(--text-primary)] antialiased`}
      >
        <div aria-hidden="true" className="app-aurora">
          <div
            className="aurora-blob left-[-6rem] top-[4rem] h-[32rem] w-[32rem]"
            style={{
              ["--duration" as string]: "16s",
              ["--blob-color" as string]: "rgba(109,183,255,0.34)"
            }}
          />
          <div
            className="aurora-blob right-[-8rem] top-[8rem] h-[36rem] w-[36rem]"
            style={{
              ["--duration" as string]: "20s",
              ["--blob-color" as string]: "rgba(126,245,197,0.28)"
            }}
          />
          <div
            className="aurora-blob bottom-[-10rem] left-[24%] h-[34rem] w-[34rem]"
            style={{
              ["--duration" as string]: "22s",
              ["--blob-color" as string]: "rgba(255,157,108,0.22)"
            }}
          />
        </div>
        {children}
      </body>
    </html>
  );
}
