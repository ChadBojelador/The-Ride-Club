// ========================================
// THE RIDES CLUB — Add / Edit Vehicle Screen
// Register a bike or vehicle to your garage
// ========================================

import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Themes, Typography, Spacing, Radius, Shadows } from '../../constants/Theme';
import { VEHICLE_TYPES } from '../../../shared/maintenance';
import { garageService } from '../../services/garage';

export default function AddVehicleScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Themes[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [type, setType] = useState('motorcycle');
  const [odometerKm, setOdometerKm] = useState('');
  const [displacementCc, setDisplacementCc] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!make.trim() || !model.trim()) {
      Alert.alert('Missing Info', 'Please enter at least the Make and Model of your vehicle.');
      return;
    }

    setIsSubmitting(true);
    try {
      await garageService.createVehicle({
        name: name.trim() || `${make.trim()} ${model.trim()}`,
        make: make.trim(),
        model: model.trim(),
        year: year ? parseInt(year, 10) : null,
        type,
        odometer_km: odometerKm ? parseFloat(odometerKm) : 0,
        displacement_cc: displacementCc ? parseInt(displacementCc, 10) : null,
        license_plate: licensePlate.trim() || null,
        is_primary: true,
      });

      Alert.alert('🎉 Added to Garage!', 'Your vehicle and default maintenance intervals have been set up.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error('Failed to save vehicle:', err);
      Alert.alert('Error', err.message || 'Failed to save vehicle.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16), borderBottomColor: theme.border }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backText, { color: theme.text }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Add Vehicle</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Icon / Header */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🏍️</Text>
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Vehicle Details</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
          Track mileage, parts wear, and service schedules.
        </Text>

        {/* Vehicle Type Selector */}
        <Text style={[styles.inputLabel, { color: theme.text }]}>Vehicle Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          <View style={styles.typeRow}>
            {VEHICLE_TYPES.map((t) => (
              <Pressable
                key={t.id}
                style={[
                  styles.typeChip,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                  type === t.id && { backgroundColor: Colors.yellow + '20', borderColor: Colors.yellowDark, borderWidth: 2 },
                ]}
                onPress={() => setType(t.id)}
              >
                <Text style={styles.typeEmoji}>{t.icon}</Text>
                <Text style={[styles.typeLabel, { color: type === t.id ? Colors.ink : theme.text }]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Form Inputs */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Vehicle Nickname (Optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            placeholder="e.g. The Black Beast, Daily Rider"
            placeholderTextColor={theme.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Make *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. Yamaha, Ducati, Honda"
              placeholderTextColor={theme.textMuted}
              value={make}
              onChangeText={setMake}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Model *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. MT-09, Panigale"
              placeholderTextColor={theme.textMuted}
              value={model}
              onChangeText={setModel}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Year</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. 2024"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={year}
              onChangeText={setYear}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Engine (cc)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. 890"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={displacementCc}
              onChangeText={setDisplacementCc}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1.2 }]}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Current Odometer (km)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. 4500"
              placeholderTextColor={theme.textMuted}
              keyboardType="numeric"
              value={odometerKm}
              onChangeText={setOdometerKm}
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Plate No.</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              placeholder="e.g. TRC-098"
              placeholderTextColor={theme.textMuted}
              value={licensePlate}
              onChangeText={setLicensePlate}
            />
          </View>
        </View>

        {/* Tip Box */}
        <View style={[styles.tipBox, { backgroundColor: Colors.yellow + '15', borderColor: Colors.yellow + '40' }]}>
          <Text style={styles.tipEmoji}>💡</Text>
          <Text style={[styles.tipText, { color: theme.text }]}>
            We'll automatically create smart maintenance intervals for Engine Oil, Chain, Brakes, and Tires that update as you ride!
          </Text>
        </View>

        {/* Save Button */}
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
            <Text style={styles.saveButtonText}>Add to Garage</Text>
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.yellow + '25',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  iconEmoji: {
    fontSize: 32,
  },
  sectionTitle: {
    ...Typography.displaySmall,
    textAlign: 'center',
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  typeScroll: {
    marginBottom: Spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  typeEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  typeLabel: {
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
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipText: {
    ...Typography.bodySmall,
    flex: 1,
    lineHeight: 18,
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
