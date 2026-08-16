/**
 * Vehicle Passport & Leveling Screen
 * ─────────────────────────────────
 * Shows a vehicle's XP progress, rank, place stamps, and badges.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Themes, Typography, Spacing, Radius, Shadows } from '../../constants/Theme';
import { LEVELS, BADGE_CATEGORY_COLORS, getLevelInfo } from '../../constants/Gamification';
import { gamificationService } from '../../services/gamification';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── XP Progress Ring ────────────────────────────────────────────────────────
function XPRing({ progress, level, emoji, title, xp, nextXp, theme }) {
  const animRef = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(animRef, {
      toValue: progress,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const SIZE = 160;
  const ringColor = '#7C3AED';

  return (
    <View style={styles.ringContainer}>
      {/* Outer glow ring */}
      <View style={[styles.ringOuter, { borderColor: ringColor + '44', width: SIZE + 20, height: SIZE + 20, borderRadius: (SIZE + 20) / 2 }]}>
        <View style={[styles.ringBg, { width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: theme.card }]}>
          {/* Progress arc (simulated with border) */}
          <View
            style={[
              styles.ringProgress,
              {
                width: SIZE,
                height: SIZE,
                borderRadius: SIZE / 2,
                borderWidth: 6,
                borderColor: ringColor,
                opacity: progress,
              },
            ]}
          />
          <View style={styles.ringInner}>
            <Text style={styles.ringEmoji}>{emoji}</Text>
            <Text style={[styles.ringLevel, { color: ringColor }]}>Lv. {level}</Text>
            <Text style={[styles.ringTitle, { color: theme.text }]}>{title}</Text>
          </View>
        </View>
      </View>
      {/* XP Label */}
      <View style={styles.xpRow}>
        <Text style={[styles.xpCurrent, { color: theme.text }]}>{xp.toLocaleString()} XP</Text>
        {nextXp && (
          <Text style={[styles.xpNext, { color: theme.subtext }]}>
            {' '}/ {nextXp.toLocaleString()} XP
          </Text>
        )}
      </View>
      {/* Progress Bar */}
      <View style={[styles.xpBarBg, { backgroundColor: theme.border }]}>
        <View style={[styles.xpBarFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: ringColor }]} />
      </View>
      <Text style={[styles.xpToNext, { color: theme.subtext }]}>
        {nextXp
          ? `${(nextXp - xp).toLocaleString()} XP to next level`
          : '🏆 Max Level Reached!'}
      </Text>
    </View>
  );
}

// ─── Level Roadmap ────────────────────────────────────────────────────────────
function LevelRoadmap({ currentLevel, theme }) {
  return (
    <View style={styles.sectionBlock}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Rank Roadmap</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roadmapScroll}>
        {LEVELS.map((lvl, i) => {
          const isActive = lvl.level === currentLevel;
          const isPast   = lvl.level < currentLevel;
          return (
            <View key={lvl.level} style={styles.roadmapItem}>
              <View style={[
                styles.roadmapDot,
                isActive && styles.roadmapDotActive,
                isPast   && styles.roadmapDotPast,
              ]}>
                <Text style={styles.roadmapDotEmoji}>{lvl.emoji}</Text>
              </View>
              {i < LEVELS.length - 1 && (
                <View style={[styles.roadmapLine, isPast && styles.roadmapLinePast]} />
              )}
              <Text style={[styles.roadmapLvl, { color: isActive ? '#7C3AED' : theme.subtext }]}>
                Lv.{lvl.level}
              </Text>
              <Text style={[styles.roadmapName, { color: theme.text }]} numberOfLines={2}>
                {lvl.title}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Badge Card ───────────────────────────────────────────────────────────────
function BadgeCard({ badge, theme }) {
  const catColor = BADGE_CATEGORY_COLORS[badge.category] || '#7C3AED';
  const locked = !badge.unlocked;
  return (
    <View style={[
      styles.badgeCard,
      { backgroundColor: locked ? theme.card + 'AA' : theme.card },
      !locked && { borderColor: catColor + '55', borderWidth: 1 },
      Shadows.sm,
    ]}>
      <Text style={[styles.badgeIcon, locked && { opacity: 0.3 }]}>{badge.icon}</Text>
      <Text style={[styles.badgeName, { color: locked ? theme.subtext : theme.text }]} numberOfLines={2}>
        {badge.name}
      </Text>
      {!locked && (
        <View style={[styles.badgePill, { backgroundColor: catColor + '22' }]}>
          <Text style={[styles.badgePillText, { color: catColor }]}>+{badge.xpAwarded} XP</Text>
        </View>
      )}
      {locked && (
        <Text style={[styles.badgeLocked, { color: theme.subtext }]}>🔒 Locked</Text>
      )}
    </View>
  );
}

// ─── Place Stamp Card ─────────────────────────────────────────────────────────
const PLACE_ICONS = {
  viewpoint: '⛰️', cafe: '☕', beach: '🏖️', hotel: '🏨',
  gas: '⛽', mechanic: '🔧', restaurant: '🍽️', park: '🌳', default: '📍',
};

function PlaceStampCard({ stamp, theme }) {
  const icon = PLACE_ICONS[stamp.category] ?? PLACE_ICONS.default;
  const visitDate = new Date(stamp.visited_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
  return (
    <View style={[styles.stampCard, { backgroundColor: theme.card }, Shadows.sm]}>
      <Text style={styles.stampIcon}>{icon}</Text>
      <View style={styles.stampInfo}>
        <Text style={[styles.stampName, { color: theme.text }]}>{stamp.name}</Text>
        <Text style={[styles.stampMeta, { color: theme.subtext }]}>
          {stamp.category} · {visitDate}
        </Text>
      </View>
      <View style={styles.stampXpPill}>
        <Text style={styles.stampXpText}>+{stamp.xp_earned} XP</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function VehiclePassportScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Themes[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const vehicleId = params.vehicleId;
  const [passport, setPassport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('badges'); // 'badges' | 'places'

  const loadPassport = useCallback(async () => {
    if (!vehicleId) return;
    try {
      setIsLoading(true);
      const data = await gamificationService.getPassport(vehicleId);
      setPassport(data);
    } catch (err) {
      Alert.alert('Error', 'Could not load vehicle passport.');
    } finally {
      setIsLoading(false);
    }
  }, [vehicleId]);

  useFocusEffect(useCallback(() => { loadPassport(); }, [loadPassport]));

  const vehicle = passport?.vehicle;
  const levelInfo = passport ? getLevelInfo(passport.xp) : null;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* ─── Header ─────────────────────────────────────────────── */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {vehicle ? `${vehicle.nickname || vehicle.make} ${vehicle.model}` : 'Vehicle Passport'}
          </Text>
          <Text style={[styles.headerSub, { color: theme.subtext }]}>Level & Exploration History</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={[styles.loadingText, { color: theme.subtext }]}>Loading passport…</Text>
        </View>
      ) : !passport ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🛵</Text>
          <Text style={[styles.emptyText, { color: theme.subtext }]}>No data found for this vehicle.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}>

          {/* ─── XP Ring ─────────────────────────────────────── */}
          <View style={[styles.heroCard, { backgroundColor: theme.card }, Shadows.md]}>
            <XPRing
              progress={passport.progress}
              level={passport.level}
              emoji={levelInfo?.emoji || '🔰'}
              title={passport.title}
              xp={passport.xp}
              nextXp={passport.nextMinXp}
              theme={theme}
            />

            {/* Quick stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: theme.text }]}>{passport.totalRides}</Text>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Rides</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: theme.text }]}>
                  {Math.round(passport.totalDistance)} km
                </Text>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Ridden</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: theme.text }]}>{passport.placesVisited}</Text>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Places</Text>
              </View>
            </View>
          </View>

          {/* ─── Rank Roadmap ─────────────────────────────────── */}
          <LevelRoadmap currentLevel={passport.level} theme={theme} />

          {/* ─── Tabs ─────────────────────────────────────────── */}
          <View style={[styles.tabRow, { backgroundColor: theme.card }]}>
            {['badges', 'places'].map(tab => (
              <Pressable
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, { color: activeTab === tab ? '#7C3AED' : theme.subtext }]}>
                  {tab === 'badges'
                    ? `🏅 Badges (${passport.badges.filter(b => b.unlocked).length}/${passport.badges.length})`
                    : `📍 Places (${passport.placeStamps.length})`}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ─── Badges Grid ──────────────────────────────────── */}
          {activeTab === 'badges' && (
            <View style={styles.badgesGrid}>
              {passport.badges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} theme={theme} />
              ))}
            </View>
          )}

          {/* ─── Place Stamps ──────────────────────────────────── */}
          {activeTab === 'places' && (
            <View style={styles.stampsList}>
              {passport.placeStamps.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>🗺️</Text>
                  <Text style={[styles.emptyText, { color: theme.subtext }]}>
                    No places stamped yet.{'\n'}Complete GPS rides to discover places!
                  </Text>
                </View>
              ) : (
                passport.placeStamps.map((stamp, i) => (
                  <PlaceStampCard key={`${stamp.place_id}-${i}`} stamp={stamp} theme={theme} />
                ))
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, color: '#7C3AED' },
  headerTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
  headerSub: { fontSize: Typography.sizes.xs, marginTop: 2 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { marginTop: Spacing.sm, fontSize: Typography.sizes.sm },
  emptyEmoji: { fontSize: 48, textAlign: 'center' },
  emptyText: { fontSize: Typography.sizes.sm, textAlign: 'center', lineHeight: 22 },

  heroCard: {
    margin: Spacing.lg,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.lg,
  },

  // XP Ring
  ringContainer: { alignItems: 'center', width: '100%', gap: 8 },
  ringOuter: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringBg: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ringProgress: { position: 'absolute' },
  ringInner: { alignItems: 'center', gap: 2 },
  ringEmoji: { fontSize: 40 },
  ringLevel: { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  ringTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },

  xpRow: { flexDirection: 'row', alignItems: 'baseline' },
  xpCurrent: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
  xpNext: { fontSize: Typography.sizes.sm },

  xpBarBg: { width: SCREEN_W - 96, height: 8, borderRadius: 4, overflow: 'hidden' },
  xpBarFill: { height: '100%', borderRadius: 4 },
  xpToNext: { fontSize: Typography.sizes.xs },

  // Stats row
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around' },
  statBox: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
  statLabel: { fontSize: Typography.sizes.xs, marginTop: 2 },
  statDivider: { width: 1, height: 36, alignSelf: 'center' },

  // Roadmap
  sectionBlock: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, marginBottom: Spacing.md },
  roadmapScroll: { paddingBottom: 8, gap: 0 },
  roadmapItem: { alignItems: 'center', width: 72, marginRight: 4 },
  roadmapDot: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  roadmapDotActive: { backgroundColor: '#7C3AED', transform: [{ scale: 1.18 }] },
  roadmapDotPast: { backgroundColor: '#A78BFA' },
  roadmapDotEmoji: { fontSize: 20 },
  roadmapLine: { position: 'absolute', top: 22, left: 44, width: 28, height: 2, backgroundColor: '#E5E7EB' },
  roadmapLinePast: { backgroundColor: '#A78BFA' },
  roadmapLvl: { fontSize: 10, fontWeight: '700', marginTop: 6 },
  roadmapName: { fontSize: 9, textAlign: 'center', lineHeight: 13 },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  tab: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#7C3AED' },
  tabText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },

  // Badges
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: (SCREEN_W - 48 - 12) / 3,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    minHeight: 110,
    justifyContent: 'center',
  },
  badgeIcon: { fontSize: 30, marginBottom: 2 },
  badgeName: { fontSize: 10, fontWeight: '600', textAlign: 'center', lineHeight: 13 },
  badgePill: { borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  badgePillText: { fontSize: 9, fontWeight: '700' },
  badgeLocked: { fontSize: 9, marginTop: 2 },

  // Place Stamps
  stampsList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  stampCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  stampIcon: { fontSize: 28 },
  stampInfo: { flex: 1 },
  stampName: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
  stampMeta: { fontSize: Typography.sizes.xs, marginTop: 2 },
  stampXpPill: {
    backgroundColor: '#7C3AED22',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stampXpText: { fontSize: 11, fontWeight: '700', color: '#7C3AED' },

  emptyState: { alignItems: 'center', paddingVertical: 40, gap: Spacing.md },
});
