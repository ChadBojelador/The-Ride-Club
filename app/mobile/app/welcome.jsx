// ========================================
// THE RIDES CLUB — Welcome Screen
// First screen for unauthenticated users
// ========================================

import { View, Text, StyleSheet, Pressable, Image, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* Background gradient effect */}
      <View style={styles.bgGradient} />
      <View style={styles.bgAccent} />

      {/* Content */}
      <View style={styles.content}>
        {/* Logo area */}
        <View style={styles.logoSection}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoEmoji}>🏍️</Text>
          </View>
          <Text style={styles.title}>The Rides Club</Text>
          <Text style={styles.subtitle}>
            Discover routes. Drop photos.{'\n'}Share the ride.
          </Text>
        </View>

        {/* Feature highlights */}
        <View style={styles.features}>
          <FeaturePill icon="🗺️" text="Discover rides near you" />
          <FeaturePill icon="📸" text="Photo drops along routes" />
          <FeaturePill icon="🃏" text="Shareable ride cards" />
          <FeaturePill icon="👥" text="Join rider clubs" />
        </View>

        {/* Action buttons */}
        <View style={[styles.actions, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.ghostButton, pressed && styles.ghostButtonPressed]}
            onPress={() => router.replace('/(tabs)/map')}
          >
            <Text style={styles.ghostButtonText}>Browse as guest →</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function FeaturePill({ icon, text }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillIcon}>{icon}</Text>
      <Text style={styles.pillText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    backgroundColor: Colors.red,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    opacity: 0.15,
  },
  bgAccent: {
    position: 'absolute',
    top: height * 0.08,
    right: -30,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.yellow,
    opacity: 0.08,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    ...Typography.displayLarge,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyLarge,
    color: Colors.darkTextMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.pill,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  pillText: {
    ...Typography.body,
    color: Colors.darkText,
  },
  actions: {
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.yellow,
    borderRadius: Radius.pill,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    ...Typography.button,
    color: Colors.ink,
  },
  ghostButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  ghostButtonPressed: {
    opacity: 0.6,
  },
  ghostButtonText: {
    ...Typography.body,
    color: Colors.darkTextMuted,
  },
});
