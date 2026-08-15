import React from 'react';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
      </main>
    </div>
  );
}
