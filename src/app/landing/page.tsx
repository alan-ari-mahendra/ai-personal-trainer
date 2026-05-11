import { Navbar } from "./_components/navbar";
import { Hero } from "./_components/hero";
import { Dashboard } from "./_components/dashboard";
import { Features } from "./_components/features";
import { HowItWorks } from "./_components/how-it-works";
import { ChatDemo } from "./_components/chat-demo";
import { Testimonials } from "./_components/testimonials";
import { Pricing } from "./_components/pricing";
import { FinalCTA } from "./_components/footer";
import Footer from "./_components/footer";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Dashboard />
      <Features />
      <HowItWorks />
      <ChatDemo />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </>
  );
}
