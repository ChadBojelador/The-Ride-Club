// ========================================
// THE RIDES CLUB — Log Maintenance Screen
// Record a service, oil change, or repair
// ========================================

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Themes, Typography, Spacing, Radius, Shadows } from '../../constants/Theme';
import { MAINTENANCE_CATEGORIES } from '../../../shared/maintenance';
import { garageService } from '../../services/garage';

export default function LogServiceScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Themes[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const vehicleId = params.vehicleId;
  const initialType = params.serviceType || 'oil_change';

  const [selectedType, setSelectedType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [odometerKm, setOdometerKm] = useState('');
  const [performedBy, setPerformedBy] = useState('DIY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVeh, setIsLoadingVeh] = useState(true);
  const [vehicle, setVehicle] = useState(null);

  useEffect(() => {
    async function loadVehicle() {
      if (!vehicleId) return;
      try {
        const res = await garageService.getVehicle(vehicleId);
        if (res.vehicle) {
          setVehicle(res.vehicle);
          setOdometerKm(String(Math.round(res.vehicle.odometer_km || 0)));
        }
      } catch (err) {
        console.error('Error loading vehicle:', err);
      } finally {
        setIsLoadingVeh(false);
      }
    }
    loadVehicle();
  }, [vehicleId]);

  // Set default title when category changes if title is empty
  const handleSelectCategory = (catId) => {
    setSelectedType(catId);
    if (!title || Object.values(MAINTENANCE_CATEGORIES).some((c) => c.label === title)) {
      const cat = MAINTENANCE_CATEGORIES[catId];
      if (cat) setTitle(cat.label);
    }
  };

  const handleSave = async () => {
    if (!vehicleId) {
      Alert.alert('Error', 'No vehicle selected.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Missing Info', 'Please enter a title or description for this service.');
      return;
    }

    if (!odometerKm.trim() || isNaN(parseFloat(odometerKm))) {
      Alert.alert('Missing Info', 'Please enter the vehicle odometer reading at the time of service.');
      return;
    }

    setIsSubmitting(true);
    try {
      await garageService.logMaintenance(vehicleId, {
        service_type: selectedType,
        title: title.trim(),
        notes: notes.trim() || null,
        cost: cost ? parseFloat(cost) : 0,
        odometer_km: parseFloat(odometerKm),
        performed_by: performedBy.trim() || 'DIY',
      });

      Alert.alert('✅ Service Logged!', 'Your maintenance record has been saved and wear intervals updated.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Failed to log service:', err);
      Alert.alert('Error', err.message || 'Failed to record maintenance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = Object.values(MAINTENANCE_CATEGORIES);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), borderBottomColor: theme.border }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: theme.text }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Log Service</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Badge */}
        {vehicle && (
          <View style={[styles.vehicleBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={styles.vehicleEmoji}>🏍️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.vehicleName, { color: theme.text }]}>{vehicle.name || `${vehicle.make} ${vehicle.model}`}</Text>
              <Text style={[styles.vehicleOdo, { color: theme.textSecondary }]}>
                Current Odometer: {Number(vehicle.odometer_km || 0).toLocaleString()} km
              </Text>
            </View>
          </View>
        )}

        {/* Category Picker */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>Service Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          <View style={styles.catRow}>
            {categories.map((cat) => {
              const isSelected = selectedType === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.catChip,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    isSelected && { backgroundColor: Colors.yellow + '25', borderColor: Colors.yellowDark, borderWidth: 2 },
                  ]}
                  onPress={() => handleSelectCategory(cat.id)}
                >
                  <Text style={styles.catEmoji}>{cat.icon}</Text>
                  <Text style={[styles.catLabel, { color: isSelected ? Colors.ink : theme.text }]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Service Title */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Service Title / Parts Used *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g. Motul 7100 10W-40 & OEM Filter"
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Odometer & Cost Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1.2 }]}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Odometer at Service (km) *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. 4250"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={odometerKm}
              onChangeText={setOdometerKm}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Cost</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. 65.00"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={cost}
              onChangeText={setCost}
            />
          </View>
        </View>

        {/* Performed By (DIY vs Shop) */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Performed By</Text>
          <View style={styles.row}>
            <Pressable
              style={[
                styles.performedByBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
                performedBy === 'DIY' && { backgroundColor: Colors.yellow + '25', borderColor: Colors.yellowDark, borderWidth: 2 },
              ]}
              onPress={() => setPerformedBy('DIY')}
            >
              <Text style={styles.performedByEmoji}>🛠️</Text>
              <Text style={[styles.performedByText, { color: performedBy === 'DIY' ? Colors.ink : theme.text }]}>
                DIY (Self)
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.performedByBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
                performedBy !== 'DIY' && { backgroundColor: Colors.yellow + '25', borderColor: Colors.yellowDark, borderWidth: 2 },
              ]}
              onPress={() => setPerformedBy(performedBy === 'DIY' ? 'Moto Shop' : performedBy)}
            >
              <Text style={styles.performedByEmoji}>🏢</Text>
              <Text style={[styles.performedByText, { color: performedBy !== 'DIY' ? Colors.ink : theme.text }]}>
                Shop / Mechanic
              </Text>
            </Pressable>
          </View>

          {performedBy !== 'DIY' && (
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text, marginTop: 8 }]}
              placeholder="Shop or mechanic name"
              placeholderTextColor={theme.textMuted}
              value={performedBy === 'Moto Shop' ? '' : performedBy}
              onChangeText={(txt) => setPerformedBy(txt || 'Moto Shop')}
            />
          )}
        </View>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Notes / Specifications (Optional)</Text>
          <TextInput
            style={[
              styles.input,
              styles.notesInput,
              { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
            ]}
            placeholder="e.g. Tightened chain to 25mm slack, torqued drain bolt to 43 Nm"
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Submit Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.saveButtonPressed,
            isSubmitting && { opacity: 0.7 },
          ]}
          onPress={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.ink} />
          ) : (
            <Text style={styles.saveButtonText}>Save Maintenance Record</Text>
          )}
        </Pressable>
      </ScrollView>
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
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  vehicleEmoji: {
    fontSize: 24,
  },
  vehicleName: {
    ...Typography.heading,
    fontSize: 16,
  },
  vehicleOdo: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  catScroll: {
    marginBottom: Spacing.xs,
  },
  catRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  catEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  catLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    ...Typography.label,
    fontSize: 12,
  },
  input: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  performedByBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 6,
  },
  performedByEmoji: {
    fontSize: 16,
  },
  performedByText: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.yellow,
    borderRadius: Radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Spacing.md,
    ...Shadows.medium,
  },
  saveButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    ...Typography.button,
    color: Colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
});
