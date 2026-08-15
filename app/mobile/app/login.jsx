// ========================================
// THE RIDES CLUB — Login Screen
// Google & Apple sign-in
// ========================================

import { View, Text, StyleSheet, Pressable, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, Radius, Shadows } from '../constants/Theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Integrate expo-auth-session for Google OAuth
      // For now, show a placeholder message
      setError('Google Sign-In will be configured with your OAuth credentials.');
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Integrate expo-apple-authentication
      setError('Apple Sign-In will be configured with your Apple Developer account.');
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <StatusBar barStyle="light-content" />

      {/* Back button */}
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>🔐</Text>
          </View>
          <Text style={styles.title}>Sign In</Text>
          <Text style={styles.subtitle}>
            Create an account to track rides,{'\n'}share photos, and join clubs.
          </Text>
        </View>

        {/* Sign-in buttons */}
        <View style={styles.buttons}>
          {/* Google */}
          <Pressable
            style={({ pressed }) => [styles.authButton, styles.googleButton, pressed && styles.authButtonPressed]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.authIcon}>G</Text>
            <Text style={styles.authButtonText}>Continue with Google</Text>
          </Pressable>

          {/* Apple — iOS only */}
          {Platform.OS === 'ios' && (
            <Pressable
              style={({ pressed }) => [styles.authButton, styles.appleButton, pressed && styles.authButtonPressed]}
              onPress={handleAppleSignIn}
              disabled={isLoading}
            >
              <Text style={[styles.authIcon, styles.appleIcon]}></Text>
              <Text style={[styles.authButtonText, styles.appleButtonText]}>Continue with Apple</Text>
            </Pressable>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <ActivityIndicator size="small" color={Colors.yellow} style={{ marginTop: Spacing.lg }} />
          )}

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ink,
  },
  backButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.darkTextMuted,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(254, 198, 15, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  iconEmoji: {
    fontSize: 28,
  },
  title: {
    ...Typography.displayMedium,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.darkTextMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttons: {
    gap: Spacing.md,
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    paddingVertical: 16,
    ...Shadows.small,
  },
  authButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  googleButton: {
    backgroundColor: Colors.white,
  },
  appleButton: {
    backgroundColor: Colors.white,
  },
  authIcon: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: Spacing.sm,
    color: Colors.ink,
  },
  appleIcon: {
    fontSize: 22,
  },
  authButtonText: {
    ...Typography.button,
    color: Colors.ink,
  },
  appleButtonText: {
    color: Colors.ink,
  },
  errorContainer: {
    backgroundColor: 'rgba(208, 77, 68, 0.15)',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(208, 77, 68, 0.3)',
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.redLight,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    ...Typography.bodySmall,
    color: '#555',
    textAlign: 'center',
    lineHeight: 18,
  },
});
