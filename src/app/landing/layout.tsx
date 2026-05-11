import { Manrope, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./landing.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-landing",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "FORGEAI — Your AI-Powered Personal Trainer",
  description:
    "Track workouts, nutrition, and recovery — all in one chat. Personalized. Adaptive. Always on.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`landing ${manrope.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      style={{ fontFamily: "var(--font-body), system-ui, sans-serif" }}
    >
      {children}
    </div>
  );
}
