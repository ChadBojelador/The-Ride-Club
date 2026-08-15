// ========================================
// THE RIDES CLUB — Rides Tab
// Ride feed & history placeholder
// ========================================

import { View, Text, StyleSheet, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Themes, Typography, Spacing, Radius, Shadows } from '../../constants/Theme';

export default function RidesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Themes[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Start ride CTA */}
        <Pressable
          style={({ pressed }) => [styles.startRide, pressed && styles.startRidePressed]}
        >
          <View style={styles.startRideIcon}>
            <Text style={styles.startRideEmoji}>🏍️</Text>
          </View>
          <View style={styles.startRideContent}>
            <Text style={styles.startRideTitle}>Start a Ride</Text>
            <Text style={styles.startRideSubtitle}>Track your route with GPS or photo proof</Text>
          </View>
          <Text style={styles.startRideArrow}>→</Text>
        </Pressable>

        {/* Stats summary */}
        <View style={styles.statsRow}>
          <StatCard value="0" label="Rides" emoji="🛣️" theme={theme} />
          <StatCard value="0 km" label="Distance" emoji="📏" theme={theme} />
          <StatCard value="0h" label="Time" emoji="⏱️" theme={theme} />
        </View>

        {/* Empty state */}
        <View style={[styles.emptyState, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={styles.emptyEmoji}>🏁</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No rides yet</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Start your first ride to see it here.{'\n'}Your ride history and stats will build up over time.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ value, label, emoji, theme }) {
  return (
    <View style={[styles.statCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  startRide: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.yellow,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadows.medium,
  },
  startRidePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  startRideIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  startRideEmoji: {
    fontSize: 24,
  },
  startRideContent: {
    flex: 1,
  },
  startRideTitle: {
    ...Typography.heading,
    color: Colors.ink,
    marginBottom: 2,
  },
  startRideSubtitle: {
    ...Typography.bodySmall,
    color: 'rgba(0,0,0,0.6)',
  },
  startRideArrow: {
    fontSize: 20,
    color: Colors.ink,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  statEmoji: {
    fontSize: 18,
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.heading,
  },
  statLabel: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxl,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.displaySmall,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
});
