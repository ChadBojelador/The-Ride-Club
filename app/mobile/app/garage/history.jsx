// ========================================
// THE RIDES CLUB — Maintenance History Screen
// Timeline of all services, repairs & expenses
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
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Themes, Typography, Spacing, Radius, Shadows } from '../../constants/Theme';
import { MAINTENANCE_CATEGORIES } from '../../../shared/maintenance';
import { garageService } from '../../services/garage';

export default function MaintenanceHistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Themes[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const vehicleId = params.vehicleId;
  const [vehicle, setVehicle] = useState(null);
  const [logs, setLogs] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    if (!vehicleId) return;
    try {
      const [vehRes, histRes] = await Promise.all([
        garageService.getVehicle(vehicleId),
        garageService.getMaintenanceLogs(vehicleId),
      ]);

      if (vehRes.vehicle) setVehicle(vehRes.vehicle);
      if (histRes.logs) {
        setLogs(histRes.logs);
        setTotalCost(histRes.totalCost || 0);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [vehicleId])
  );

  const handleDeleteLog = (logId, logTitle) => {
    Alert.alert('Delete Service Log', `Are you sure you want to delete "${logTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await garageService.deleteMaintenanceLog(vehicleId, logId);
            loadHistory();
          } catch (err) {
            Alert.alert('Error', 'Failed to delete record.');
          }
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), borderBottomColor: theme.border }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: theme.text }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Service History</Text>
        <Pressable
          style={styles.addBtnHeader}
          onPress={() => router.push({ pathname: '/garage/log-service', params: { vehicleId } })}
        >
          <Text style={styles.addBtnText}>+ Log</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.yellow} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Stats Card */}
          <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>💰</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>${Number(totalCost).toFixed(0)}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Spent</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>📋</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{logs.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Services</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🏍️</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {Number(vehicle?.odometer_km || 0).toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Current KM</Text>
            </View>
          </View>

          {/* Logs List */}
          {logs.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.emptyEmoji}>🛠️</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No service logs yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Log your oil changes, tire swaps, and tune-ups to keep a complete record.
              </Text>
              <Pressable
                style={styles.emptyAddBtn}
                onPress={() => router.push({ pathname: '/garage/log-service', params: { vehicleId } })}
              >
                <Text style={styles.emptyAddBtnText}>Log First Service</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.logsList}>
              {logs.map((log) => {
                const cat = MAINTENANCE_CATEGORIES[log.service_type] || MAINTENANCE_CATEGORIES.custom;
                const formattedDate = new Date(log.service_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <View
                    key={log.id}
                    style={[styles.logCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  >
                    <View style={styles.logHeader}>
                      <View style={[styles.catBadge, { backgroundColor: (cat?.color || Colors.yellow) + '20' }]}>
                        <Text style={styles.catIcon}>{cat?.icon || '🔧'}</Text>
                        <Text style={[styles.catName, { color: cat?.color || theme.text }]}>
                          {cat?.label || 'Service'}
                        </Text>
                      </View>

                      {log.cost > 0 && (
                        <Text style={[styles.logCost, { color: theme.text }]}>
                          ${Number(log.cost).toFixed(2)}
                        </Text>
                      )}
                    </View>

                    <Text style={[styles.logTitle, { color: theme.text }]}>{log.title}</Text>

                    {log.notes && (
                      <Text style={[styles.logNotes, { color: theme.textSecondary }]}>{log.notes}</Text>
                    )}

                    <View style={styles.logFooter}>
                      <View style={styles.footerTag}>
                        <Text style={styles.footerTagText}>📅 {formattedDate}</Text>
                      </View>
                      <View style={styles.footerTag}>
                        <Text style={styles.footerTagText}>
                          📍 {Number(log.odometer_km).toLocaleString()} km
                        </Text>
                      </View>
                      <View style={styles.footerTag}>
                        <Text style={styles.footerTagText}>
                          {log.performed_by === 'DIY' ? '🛠️ DIY' : `🏢 ${log.performed_by}`}
                        </Text>
                      </View>

                      <Pressable
                        style={styles.deleteLogBtn}
                        onPress={() => handleDeleteLog(log.id, log.title)}
                      >
                        <Text style={styles.deleteLogText}>🗑️</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  backText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
  },
  headerTitle: {
    ...Typography.heading,
  },
  addBtnHeader: {
    backgroundColor: Colors.yellow,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  addBtnText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.ink,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    ...Shadows.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  statValue: {
    ...Typography.heading,
    fontSize: 16,
  },
  statLabel: {
    ...Typography.bodySmall,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  emptyBox: {
    alignItems: 'center',
    padding: Spacing.xxl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.heading,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  emptyAddBtn: {
    backgroundColor: Colors.yellow,
    borderRadius: Radius.pill,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyAddBtnText: {
    ...Typography.button,
    color: Colors.ink,
    fontSize: 14,
  },
  logsList: {
    gap: Spacing.md,
  },
  logCard: {
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    gap: 6,
  },
  catIcon: {
    fontSize: 14,
  },
  catName: {
    ...Typography.bodySmall,
    fontWeight: '700',
    fontSize: 12,
  },
  logCost: {
    ...Typography.heading,
    fontSize: 15,
  },
  logTitle: {
    ...Typography.heading,
    fontSize: 16,
  },
  logNotes: {
    ...Typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  logFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  footerTag: {
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  footerTagText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '500',
  },
  deleteLogBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  deleteLogText: {
    fontSize: 14,
  },
});
