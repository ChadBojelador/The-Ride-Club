/**
 * The Rides Club — Gamification Constants (Mobile Copy)
 * Metro bundler cannot resolve paths outside the project root,
 * so this mirrors app/shared/gamification.js for React Native.
 */

export const XP_RULES = {
  PLACE_XP: {
    viewpoint:  150,
    cafe:       100,
    beach:      120,
    hotel:       80,
    gas:         50,
    mechanic:    50,
    restaurant: 100,
    park:        90,
    default:     60,
  },
  DISTANCE_PER_10KM: 10,
  MAINTENANCE_ON_TIME: 40,
};

export const LEVELS = [
  { level: 1,  minXp: 0,     title: 'Garage Rookie',    emoji: '🔰' },
  { level: 2,  minXp: 300,   title: 'Street Cruiser',   emoji: '🛣️' },
  { level: 3,  minXp: 700,   title: 'Café Hopper',      emoji: '☕' },
  { level: 4,  minXp: 1300,  title: 'Canyon Carver',    emoji: '🏔️' },
  { level: 5,  minXp: 2200,  title: 'Highway Nomad',    emoji: '🧭' },
  { level: 6,  minXp: 3500,  title: 'Summit Explorer',  emoji: '⛰️' },
  { level: 7,  minXp: 5200,  title: 'Twisty Master',    emoji: '🌪️' },
  { level: 8,  minXp: 7500,  title: 'Iron Butt Tourer', emoji: '💨' },
  { level: 9,  minXp: 10500, title: 'Road Legend',      emoji: '👑' },
  { level: 10, minXp: 15000, title: 'Apex God',         emoji: '⚡' },
];

export const BADGES = [
  { id: 'first_track',   name: 'First Track',      category: 'milestone',   icon: '🏁', xpAwarded: 100,  description: 'Completed your first GPS-tracked ride.' },
  { id: 'cafe_crawler',  name: 'Café Crawler',      category: 'places',      icon: '☕', xpAwarded: 200,  description: 'Visited 3 different biker cafés.' },
  { id: 'ridge_runner',  name: 'Ridge Runner',      category: 'places',      icon: '⛰️', xpAwarded: 250, description: 'Reached 3 mountain viewpoints.' },
  { id: 'beach_bum',     name: 'Beach Bum',         category: 'places',      icon: '🏖️', xpAwarded: 200, description: 'Rode to 3 coastal destinations.' },
  { id: 'century_club',  name: 'Century Club',      category: 'distance',    icon: '💯', xpAwarded: 300,  description: 'Completed a single ride of 100 km or more.' },
  { id: 'five_hundred',  name: 'Five Hundred',      category: 'distance',    icon: '🚀', xpAwarded: 500,  description: 'Logged 500 km total on this vehicle.' },
  { id: 'clean_machine', name: 'Clean Machine',     category: 'maintenance', icon: '🔧', xpAwarded: 150,  description: 'Completed 3 maintenance services on time.' },
  { id: 'globe_trotter', name: 'Globe Trotter',     category: 'places',      icon: '🌍', xpAwarded: 400,  description: 'Visited 10 unique places on this vehicle.' },
  { id: 'apex_collector',name: 'Apex Collector',    category: 'milestone',   icon: '🏆', xpAwarded: 1000, description: 'Reached Level 10 — Apex God status.' },
];

/** Category color palette for badges */
export const BADGE_CATEGORY_COLORS = {
  milestone:   '#FFD700',
  places:      '#22D3EE',
  distance:    '#A78BFA',
  maintenance: '#34D399',
};

/**
 * Compute level info from total XP.
 */
export function getLevelInfo(xp) {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.minXp) current = l;
    else break;
  }
  const nextLevel = LEVELS.find(l => l.level === current.level + 1) ?? null;
  return {
    ...current,
    nextMinXp: nextLevel?.minXp ?? null,
    progress: nextLevel
      ? Math.min(1, (xp - current.minXp) / (nextLevel.minXp - current.minXp))
      : 1,
  };
}
