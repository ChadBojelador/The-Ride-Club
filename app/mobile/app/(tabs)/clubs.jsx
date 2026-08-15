// ========================================
// THE RIDES CLUB — Clubs Tab
// Discover & manage rider clubs
// ========================================

import { View, Text, StyleSheet, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Themes, Typography, Spacing, Radius, Shadows } from '../../constants/Theme';

export default function ClubsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Themes[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Create club CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.createClub,
            { backgroundColor: theme.surface, borderColor: theme.border },
            pressed && styles.createClubPressed,
          ]}
        >
          <View style={styles.createIcon}>
            <Text style={styles.createEmoji}>➕</Text>
          </View>
          <View style={styles.createContent}>
            <Text style={[styles.createTitle, { color: theme.text }]}>Create a Club</Text>
            <Text style={[styles.createSubtitle, { color: theme.textSecondary }]}>
              Start a group and invite fellow riders
            </Text>
          </View>
        </Pressable>

        {/* My Clubs section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>My Clubs</Text>
          <View style={[styles.emptySection, { borderColor: theme.border }]}>
            <Text style={styles.emptySectionEmoji}>👥</Text>
            <Text style={[styles.emptySectionText, { color: theme.textSecondary }]}>
              You haven't joined any clubs yet
            </Text>
          </View>
        </View>

        {/* Discover section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Discover</Text>

          {/* Sample club cards to show the UI pattern */}
          <ClubCard
            name="Morning Riders PH"
            members={0}
            description="Early morning rides around the city"
            theme={theme}
          />
          <ClubCard
            name="Weekend Warriors"
            members={0}
            description="Long distance weekend adventures"
            theme={theme}
          />
          <ClubCard
            name="Café Hoppers"
            members={0}
            description="Ride to the best cafés and chill spots"
            theme={theme}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function ClubCard({ name, members, description, theme }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.clubCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.clubCardPressed,
      ]}
    >
      <View style={styles.clubAvatar}>
        <Text style={styles.clubAvatarText}>{name[0]}</Text>
      </View>
      <View style={styles.clubInfo}>
        <Text style={[styles.clubName, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.clubDesc, { color: theme.textSecondary }]}>{description}</Text>
        <Text style={[styles.clubMembers, { color: theme.textMuted }]}>
          {members} members
        </Text>
      </View>
    </Pressable>
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
  createClub: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  createClubPressed: {
    opacity: 0.7,
  },
  createIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  createEmoji: {
    fontSize: 20,
  },
  createContent: {
    flex: 1,
  },
  createTitle: {
    ...Typography.heading,
    marginBottom: 2,
  },
  createSubtitle: {
    ...Typography.bodySmall,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.label,
  },
  emptySection: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptySectionEmoji: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  emptySectionText: {
    ...Typography.body,
  },
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  clubCardPressed: {
    opacity: 0.7,
  },
  clubAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.red + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  clubAvatarText: {
    ...Typography.heading,
    color: Colors.red,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    ...Typography.heading,
    marginBottom: 2,
  },
  clubDesc: {
    ...Typography.bodySmall,
    marginBottom: 4,
  },
  clubMembers: {
    ...Typography.bodySmall,
    fontSize: 11,
  },
});
