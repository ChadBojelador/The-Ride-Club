# The Rides Club — Website Architecture

## 1. Stack

* **React**
* **Vite**
* **JavaScript**
* **CSS**
* **npm**

The website is a client-side marketing website. No backend is required for the initial version.

---

## 2. Project Structure

```text
the-rides-club/
├── public/
│   └── images/
│
├── src/
│   ├── components/
│   ├── sections/
│   ├── assets/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── skills/
│   └── funky-bubble-design/
│       └── SKILL.md
│
├── AGENTS.md
├── PRD.md
├── ARCHITECTURE.md
├── README.md
├── package.json
└── vite.config.js
```

Keep the structure simple. Only create folders when they are needed.

---

## 3. React Structure

The website is primarily one landing page:

```text
App
└── Landing Page
    ├── Navbar
    ├── Hero
    ├── Introduction
    ├── Features
    ├── Ride Showcase
    ├── Map Showcase
    ├── App Preview
    ├── Community
    ├── CTA
    ├── FAQ
    └── Footer
```

Major page sections belong in `sections/`.

Reusable UI elements belong in `components/`.

---

## 4. Skills

The project uses the custom:

**`funky-bubble-design`**

```text
skills/
└── funky-bubble-design/
    └── SKILL.md
```

Use this skill for visual and UI decisions.

It controls the website's:

* Visual style
* Typography
* Colors
* Shadows
* Stickers
* Badges
* 3D/extruded elements
* Animation

Do not duplicate the skill inside `AGENTS.md` or `ARCHITECTURE.md`.

---

## 5. Styling

Use CSS for the website styling.

The `funky-bubble-design` skill should guide the visual implementation.

Keep global styles in:

```text
src/index.css
```

Component-specific styles can be colocated with their components when needed.

---

## 6. State

No global state management is needed.

Use React state for simple interactions such as:

* Mobile navigation
* FAQ toggles
* Small UI interactions

Do not add Redux, Zustand, or similar libraries unless there is a real requirement.

---

## 7. Routing

The initial website is a single landing page.

No routing library is required initially.

Add routing only if the website actually needs multiple pages.

---

## 8. Backend

No backend or database is required for the initial website.

The website should focus on:

**Discover → Learn → Download / Join**

The actual motorcycle app will be a separate project.

---

## 9. Maps

Maps are primarily used as a visual representation of the product.

The website can use:

* Map visuals
* Route illustrations
* App screenshots
* Lightweight map interactions

Do not implement real GPS ride tracking in the website.

---

## 10. Responsive Design

The website must work on:

* Mobile
* Tablet
* Desktop

Design the mobile experience intentionally rather than simply shrinking the desktop version.

---

## 11. Performance

Keep the website fast.

* Optimize images.
* Avoid unnecessary dependencies.
* Keep animations lightweight.
* Lazy-load large/non-critical images when appropriate.

---

## 12. Development Principle

Keep the architecture proportional to the project.

> **Simple, reusable, fast, and easy to understand.**

Do not build infrastructure for the future mobile app inside this website.

The website should remain focused on presenting and promoting **The Rides Club**.
