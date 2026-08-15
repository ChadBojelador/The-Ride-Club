import React, { useState } from 'react';
import './ContactSection.css';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    /* Replace with real submission logic when ready */
    setSent(true);
  };

  return (
    <section className="contact section" id="contact" aria-labelledby="contact-heading">
      <div className="container contact__inner">

        {/* Left — Creator profile & copy */}
        <div className="contact__copy">
          <span className="tag-3d tag-3d--yellow">Contact</span>
          
          <div className="contact__creator-card">
            <div className="contact__avatar-wrapper">
              <img
                src="/images/creator.jpg"
                alt="Chad Bojelador - Creator of The Rides Club"
                className="contact__avatar"
              />
              <span className="contact__badge">Creator</span>
            </div>
            <div className="contact__creator-info">
              <h3 className="contact__creator-name">Chad Bojelador</h3>
              <p className="contact__creator-role">Founder & Developer</p>
            </div>
          </div>

          <h2 id="contact-heading" className="contact__heading">
            Say hello<br />
            <span className="contact__heading-accent">to the Creator.</span>
          </h2>
          <p className="contact__body">
            Got a feature idea? Want to collaborate? Or just want to talk about bikes?
            Drop a message — Chad reads every one.
          </p>

          {/* Social links */}
          <div className="contact__socials">
            <a
              href="https://github.com/ChadBojelador"
              target="_blank"
              rel="noopener noreferrer"
              className="contact__social-link"
              id="contact-github"
              aria-label="GitHub profile"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              <span>GitHub</span>
            </a>
            <a
              href="#"
              className="contact__social-link"
              id="contact-facebook"
              aria-label="Facebook profile"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              <span>Facebook</span>
            </a>
            <a
              href="#"
              className="contact__social-link"
              id="contact-instagram"
              aria-label="Instagram profile"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>Instagram</span>
            </a>
          </div>
        </div>

        {/* Right — form */}
        <div className="contact__form-wrap">
          {sent ? (
            <div className="contact__success" role="alert">
              <div className="contact__success-badge">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <p className="contact__success-title">Message sent!</p>
              <p className="contact__success-sub">
                Chad will get back to you soon. Ride safe!
              </p>
              <button
                className="btn-chunky btn-chunky--yellow"
                onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}
              >
                Send another →
              </button>
            </div>
          ) : (
            <form
              className="contact__form"
              onSubmit={handleSubmit}
              noValidate
              aria-label="Contact form"
            >
              <div className="contact__field">
                <label htmlFor="contact-name" className="contact__label">
                  Your Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  className="contact__input"
                  placeholder="e.g. Juan dela Cruz"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="contact__field">
                <label htmlFor="contact-email" className="contact__label">
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  className="contact__input"
                  placeholder="juan@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="contact__field">
                <label htmlFor="contact-message" className="contact__label">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  className="contact__input contact__textarea"
                  placeholder="Tell us about your idea, feedback, or just say hi..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                id="contact-submit"
                className="btn-chunky btn-chunky--primary contact__submit"
              >
                Send Message →
              </button>
            </form>
          )}
        </div>

      </div>

      {/* Footer strip */}
      <div className="contact__footer">
        <p className="contact__footer-text">
          © {new Date().getFullYear()} The Rides Club · Built by Chad Bojelador
        </p>
      </div>
    </section>
  );
}
