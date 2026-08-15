import React from 'react';
import './AboutSection.css';

const PILLARS = [
  {
    id: 'ride',
    number: '01',
    title: 'Ride Together',
    body: 'Discover and join group rides happening near you. From casual weekend cruises to epic multi-day tours.',
    color: 'blue',
  },
  {
    id: 'connect',
    number: '02',
    title: 'Connect',
    body: 'Find your crew. Build friendships that start on the road and carry off it. The club is more than just a ride.',
    color: 'red',
  },
  {
    id: 'explore',
    number: '03',
    title: 'Explore',
    body: 'Unlock scenic routes, hidden roads, and legendary highways mapped by real riders across the country.',
    color: 'yellow',
  },
];

export default function AboutSection() {
  return (
    <section className="about section" id="about" aria-labelledby="about-heading">
      <div className="container">

        {/* Header */}
        <div className="about__header">
          <span className="tag-3d tag-3d--blue">The Rides Club</span>
          <h2 id="about-heading" className="about__heading">
            <span className="bubble-title--blue">Built for</span>
            <br />
            <span className="bubble-title--red">Riders,</span>
            <br />
            <span className="bubble-title--yellow">by Riders.</span>
          </h2>
          <p className="about__sub">
            The Rides Club is a motorcycle community app built to make group riding
            easier, safer, and way more fun. Whether you're a daily commuter or a
            weekend warrior — there's a ride for you.
          </p>
        </div>

        {/* Pillars */}
        <div className="about__pillars">
          {PILLARS.map((p, i) => (
            <div
              key={p.id}
              className={`about__card about__card--${p.color}`}
              style={{ '--delay': `${i * 80}ms` }}
            >
              <span className="about__card-num">{p.number}</span>
              <h3 className="about__card-title">{p.title}</h3>
              <p className="about__card-body">{p.body}</p>
            </div>
          ))}
        </div>

        {/* Big stat strip */}
        <div className="about__strip">
          <div className="about__stat">
            <span className="about__stat-num">100%</span>
            <span className="about__stat-label">Rider Powered</span>
          </div>
          <div className="about__strip-divider" aria-hidden="true" />
          <div className="about__stat">
            <span className="about__stat-num">01</span>
            <span className="about__stat-label">Community, One Mission</span>
          </div>
          <div className="about__strip-divider" aria-hidden="true" />
          <div className="about__stat">
            <span className="about__stat-num">24/7</span>
            <span className="about__stat-label">Open Road</span>
          </div>
        </div>

      </div>
    </section>
  );
}
