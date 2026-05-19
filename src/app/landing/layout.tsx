import "./landing.css";

export const metadata = {
  title: "FitAI — Your AI-Powered Personal Trainer",
  description:
    "Track workouts, nutrition, and recovery — all in one chat. Personalized. Adaptive. Always on.",
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="landing">{children}</div>;
}
