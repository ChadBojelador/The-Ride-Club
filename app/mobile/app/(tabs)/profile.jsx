// ========================================
// THE RIDES CLUB — Profile & Garage Tab
// Rider profile, bike info, stats & maintenance
// ========================================

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Themes, Typography, Spacing, Radius, Shadows } from '../../constants/Theme';
import { useAuth } from '../../context/AuthContext';
import { garageService } from '../../services/garage';
import { MAINTENANCE_CATEGORIES } from '../../constants/Maintenance';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Themes[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehIndex, setSelectedVehIndex] = useState(0);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  const loadGarage = async () => {
    if (!isAuthenticated) return;
    setIsLoadingVehicles(true);
    try {
      const res = await garageService.getVehicles();
      if (res.vehicles && res.vehicles.length > 0) {
        setVehicles(res.vehicles);
      }
    } catch (err) {
      console.log('Using local garage cache or demo:', err.message);
    } finally {
      setIsLoadingVehicles(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGarage();
    }, [isAuthenticated])
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.signInPrompt}>
          <Text style={styles.signInEmoji}>👤</Text>
          <Text style={[styles.signInTitle, { color: theme.text }]}>
            Sign in to see your profile & garage
          </Text>
          <Text style={[styles.signInSubtitle, { color: theme.textSecondary }]}>
            Track rides, build stats, log bike maintenance, and customize your rider card.
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

  // Active selected vehicle
  const activeVehicle = vehicles[selectedVehIndex] || null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 48 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & name */}
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: Colors.yellow + '25' }]}>
            <Text style={styles.avatarText}>
              {user?.displayName?.[0]?.toUpperCase() || 'R'}
            </Text>
          </View>
          <Text style={[styles.displayName, { color: theme.text }]}>
            {user?.displayName || 'Rider'}
          </Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>
            {user?.email || 'rider@theridesclub.com'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatBox value="3" label="Rides" emoji="🛣️" theme={theme} />
          <StatBox value="142 km" label="Distance" emoji="📏" theme={theme} />
          <StatBox value={String(vehicles.length || 1)} label="Bikes in Garage" emoji="🏍️" theme={theme} />
          <StatBox value="5" label="Photo Drops" emoji="📸" theme={theme} />
        </View>

        {/* ======================================== */}
        {/* 🏍️ RIDER GARAGE & MAINTENANCE HUB */}
        {/* ======================================== */}
        <View style={styles.garageSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>🏍️ My Garage & Maintenance</Text>
            <Pressable
              style={styles.addBikeBtn}
              onPress={() => router.push('/garage/add-vehicle')}
            >
              <Text style={styles.addBikeText}>+ Add Bike</Text>
            </Pressable>
          </View>

          {/* Vehicle Switcher Tabs (if more than 1 bike) */}
          {vehicles.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehTabs}>
              <View style={styles.vehTabsRow}>
                {vehicles.map((v, i) => (
                  <Pressable
                    key={v.id}
                    style={[
                      styles.vehTab,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      selectedVehIndex === i && {
                        backgroundColor: Colors.yellow + '25',
                        borderColor: Colors.yellowDark,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => setSelectedVehIndex(i)}
                  >
                    <Text style={styles.vehTabEmoji}>🏍️</Text>
                    <Text
                      style={[
                        styles.vehTabLabel,
                        { color: selectedVehIndex === i ? Colors.ink : theme.text },
                      ]}
                    >
                      {v.name || `${v.make} ${v.model}`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Vehicle Card */}
          {activeVehicle ? (
            <View style={[styles.bikeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {/* Bike Header */}
              <View style={styles.bikeMainRow}>
                <View style={[styles.bikeIconContainer, { backgroundColor: Colors.yellow + '20' }]}>
                  <Text style={styles.bikeMainEmoji}>🏍️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bikeName, { color: theme.text }]}>{activeVehicle.name}</Text>
                  <Text style={[styles.bikeModel, { color: theme.textSecondary }]}>
                    {activeVehicle.year} {activeVehicle.make} {activeVehicle.model} {activeVehicle.displacement_cc ? `• ${activeVehicle.displacement_cc}cc` : ''}
                  </Text>
                  <Text style={styles.odometerBadge}>
                    📍 {Number(activeVehicle.odometer_km || 0).toLocaleString()} km on Odo
                  </Text>
                </View>
              </View>

              {/* Maintenance Health Bars */}
              <View style={styles.maintenanceBlock}>
                <Text style={[styles.maintBlockTitle, { color: theme.text }]}>
                  Maintenance Health & Wear
                </Text>

                {activeVehicle.schedules && activeVehicle.schedules.length > 0 ? (
                  activeVehicle.schedules.slice(0, 4).map((s) => {
                    const cat = MAINTENANCE_CATEGORIES[s.service_type] || MAINTENANCE_CATEGORIES.custom;
                    const wear = Math.min(100, s.wearPercent || 0);
                    const isDue = wear >= 80;
                    const barColor = wear >= 100 ? Colors.red : wear >= 80 ? Colors.yellowDark : Colors.blue;

                    return (
                      <View key={s.id || s.service_type} style={styles.healthRow}>
                        <View style={styles.healthLabelRow}>
                          <Text style={styles.healthIcon}>{cat?.icon || '🔧'}</Text>
                          <Text style={[styles.healthName, { color: theme.text }]}>
                            {cat?.label || s.service_type}
                          </Text>
                          <Text
                            style={[
                              styles.healthStatusText,
                              { color: barColor },
                            ]}
                          >
                            {wear >= 100
                              ? 'Overdue'
                              : wear >= 80
                              ? `Due in ${s.kmRemaining || 0} km`
                              : `${100 - wear}% life left`}
                          </Text>
                        </View>
                        {/* Progress bar */}
                        <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { width: `${Math.max(5, 100 - wear)}%`, backgroundColor: barColor },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })
                ) : (
                  // Default sample wear bars if fresh
                  <>
                    <HealthBarItem icon="🛢️" label="Engine Oil & Filter" remainingKm="1,200 km" percent={70} color={Colors.blue} theme={theme} />
                    <HealthBarItem icon="⛓️" label="Chain Clean & Lube" remainingKm="120 km" percent={75} color={Colors.yellowDark} theme={theme} />
                    <HealthBarItem icon="🛑" label="Brake Pads & Fluid" remainingKm="4,500 km" percent={90} color={Colors.blue} theme={theme} />
                    <HealthBarItem icon="🛞" label="Tires (Front & Rear)" remainingKm="8,000 km" percent={85} color={Colors.blue} theme={theme} />
                  </>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.bikeActionsRow}>
                <Pressable
                  style={[styles.actionBtn, styles.logServiceBtn]}
                  onPress={() =>
                    router.push({
                      pathname: '/garage/log-service',
                      params: { vehicleId: activeVehicle.id },
                    })
                  }
                >
                  <Text style={styles.logServiceText}>🛠️ Log Service</Text>
                </Pressable>

                <Pressable
                  style={[styles.actionBtn, styles.historyBtn, { borderColor: theme.border }]}
                  onPress={() =>
                    router.push({
                      pathname: '/garage/history',
                      params: { vehicleId: activeVehicle.id },
                    })
                  }
                >
                  <Text style={[styles.historyText, { color: theme.text }]}>📋 History</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            /* Empty Garage State */
            <View style={[styles.emptyGarageCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.emptyGarageEmoji}>🏍️</Text>
              <Text style={[styles.emptyGarageTitle, { color: theme.text }]}>No Bike in Garage</Text>
              <Text style={[styles.emptyGarageSubtitle, { color: theme.textSecondary }]}>
                Add your motorcycle to track mileage, oil changes, chain lubes, and maintenance history.
              </Text>
              <Pressable
                style={styles.addFirstBikeBtn}
                onPress={() => router.push('/garage/add-vehicle')}
              >
                <Text style={styles.addFirstBikeText}>+ Add Your Vehicle</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Settings links */}
        <View style={[styles.settingsSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <SettingsRow icon="👁️" label="Profile Visibility" value={user?.isPublic ? 'Public' : 'Private'} theme={theme} />
          <View style={[styles.settingsDivider, { backgroundColor: theme.border }]} />
          <SettingsRow icon="🔔" label="Maintenance Reminders" value="On" theme={theme} />
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

function HealthBarItem({ icon, label, remainingKm, percent, color, theme }) {
  return (
    <View style={styles.healthRow}>
      <View style={styles.healthLabelRow}>
        <Text style={styles.healthIcon}>{icon}</Text>
        <Text style={[styles.healthName, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.healthStatusText, { color }]}>{remainingKm}</Text>
      </View>
      <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
        <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function StatBox({ value, label, emoji, theme }) {
  return (
    <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={styles.statBoxEmoji}>{emoji}</Text>
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
    paddingVertical: Spacing.sm,
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
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  statBoxEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  statValue: {
    ...Typography.displaySmall,
    fontSize: 18,
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.bodySmall,
    fontSize: 11,
  },

  // Garage Section
  garageSection: {
    gap: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    ...Typography.heading,
    fontSize: 16,
  },
  addBikeBtn: {
    backgroundColor: Colors.yellow,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  addBikeText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.ink,
    fontSize: 12,
  },
  vehTabs: {
    marginBottom: Spacing.xs,
  },
  vehTabsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  vehTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    gap: 6,
  },
  vehTabEmoji: {
    fontSize: 14,
  },
  vehTabLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
    fontSize: 12,
  },
  bikeCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.md,
    ...Shadows.small,
  },
  bikeMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  bikeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bikeMainEmoji: {
    fontSize: 28,
  },
  bikeName: {
    ...Typography.heading,
    fontSize: 17,
  },
  bikeModel: {
    ...Typography.bodySmall,
    marginTop: 1,
  },
  odometerBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.red,
    marginTop: 4,
  },

  // Maintenance health block
  maintenanceBlock: {
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  maintBlockTitle: {
    ...Typography.label,
    fontSize: 11,
    marginBottom: 4,
  },
  healthRow: {
    gap: 4,
  },
  healthLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  healthName: {
    ...Typography.bodySmall,
    fontSize: 12,
    flex: 1,
  },
  healthStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: Radius.pill,
  },

  // Action buttons
  bikeActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logServiceBtn: {
    backgroundColor: Colors.yellow,
  },
  logServiceText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.ink,
  },
  historyBtn: {
    borderWidth: 1,
  },
  historyText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },

  // Empty garage
  emptyGarageCard: {
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyGarageEmoji: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  emptyGarageTitle: {
    ...Typography.heading,
    marginBottom: Spacing.xs,
  },
  emptyGarageSubtitle: {
    ...Typography.bodySmall,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  addFirstBikeBtn: {
    backgroundColor: Colors.yellow,
    borderRadius: Radius.pill,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  addFirstBikeText: {
    ...Typography.button,
    color: Colors.ink,
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
