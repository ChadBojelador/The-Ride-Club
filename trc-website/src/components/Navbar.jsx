import React, { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar-wrapper ${isScrolled ? 'navbar-wrapper--scrolled' : ''}`}>
      <div className="container">
        <nav className="navbar" aria-label="Main Navigation">
          {/* Official Brand Logo */}
          <a href="#" className="navbar__logo" aria-label="The Rides Club Home">
            <img 
              src="/images/logo-trimmed.webp" 
              alt="The Rides Club" 
              className="navbar__logo-img"
              width="145"
              height="48"
            />
          </a>

          {/* Desktop Nav Links */}
          <ul className="navbar__links">
            <li>
              <a href="#routes" className="navbar__link">
                <span>Routes</span>
              </a>
            </li>
            <li>
              <a href="#features" className="navbar__link">
                <span>Features</span>
              </a>
            </li>
            <li>
              <a href="#map" className="navbar__link">
                <span>Map World</span>
              </a>
            </li>
            <li>
              <a href="#community" className="navbar__link">
                <span>Community</span>
              </a>
            </li>
          </ul>

          {/* Nav Actions */}
          <div className="navbar__actions">
            <a href="#early-access" className="btn-chunky btn-chunky--primary navbar__cta">
              <span>Get Access</span>
              <span className="navbar__cta-arrow">→</span>
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className={`navbar__toggle ${mobileMenuOpen ? 'navbar__toggle--open' : ''}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="navbar__toggle-bar"></span>
              <span className="navbar__toggle-bar"></span>
              <span className="navbar__toggle-bar"></span>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      <div className={`navbar__mobile-drawer ${mobileMenuOpen ? 'navbar__mobile-drawer--open' : ''}`}>
        <div className="navbar__mobile-inner container">
          <ul className="navbar__mobile-links">
            <li>
              <a 
                href="#routes" 
                className="navbar__mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="navbar__mobile-icon">🗺️</span>
                <span>Discover Routes</span>
              </a>
            </li>
            <li>
              <a 
                href="#features" 
                className="navbar__mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="navbar__mobile-icon">⚡</span>
                <span>Features</span>
              </a>
            </li>
            <li>
              <a 
                href="#map" 
                className="navbar__mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="navbar__mobile-icon">📍</span>
                <span>Map World</span>
              </a>
            </li>
            <li>
              <a 
                href="#community" 
                className="navbar__mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="navbar__mobile-icon">👥</span>
                <span>Community</span>
              </a>
            </li>
          </ul>

          <div className="navbar__mobile-cta">
            <a 
              href="#early-access" 
              className="btn-chunky btn-chunky--primary"
              style={{ width: '100%' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span>Download & Early Access 🚀</span>
            </a>
          </div>

          <div className="navbar__mobile-tagline">
            <span className="badge-pill">🏁 Ride it. Map it. Share it.</span>
          </div>
        </div>
      </div>
    </header>
  );
}
