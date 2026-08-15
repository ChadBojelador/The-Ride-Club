import React, { useState } from 'react';
import './SidebarNav.css';

export default function SidebarNav() {
  const [activeItem, setActiveItem] = useState('home');
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: '🏠', href: '#' },
    { id: 'routes', label: 'Routes', icon: '🗺️', href: '#routes' },
    { id: 'features', label: 'Features', icon: '⚡', href: '#features' },
    { id: 'map', label: 'Map', icon: '📍', href: '#map' },
    { id: 'community', label: 'Club', icon: '🏍️', href: '#community' },
  ];

  return (
    <aside className={`side-nav ${isExpanded ? 'side-nav--expanded' : ''}`} aria-label="Main Navigation">
      <div className="side-nav__inner">
        {/* Mini Brand Stamp */}
        <a href="#" className="side-nav__stamp" aria-label="The Rides Club" title="The Rides Club">
          <span className="side-nav__stamp-icon">🏍️</span>
        </a>

        {/* Navigation List */}
        <nav className="side-nav__menu">
          <ul className="side-nav__list">
            {navItems.map((item) => (
              <li key={item.id} className="side-nav__item">
                <a
                  href={item.href}
                  className={`side-nav__link ${activeItem === item.id ? 'side-nav__link--active' : ''}`}
                  onClick={() => setActiveItem(item.id)}
                  title={item.label}
                >
                  <span className="side-nav__icon">{item.icon}</span>
                  <span className="side-nav__label">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action Button at bottom */}
        <div className="side-nav__footer">
          <a
            href="#early-access"
            className="side-nav__cta"
            title="Download App / Early Access"
          >
            <span className="side-nav__cta-icon">🚀</span>
            <span className="side-nav__cta-label">Get App</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
