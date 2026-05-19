import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { checkOnboarding } from '@/lib/actions/onboarding';
import { Navbar } from './landing/_components/navbar';
import { Hero } from './landing/_components/hero';
import { Dashboard } from './landing/_components/dashboard';
import { Features } from './landing/_components/features';
import { HowItWorks } from './landing/_components/how-it-works';
import { ChatDemo } from './landing/_components/chat-demo';
import { Testimonials } from './landing/_components/testimonials';
import { Pricing } from './landing/_components/pricing';
import { FinalCTA } from './landing/_components/footer';
import Footer from './landing/_components/footer';

export default async function Home() {
  const session = await getSession();

  // Authenticated users → app
  if (session) {
    const onboarded = await checkOnboarding();
    redirect(onboarded ? '/chat' : '/onboarding');
  }

  // Guests → landing page
  return (
    <div className="landing">
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
    </div>
  );
}
