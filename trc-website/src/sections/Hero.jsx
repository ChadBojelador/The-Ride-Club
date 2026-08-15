import React, { useState } from 'react';
import './Hero.css';

export default function Hero() {
  const [activePin, setActivePin] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  const waypoints = [
    {
      id: 0,
      title: 'Old Timber Café',
      type: '☕ Coffee & Pitstop',
      km: 'KM 14.2',
      note: 'Fresh mountain brew & biker parking',
      tag: 'FAVORITE'
    },
    {
      id: 1,
      title: 'Sunset Ridge Viewpoint',
      type: '📸 Scenic Overlook',
      km: 'KM 48.6',
      note: '360° valley view at golden hour',
      tag: 'MUST STOP'
    },
    {
      id: 2,
      title: 'Devil\'s Elbow Twisties',
      type: '🏍️ 14 Hairpin Turns',
      km: 'KM 72.1',
      note: 'Flawless tarmac & smooth banking',
      tag: 'EPIC ROAD'
    },
  ];

  return (
    <section className="hero section" id="hero">
      <div className="container hero__container">
        
        {/* Left Column: Headline, Story & CTAs */}
        <div className="hero__content">
          {/* Eyebrow Pill */}
          <div className="hero__eyebrow">
            <span className="badge-pill">
              <span className="hero__eyebrow-dot"></span>
              RIDE IT. MAP IT. SHARE IT.
            </span>
          </div>

          {/* Main Bubble Headline */}
          <h1 className="hero__title">
            <span className="hero__title-line1">YOUR NEXT RIDE</span>
            <span className="hero__title-line2">
              <span className="bubble-title bubble-title--blue">STARTS</span>
              <span className="tag-3d hero__title-tag">HERE</span>
            </span>
          </h1>

          {/* Subtitle / Story Lead */}
          <p className="hero__description">
            The motorcycle community where every twist, scenic stop, and hidden mountain café turns into a route worth riding again.
          </p>

          {/* Value Props Pills */}
          <div className="hero__chips">
            <span className="hero__chip">
              <span className="hero__chip-icon">🗺️</span> Real Rider Routes
            </span>
            <span className="hero__chip">
              <span className="hero__chip-icon">📸</span> Photo Waypoints
            </span>
            <span className="hero__chip">
              <span className="hero__chip-icon">👥</span> Biker Community
            </span>
          </div>

          {/* CTA Button Group */}
          <div className="hero__actions">
            <a href="#early-access" className="btn-chunky btn-chunky--primary hero__btn-main">
              <span>Get Early Access</span>
              <span className="hero__btn-emoji">🚀</span>
            </a>
            
            <a href="#routes" className="btn-chunky btn-chunky--secondary hero__btn-sub">
              <span>Explore Routes</span>
              <span className="hero__btn-emoji">🗺️</span>
            </a>
          </div>

          {/* Mini Feeling Quote */}
          <div className="hero__quote-card">
            <span className="hero__quote-icon">❝</span>
            <p className="hero__quote-text">
              Helmet on. Engine starts. <strong>You have nowhere to be.</strong>
            </p>
          </div>
        </div>

        {/* Right Column: Pure CSS/SVG Interactive Map & Ride Showcase (No Image Assets) */}
        <div className="hero__visual">
          {/* Floating Sticker: Distance */}
          <div className="hero__sticker hero__sticker--top-right">
            <div className="hero__sticker-inner">
              <span className="hero__sticker-label">TOTAL ROUTE</span>
              <strong className="hero__sticker-value">87.4 KM</strong>
            </div>
          </div>

          {/* Floating Sticker: Elevation */}
          <div className="hero__sticker hero__sticker--bottom-left">
            <div className="hero__sticker-inner hero__sticker-inner--red">
              <span className="hero__sticker-label">ELEVATION GAIN</span>
              <strong className="hero__sticker-value">+1,420 M ⛰️</strong>
            </div>
          </div>

          {/* Main Interactive Map Card */}
          <div className="hero__map-card">
            {/* Card Header Bar */}
            <div className="hero__map-header">
              <div className="hero__map-title-wrap">
                <span className="hero__map-badge">LIVE ROUTE PREVIEW</span>
                <h3 className="hero__map-route-name">Batangas → Tagaytay Pass</h3>
              </div>
              <button 
                className="hero__map-pulse-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? "Pause Animation" : "Play Animation"}
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>
            </div>

            {/* SVG Interactive Road Map Canvas */}
            <div className="hero__map-canvas">
              <svg 
                viewBox="0 0 520 340" 
                className="hero__map-svg"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Grid Pattern */}
                <defs>
                  <pattern id="hero-grid" width="26" height="26" patternUnits="userSpaceOnUse">
                    <path d="M 26 0 L 0 0 0 26" fill="none" stroke="rgba(20,20,20,0.06)" strokeWidth="1.5" />
                  </pattern>
                  {/* Road Shadow */}
                  <filter id="road-shadow" x="-10%" y="-10%" width="120%" height="130%">
                    <feDropShadow dx="0" dy="6" stdDeviation="0" floodColor="#141414" />
                  </filter>
                </defs>

                <rect width="100%" height="100%" fill="#FFFFFF" />
                <rect width="100%" height="100%" fill="url(#hero-grid)" />

                {/* Topographic Contour Lines (Vector aesthetic) */}
                <path d="M -20,80 Q 120,40 240,110 T 540,60" fill="none" stroke="#E7EAFE" strokeWidth="3" strokeDasharray="6,6" />
                <path d="M -20,200 Q 160,150 280,240 T 540,190" fill="none" stroke="#FFECA0" strokeWidth="3" strokeDasharray="6,6" />
                <path d="M -20,290 Q 200,240 380,310 T 540,270" fill="none" stroke="#FCE8E6" strokeWidth="3" strokeDasharray="6,6" />

                {/* Road Base (Black thick border) */}
                <path
                  id="main-road-base"
                  d="M 40,280 C 90,260 110,180 180,180 C 250,180 260,80 340,90 C 420,100 440,220 480,200"
                  fill="none"
                  stroke="#141414"
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Road Surface (Vibrant Royal Blue) */}
                <path
                  id="main-road"
                  d="M 40,280 C 90,260 110,180 180,180 C 250,180 260,80 340,90 C 420,100 440,220 480,200"
                  fill="none"
                  stroke="#3043E4"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Road Center Dashes (Yellow) */}
                <path
                  d="M 40,280 C 90,260 110,180 180,180 C 250,180 260,80 340,90 C 420,100 440,220 480,200"
                  fill="none"
                  stroke="#FEC60F"
                  strokeWidth="2.5"
                  strokeDasharray="8,8"
                  strokeLinecap="round"
                />

                {/* Animated Motorcycle Marker riding along the road */}
                <g className={`hero__biker-marker ${isPlaying ? 'hero__biker-marker--animated' : ''}`}>
                  <circle r="18" fill="#FEC60F" stroke="#141414" strokeWidth="3" />
                  <text textAnchor="middle" dy="6" fontSize="16">🏍️</text>
                </g>

                {/* Waypoint Pin 1: Cafe (x: 130, y: 195) */}
                <g 
                  className={`hero__map-pin ${activePin === 0 ? 'hero__map-pin--active' : ''}`}
                  transform="translate(130, 200)"
                  onClick={() => setActivePin(0)}
                >
                  <circle r="14" fill="#D04D44" stroke="#141414" strokeWidth="2.5" />
                  <text textAnchor="middle" dy="4" fontSize="12" fill="#FFFFFF">☕</text>
                </g>

                {/* Waypoint Pin 2: Viewpoint (x: 270, y: 110) */}
                <g 
                  className={`hero__map-pin ${activePin === 1 ? 'hero__map-pin--active' : ''}`}
                  transform="translate(270, 110)"
                  onClick={() => setActivePin(1)}
                >
                  <circle r="16" fill="#3043E4" stroke="#141414" strokeWidth="3" />
                  <text textAnchor="middle" dy="5" fontSize="13" fill="#FFFFFF">📸</text>
                </g>

                {/* Waypoint Pin 3: Finish / Twisties (x: 440, y: 170) */}
                <g 
                  className={`hero__map-pin ${activePin === 2 ? 'hero__map-pin--active' : ''}`}
                  transform="translate(440, 170)"
                  onClick={() => setActivePin(2)}
                >
                  <circle r="14" fill="#FEC60F" stroke="#141414" strokeWidth="2.5" />
                  <text textAnchor="middle" dy="4" fontSize="12">🏁</text>
                </g>
              </svg>

              {/* Waypoint Interactive Popover Card */}
              <div className="hero__waypoint-popover">
                <div className="hero__popover-tag">{waypoints[activePin].tag}</div>
                <div className="hero__popover-header">
                  <span className="hero__popover-type">{waypoints[activePin].type}</span>
                  <span className="hero__popover-km">{waypoints[activePin].km}</span>
                </div>
                <h4 className="hero__popover-title">{waypoints[activePin].title}</h4>
                <p className="hero__popover-note">{waypoints[activePin].note}</p>
                
                {/* Waypoint quick selector tabs */}
                <div className="hero__popover-tabs">
                  {waypoints.map((wp, idx) => (
                    <button
                      key={wp.id}
                      className={`hero__popover-tab ${activePin === idx ? 'hero__popover-tab--active' : ''}`}
                      onClick={() => setActivePin(idx)}
                    >
                      Point {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Live Metrics Bar */}
            <div className="hero__map-footer">
              <div className="hero__metric">
                <span className="hero__metric-icon">⏱️</span>
                <div>
                  <div className="hero__metric-val">2h 14m</div>
                  <div className="hero__metric-lbl">Ride Time</div>
                </div>
              </div>
              
              <div className="hero__metric-divider"></div>

              <div className="hero__metric">
                <span className="hero__metric-icon">🎯</span>
                <div>
                  <div className="hero__metric-val">100% Curvy</div>
                  <div className="hero__metric-lbl">Road Grade</div>
                </div>
              </div>

              <div className="hero__metric-divider"></div>

              <div className="hero__metric">
                <span className="hero__metric-icon">📍</span>
                <div>
                  <div className="hero__metric-val">4 Stops</div>
                  <div className="hero__metric-lbl">Discovered</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
