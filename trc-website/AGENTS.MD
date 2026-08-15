# AGENTS.md

## Project

The Rides Club website is the official marketing and download website for The Rides Club motorcycle app.

The website is responsible for:
- Introducing The Rides Club
- Explaining the app
- Showcasing its features
- Showing the product visually
- Providing download/access CTAs
- Building the Rides Club brand

This repository is website-only.

Do not implement the mobile application's backend, GPS tracking, authentication, ride tracking, social feed, or other app functionality.

## Design

Use the `funky-bubble-design` skill for visual and UI decisions.

The skill is the source of truth for:
- Visual style
- Colors
- Typography
- UI treatments
- Shadows
- Stickers and badges
- 3D/extruded elements
- Animation
- Overall visual direction

Do not duplicate the design skill's rules inside this file.

## Development

Before making changes:

1. Read `AGENTS.md`.
2. Read `PRD.md` if available.
3. Read relevant architecture documentation.
4. Use the applicable design skill.
5. Inspect the existing project.
6. Create a plan before implementation.
7. Ask for approval before making major changes.

## Website Requirements

The website should be:

- Responsive
- Accessible
- Fast
- SEO-friendly
- Mobile-first
- Easy to navigate

Prioritize:
- Clear product messaging
- Strong calls to action
- App previews
- Feature presentation
- Ride/map visuals
- Download or early-access conversion

## Content Rules

Do not invent:
- User numbers
- Downloads
- Reviews
- Partnerships
- Awards
- Testimonials
- App availability
- Product features

Use placeholders when information has not yet been provided.

## Code Quality

- Reuse existing components.
- Avoid unnecessary dependencies.
- Avoid over-engineering.
- Keep components maintainable.
- Preserve existing functionality.
- Test responsive behavior after changes.
- Do not introduce console errors.

## Project Boundary

This repository is for the The Rides Club WEBSITE ONLY.

If a request requires functionality belonging to the actual mobile app, identify it as a Phase 2 concern rather than implementing it here.
