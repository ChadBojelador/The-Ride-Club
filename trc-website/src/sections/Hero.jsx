import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Hero.css';

const SLIDES = [
  {
    id: 'rides',
    label: 'RIDES',
    number: '01',
    tagline: 'Hit the Road Together.',
    description: 'Join curated group rides across the most scenic routes. Every weekend, a new adventure awaits.',
    cardGradient: 'linear-gradient(160deg, #3043E4 0%, #1A28A8 100%)',
    bgGradient: 'linear-gradient(145deg, #0d1a6b 0%, #1A28A8 30%, #3043E4 65%, #141414 100%)',
    cta: 'Find a Ride →',
  },
  {
    id: 'community',
    label: 'COMMUNITY',
    number: '02',
    tagline: 'Ride With Your Crew.',
    description: 'Connect with thousands of riders who share your passion. Your next best friend is on two wheels.',
    cardGradient: 'linear-gradient(160deg, #D04D44 0%, #A62E26 100%)',
    bgGradient: 'linear-gradient(145deg, #5a1410 0%, #A62E26 30%, #D04D44 65%, #141414 100%)',
    cta: 'Join the Club →',
  },
  {
    id: 'explore',
    label: 'EXPLORE',
    number: '03',
    tagline: 'Discover New Roads.',
    description: 'Unlock hidden routes, scenic byways, and legendary roads mapped by real riders for real riders.',
    cardGradient: 'linear-gradient(160deg, #FEC60F 0%, #D59F00 100%)',
    bgGradient: 'linear-gradient(145deg, #6b4800 0%, #D59F00 30%, #FEC60F 65%, #141414 100%)',
    cta: 'See the Map →',
  },
  {
    id: 'events',
    label: 'EVENTS',
    number: '04',
    tagline: 'Never Miss a Meetup.',
    description: 'From local garage nights to epic multi-day rally tours — every event, all in one place.',
    cardGradient: 'linear-gradient(160deg, #3043E4 0%, #D04D44 100%)',
    bgGradient: 'linear-gradient(145deg, #1A28A8 0%, #3043E4 40%, #D04D44 80%, #141414 100%)',
    cta: 'Browse Events →',
  },
  {
    id: 'app',
    label: 'THE APP',
    number: '05',
    tagline: 'Your Ride, In Your Pocket.',
    description: 'Navigation, group tracking, ride history, and the full community — download and roll.',
    cardGradient: 'linear-gradient(160deg, #222222 0%, #3043E4 100%)',
    bgGradient: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 40%, #3043E4 100%)',
    cta: 'Download Now →',
  },
];

const AUTO_ADVANCE_MS = 5500;

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const timerRef = useRef(null);

  const goToSlide = useCallback(
    (index) => {
      if (index === activeIndex || isTransitioning) return;
      setPrevIndex(activeIndex);
      setIsTransitioning(true);
      setActiveIndex(index);
      setTimeout(() => {
        setPrevIndex(null);
        setIsTransitioning(false);
      }, 750);
    },
    [activeIndex, isTransitioning]
  );

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (hoveredIndex === null) {
        setActiveIndex((prev) => {
          const next = (prev + 1) % SLIDES.length;
          setPrevIndex(prev);
          setIsTransitioning(true);
          setTimeout(() => {
            setPrevIndex(null);
            setIsTransitioning(false);
          }, 750);
          return next;
        });
      }
    }, AUTO_ADVANCE_MS);
  }, [hoveredIndex]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  const handleCardEnter = (i) => {
    setHoveredIndex(i);
    clearInterval(timerRef.current);
    goToSlide(i);
  };

  const handleCardLeave = () => {
    setHoveredIndex(null);
    resetTimer();
  };

  const active = SLIDES[activeIndex];
  const prev = prevIndex !== null ? SLIDES[prevIndex] : null;

  return (
    <section className="hero" id="hero" aria-label="Hero showcase">
      {/* ── Background layers (crossfade) ── */}
      <div className="hero__backgrounds" aria-hidden="true">
        {prev && (
          <div
            key={`prev-${prevIndex}`}
            className="hero__bg hero__bg--prev"
            style={{ background: prev.bgGradient }}
          />
        )}
        <div
          key={`active-${activeIndex}`}
          className={`hero__bg hero__bg--active ${isTransitioning ? 'hero__bg--fade-in' : ''}`}
          style={{ background: active.bgGradient }}
        />
        {/* Decorative dot grid overlay */}
        <div className="hero__dot-grid" />
        {/* Bottom vignette */}
        <div className="hero__vignette" />
      </div>

      {/* ── Main content ── */}
      <div className="hero__content" key={activeIndex}>
        <span className="hero__eyebrow">{active.label}</span>
        <h1 className="hero__tagline">{active.tagline}</h1>
        <p className="hero__description">{active.description}</p>
        <div className="hero__content-actions">
          <button className="hero__cta btn-chunky btn-chunky--primary">
            {active.cta}
          </button>
          {/* Progress dots inline with CTA */}
          <div className="hero__dots" role="tablist" aria-label="Slide navigation">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                role="tab"
                aria-selected={i === activeIndex}
                aria-label={`Go to ${slide.label}`}
                className={`hero__dot ${i === activeIndex ? 'hero__dot--active' : ''}`}
                onClick={() => goToSlide(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Netflix showcase strip ── */}
      <div className="hero__strip" role="list" aria-label="Page showcase">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            role="listitem"
            id={`hero-card-${slide.id}`}
            className={[
              'hero__card',
              i === activeIndex ? 'hero__card--active' : '',
              i === hoveredIndex ? 'hero__card--hovered' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onMouseEnter={() => handleCardEnter(i)}
            onMouseLeave={handleCardLeave}
            onClick={() => goToSlide(i)}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && goToSlide(i)}
            aria-label={`${slide.label}: ${slide.tagline}`}
          >
            {/* Card background */}
            <div
              className="hero__card-bg"
              style={{ background: slide.cardGradient }}
            />

            {/* Shine layer */}
            <div className="hero__card-shine" />

            {/* Card number */}
            <span className="hero__card-number" aria-hidden="true">
              {slide.number}
            </span>

            {/* Default label */}
            <span className="hero__card-label">{slide.label}</span>

            {/* Hover overlay */}
            <div className="hero__card-overlay" aria-hidden="true">
              <p className="hero__card-ov-title">{slide.tagline}</p>
              <p className="hero__card-ov-desc">{slide.description}</p>
              <span className="hero__card-ov-cta">{slide.cta}</span>
            </div>

            {/* Active progress bar */}
            {i === activeIndex && (
              <div className="hero__card-progress" key={`prog-${activeIndex}`} />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
