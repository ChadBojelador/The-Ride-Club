// ========================================
// THE RIDES CLUB — Map Tab (Discover)
// Placeholder for the discover map
// ========================================

import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Themes, Typography, Spacing, Radius } from '../../constants/Theme';

export default function MapScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Themes[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Map placeholder */}
      <View style={[styles.mapPlaceholder, { backgroundColor: colorScheme === 'dark' ? '#1a2332' : '#e8f0fe' }]}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={[styles.mapTitle, { color: theme.text }]}>Discover Map</Text>
        <Text style={[styles.mapSubtitle, { color: theme.textSecondary }]}>
          Explore rides, cafés, viewpoints,{'\n'}and places other riders have pinned.
        </Text>

        {/* Category chips */}
        <View style={styles.chips}>
          <Chip emoji="☕" label="Cafés" color={Colors.red} />
          <Chip emoji="🏔️" label="Views" color={Colors.blue} />
          <Chip emoji="⛽" label="Gas" color={Colors.yellow} />
          <Chip emoji="🔧" label="Shops" color={Colors.inkMuted} />
        </View>
      </View>

      {/* Coming soon banner */}
      <View style={[styles.banner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.bannerText, { color: theme.textSecondary }]}>
          OpenStreetMap integration coming in Phase 2
        </Text>
      </View>

      {/* Leaderboards entry point */}
      <Pressable
        id="map-leaderboard-btn"
        style={({ pressed }) => [
          styles.lbButton,
          { backgroundColor: theme.surface, borderColor: theme.border },
          pressed && styles.lbButtonPressed,
        ]}
        onPress={() => router.push('/leaderboard')}
      >
        <View style={styles.lbLeft}>
          <View style={styles.lbIcon}>
            <Text style={styles.lbEmoji}>🏆</Text>
          </View>
          <View>
            <Text style={[styles.lbTitle, { color: theme.text }]}>Leaderboards</Text>
            <Text style={[styles.lbSub, { color: theme.textSecondary }]}>Compete on route segments</Text>
          </View>
        </View>
        <Text style={[styles.lbChevron, { color: theme.textMuted }]}>›</Text>
      </Pressable>
    </View>
  );
}

function Chip({ emoji, label, color }) {
  return (
    <View style={[styles.chip, { borderColor: color + '40' }]}>
      <Text style={styles.chipEmoji}>{emoji}</Text>
      <Text style={[styles.chipLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  mapEmoji: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  mapTitle: {
    ...Typography.displayMedium,
    marginBottom: Spacing.sm,
  },
  mapSubtitle: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  chipLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  banner: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  bannerText: {
    ...Typography.bodySmall,
    fontStyle: 'italic',
  },
  lbButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
  },
  lbButtonPressed: {
    opacity: 0.7,
  },
  lbLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  lbIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEC60F22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lbEmoji: {
    fontSize: 22,
  },
  lbTitle: {
    ...Typography.heading,
    marginBottom: 2,
  },
  lbSub: {
    ...Typography.bodySmall,
  },
  lbChevron: {
    fontSize: 22,
    fontWeight: '300',
  },
});
