import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import { NaturalLanguageSearch, DataSourcesSearch, EmailSequences } from '../sourcing'; 
import ProfileEvaluation from '../components/ProfileEvaluation';
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
          <NaturalLanguageSearch />
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <DataSourcesSearch />
        </AnimatedSection>
        <AnimatedSection delay={0.3}>
          <ProfileEvaluation />
        </AnimatedSection>
        <AnimatedSection delay={0.4}>
          <EmailSequences />
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
