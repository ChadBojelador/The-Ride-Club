import React, { useState, useEffect } from 'react';
import './TopNav.css';

const NAV_LINKS = [
  { id: 'hero',    label: 'Home',    href: '#hero',    number: '01' },
  { id: 'about',   label: 'About',   href: '#about',   number: '02' },
  { id: 'contact', label: 'Contact', href: '#contact', number: '03' },
];

export default function TopNav() {
  const [open, setOpen] = useState(false);

  /* Lock body scroll when menu is open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      {/* ── Top bar (always visible) ── */}
      <header className="top-nav" aria-label="Site header">
        {/* Hamburger button */}
        <button
          id="top-nav-toggle"
          className={`top-nav__burger ${open ? 'top-nav__burger--open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="top-nav-overlay"
        >
          <span className="top-nav__bar top-nav__bar--1" />
          <span className="top-nav__bar top-nav__bar--2" />
          <span className="top-nav__bar top-nav__bar--3" />
        </button>

        {/* Brand wordmark */}
        <a href="#hero" className="top-nav__brand" aria-label="The Rides Club — home">
          <span className="top-nav__brand-trc">TRC</span>
          <span className="top-nav__brand-dot">·</span>
          <span className="top-nav__brand-sub">The Rides Club</span>
        </a>

        {/* Right slot — CTA */}
        <a href="#app" className="top-nav__cta btn-chunky btn-chunky--yellow">
          Get the App
        </a>
      </header>

      {/* ── Full-screen overlay ── */}
      <div
        id="top-nav-overlay"
        className={`top-nav__overlay ${open ? 'top-nav__overlay--open' : ''}`}
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Backdrop (click to close) */}
        <div className="top-nav__backdrop" onClick={close} />

        {/* Menu panel */}
        <nav className="top-nav__panel">
          {/* Close button inside panel */}
          <button
            className="top-nav__close"
            onClick={close}
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Nav links */}
          <ul className="top-nav__list">
            {NAV_LINKS.map((link, i) => (
              <li
                key={link.id}
                className="top-nav__item"
                style={{ '--i': i }}
              >
                <a
                  href={link.href}
                  className="top-nav__link"
                  onClick={close}
                >
                  <span className="top-nav__link-num">{link.number}</span>
                  <span className="top-nav__link-text">{link.label}</span>
                  <span className="top-nav__link-arrow">→</span>
                </a>
              </li>
            ))}
          </ul>

          {/* Footer inside panel */}
          <div className="top-nav__panel-footer">
            <span className="top-nav__panel-tagline">Ride together. Go further.</span>
            <a href="#app" className="btn-chunky btn-chunky--primary" onClick={close}>
              Download the App
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
