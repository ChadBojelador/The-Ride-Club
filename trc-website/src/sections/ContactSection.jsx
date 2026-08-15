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

        {/* Left — copy */}
        <div className="contact__copy">
          <span className="tag-3d tag-3d--yellow">Contact</span>
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
              <span className="contact__social-icon">🐙</span>
              <span>GitHub</span>
            </a>
            <a
              href="#"
              className="contact__social-link"
              id="contact-facebook"
              aria-label="Facebook profile"
            >
              <span className="contact__social-icon">📘</span>
              <span>Facebook</span>
            </a>
            <a
              href="#"
              className="contact__social-link"
              id="contact-instagram"
              aria-label="Instagram profile"
            >
              <span className="contact__social-icon">📸</span>
              <span>Instagram</span>
            </a>
          </div>
        </div>

        {/* Right — form */}
        <div className="contact__form-wrap">
          {sent ? (
            <div className="contact__success" role="alert">
              <span className="contact__success-icon">🏍️</span>
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
          © {new Date().getFullYear()} The Rides Club · Built with 🏍️ by Chad Bojelador
        </p>
      </div>
    </section>
  );
}
