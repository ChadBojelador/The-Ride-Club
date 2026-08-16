# The Rides Club

> **Work in progress** — This README is temporary and will be updated as the project matures.

A social riding app for motorcycle and cycling enthusiasts. Track your rides, discover places, compete on route leaderboards, and connect with clubs.

---

## Project Structure

```
The Rides Club/
├── app/
│   ├── mobile/          # Expo (React Native) mobile app
│   ├── server/          # Express.js REST API
│   └── shared/          # Shared enums, gamification logic
└── trc-website/         # Marketing website
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native · Expo SDK 54 · Expo Router v6 |
| Backend | Node.js · Express.js · PostgreSQL + PostGIS |
| Auth | JWT (access + refresh tokens) |
| Fonts | Outfit (headings) · Inter (body) |

---

## Features

- **GPS Ride Tracking** — Record rides with live GPS, elevation, and speed stats
- **Garage** — Manage your bikes, track odometer, log maintenance
- **Vehicle Leveling** — Earn XP per ride, unlock badges, and level up your bike
- **Places** — Discover cafes, viewpoints, and gas stations along your route
- **Route Leaderboards** — Compete for fastest times on shared segments (Strava-style)
- **Clubs** — Join and create riding groups
- **Ride Feed** — Browse public rides from the community

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ with PostGIS extension
- Expo CLI (`npm install -g expo-cli`)

### Server

```bash
cd app/server
npm install
cp .env.example .env   # fill in DB credentials & JWT secret
npm run migrate        # run all SQL migrations
npm run seed           # optional: seed sample data
npm run dev
```

### Mobile

```bash
cd app/mobile
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone, or press `a` / `i` for Android / iOS simulator.

---

## API Routes

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/rides` | Ride feed |
| POST | `/api/rides` | Start a ride |
| POST | `/api/rides/:id/finish` | Finish a ride (triggers XP + leaderboard) |
| GET | `/api/segments` | List all route segments |
| GET | `/api/segments/:id` | Segment leaderboard detail |
| GET | `/api/vehicles` | My garage |
| GET | `/api/places` | Nearby places |
| GET | `/api/clubs` | Clubs |

---

## Environment Variables

```env
# Server (.env)
DATABASE_URL=postgres://user:pass@localhost:5432/theridesclub
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
PORT=3000
NODE_ENV=development
```

---

## Roadmap

- [ ] OpenStreetMap integration (live map with ride playback)
- [ ] Push notifications (ride invites, leaderboard updates)
- [ ] Club ride events & RSVP
- [ ] Photo uploads with GPS tagging
- [ ] Web dashboard

---

*Built with love for riders.*