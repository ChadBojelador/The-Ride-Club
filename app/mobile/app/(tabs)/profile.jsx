// ========================================
// THE RIDES CLUB — Profile Tab
// Rider profile, bike info, stats
// ========================================

import { View, Text, StyleSheet, Pressable, ScrollView, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors, Themes, Typography, Spacing, Radius, Shadows } from '../../constants/Theme';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Themes[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.signInPrompt}>
          <Text style={styles.signInEmoji}>👤</Text>
          <Text style={[styles.signInTitle, { color: theme.text }]}>
            Sign in to see your profile
          </Text>
          <Text style={[styles.signInSubtitle, { color: theme.textSecondary }]}>
            Track rides, build stats, and customize your rider card.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.signInButton, pressed && styles.signInButtonPressed]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & name */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: Colors.yellow + '25' }]}>
            <Text style={styles.avatarText}>
              {user?.displayName?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={[styles.displayName, { color: theme.text }]}>
            {user?.displayName || 'Rider'}
          </Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>
            {user?.email || ''}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatBox value="0" label="Rides" theme={theme} />
          <StatBox value="0 km" label="Total Distance" theme={theme} />
          <StatBox value="0" label="Clubs" theme={theme} />
          <StatBox value="0" label="Photo Drops" theme={theme} />
        </View>

        {/* Bike info */}
        <View style={[styles.bikeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.bikeHeader}>
            <Text style={styles.bikeEmoji}>🏍️</Text>
            <Text style={[styles.bikeTitle, { color: theme.text }]}>My Bike</Text>
          </View>
          <Text style={[styles.bikeHint, { color: theme.textSecondary }]}>
            Add your bike details — model, year, and a photo
          </Text>
          <Pressable style={({ pressed }) => [styles.editButton, { borderColor: theme.border }, pressed && { opacity: 0.6 }]}>
            <Text style={[styles.editButtonText, { color: theme.primary }]}>Edit Bike Info</Text>
          </Pressable>
        </View>

        {/* Settings links */}
        <View style={[styles.settingsSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingsRow icon="👁️" label="Profile Visibility" value={user?.isPublic ? 'Public' : 'Private'} theme={theme} />
          <View style={[styles.settingsDivider, { backgroundColor: theme.border }]} />
          <SettingsRow icon="🔔" label="Notifications" value="Off" theme={theme} />
          <View style={[styles.settingsDivider, { backgroundColor: theme.border }]} />
          <SettingsRow icon="🎨" label="Appearance" value="System" theme={theme} />
        </View>

        {/* Sign out */}
        <Pressable
          style={({ pressed }) => [styles.signOutButton, pressed && { opacity: 0.6 }]}
          onPress={signOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function StatBox({ value, label, theme }) {
  return (
    <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

function SettingsRow({ icon, label, value, theme }) {
  return (
    <Pressable style={styles.settingsRow}>
      <Text style={styles.settingsIcon}>{icon}</Text>
      <Text style={[styles.settingsLabel, { color: theme.text }]}>{label}</Text>
      <Text style={[styles.settingsValue, { color: theme.textSecondary }]}>{value}</Text>
      <Text style={[styles.settingsChevron, { color: theme.textMuted }]}>›</Text>
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
    paddingBottom: Spacing.xxxl,
  },

  // Sign-in prompt (guest mode)
  signInPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  signInEmoji: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  signInTitle: {
    ...Typography.displaySmall,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  signInSubtitle: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  signInButton: {
    backgroundColor: Colors.yellow,
    borderRadius: Radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 48,
  },
  signInButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  signInButtonText: {
    ...Typography.button,
    color: Colors.ink,
  },

  // Profile header
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    ...Typography.displayLarge,
    color: Colors.yellow,
  },
  displayName: {
    ...Typography.displayMedium,
    marginBottom: Spacing.xs,
  },
  email: {
    ...Typography.body,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statBox: {
    width: '48%',
    flexGrow: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  statValue: {
    ...Typography.displaySmall,
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.bodySmall,
  },

  // Bike card
  bikeCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  bikeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bikeEmoji: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  bikeTitle: {
    ...Typography.heading,
  },
  bikeHint: {
    ...Typography.body,
    marginBottom: Spacing.lg,
  },
  editButton: {
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editButtonText: {
    ...Typography.button,
    fontSize: 14,
  },

  // Settings
  settingsSection: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  settingsIcon: {
    fontSize: 18,
    marginRight: Spacing.md,
  },
  settingsLabel: {
    ...Typography.body,
    flex: 1,
  },
  settingsValue: {
    ...Typography.bodySmall,
    marginRight: Spacing.sm,
  },
  settingsChevron: {
    fontSize: 20,
    fontWeight: '300',
  },
  settingsDivider: {
    height: 1,
    marginLeft: Spacing.xl + 28,
  },

  // Sign out
  signOutButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  signOutText: {
    ...Typography.body,
    color: Colors.red,
    fontWeight: '600',
  },
});
