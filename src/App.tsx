import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PartnersSlider from './components/PartnersSlider';
import NaturalLanguageSearch from './components/NaturalLanguageSearch'; 
import DataSourcesSearch from './components/DataSourcesSearch';
import ProfileEvaluation from './components/ProfileEvaluation';
import EmailSequences from './components/EmailSequences';
import GlobalReach from './components/GlobalReach';
import TabFeatures from './components/TabFeatures';
import Integrations from './components/Integrations';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import SignIn from './components/SignIn';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/signin"
          element={<SignIn />}
        />
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 font-sans">
              <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
              <Navbar />
              <main className="space-y-16">
                <Hero />
                <PartnersSlider />
                <NaturalLanguageSearch />
                <DataSourcesSearch />
                <ProfileEvaluation />
                <EmailSequences />
                <GlobalReach />
                <TabFeatures />
                <Integrations />
                <FAQ />
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;