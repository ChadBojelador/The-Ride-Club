// THE RIDES CLUB - Leaderboard Browser
import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, TextInput, ActivityIndicator, useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Themes, Typography, Spacing, Radius, Shadows } from '../../constants/Theme';
import { getSegments } from '../../services/segments';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Themes[colorScheme];
  const insets = useSafeAreaInsets();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');

  const load = useCallback(async (query = '') => {
    try {
      const data = await getSegments({ q: query });
      setSegments(data.segments || []);
    } catch (_) { setSegments([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { load(q); }, [q, load]);
  useEffect(() => { const t = setTimeout(() => setQ(search), 400); return () => clearTimeout(t); }, [search]);

  const renderItem = ({ item }) => (
    <Pressable
      id={'segment-' + item.id}
      style={({ pressed }) => [styles.card, { backgroundColor: theme.surface, borderColor: theme.border }, pressed && { opacity: 0.8 }]}
      onPress={() => router.push('/leaderboard/' + item.id)}
    >
      <View style={styles.cardTop}>
        <View style={[styles.badge, { backgroundColor: Colors.red + '18' }]}>
          <Text style={[styles.badgeText, { color: Colors.red }]}>SEGMENT</Text>
        </View>
        <Text style={[styles.km, { color: theme.textMuted }]}>
          {item.distance_km ? parseFloat(item.distance_km).toFixed(1) + ' km' : '—'}
        </Text>
      </View>
      <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>{item.name}</Text>
      <View style={styles.meta}>
        <Text style={[styles.metaText, { color: theme.textSecondary }]}>👥 {item.total_attempts || 0} riders</Text>
        {item.created_by_name ? <Text style={[styles.metaText, { color: theme.textMuted }]}>by {item.created_by_name}</Text> : null}
      </View>
      {item.podium && item.podium.length > 0 && (
        <View style={[styles.podium, { borderTopColor: theme.border }]}>
          {item.podium.map((p, i) => (
            <View key={i} style={styles.podiumRow}>
              <Text style={styles.medal}>{MEDAL[i] || '#' + (i+1)}</Text>
              <Text style={[styles.pName, { color: theme.text }]} numberOfLines={1}>{p.display_name}</Text>
              <Text style={[styles.pTime, { color: Colors.red }]}>{p.time}</Text>
            </View>
          ))}
        </View>
      )}
      <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Pressable id="lb-back" onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: Colors.red }]}>‹ Map</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>🏆 Leaderboards</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={[styles.searchWrap, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TextInput
          id="lb-search"
          style={[styles.searchInput, { color: theme.text, backgroundColor: theme.background }]}
          placeholder="Search segments..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.red} size="large" /></View>
      ) : segments.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ fontSize: 48, marginBottom: Spacing.lg }}>🏁</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No segments yet</Text>
          <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>Finish a ride to claim a leaderboard spot!</Text>
        </View>
      ) : (
        <FlatList
          data={segments} keyExtractor={i => i.id} renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing.xl }]}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(q); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 0.5 },
  backBtn: { paddingVertical: Spacing.sm, minWidth: 60 },
  backText: { ...Typography.bodyLarge, fontWeight: '700' },
  headerTitle: { ...Typography.heading },
  searchWrap: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderBottomWidth: 0.5 },
  searchInput: { ...Typography.body, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  list: { padding: Spacing.lg, gap: Spacing.md },
  card: { borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, position: 'relative', ...Shadows.small },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  badge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.pill },
  badgeText: { ...Typography.label, fontSize: 9 },
  km: { ...Typography.bodySmall },
  name: { ...Typography.displaySmall, marginBottom: Spacing.sm, paddingRight: Spacing.xl },
  meta: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  metaText: { ...Typography.bodySmall },
  podium: { paddingTop: Spacing.md, borderTopWidth: 1, gap: Spacing.xs },
  podiumRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 2 },
  medal: { fontSize: 16, width: 24 },
  pName: { ...Typography.body, flex: 1 },
  pTime: { ...Typography.body, fontFamily: 'Inter_600SemiBold' },
  chevron: { position: 'absolute', right: Spacing.lg, top: '42%', fontSize: 24, fontWeight: '200' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  emptyTitle: { ...Typography.displaySmall, textAlign: 'center', marginBottom: Spacing.sm },
  emptyBody: { ...Typography.body, textAlign: 'center', lineHeight: 22 },
});
