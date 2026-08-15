import React from 'react';
import TopNav from './components/TopNav';
import Hero from './sections/Hero';
import AboutSection from './sections/AboutSection';
import ContactSection from './sections/ContactSection';

export default function App() {
  return (
    <div className="app">
      <TopNav />
      <main>
        <Hero />
        <AboutSection />
        <ContactSection />
      </main>
    </div>
  );
}
