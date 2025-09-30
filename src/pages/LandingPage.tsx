import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import { SearchFeaturesBento } from '../sourcing'; 
import EngagementBento from '../components/EngagementBento';
import GlobalReach from '../components/GlobalReach';
import TabFeatures from '../components/TabFeatures';
import Integrations from '../components/Integrations';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="space-y-16">
        <Hero />
        <AnimatedSection delay={0.1}>
          <SearchFeaturesBento />
        </AnimatedSection>
        <AnimatedSection delay={0.3}>
          <EngagementBento />
        </AnimatedSection>
        <GlobalReach />
        <TabFeatures />
        <Integrations />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
