// THE RIDES CLUB - Segment Leaderboard Detail
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, useColorScheme } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Themes, Typography, Spacing, Radius, Shadows } from '../../constants/Theme';
import { getSegmentLeaderboard } from '../../services/segments';
import { useAuth } from '../../context/AuthContext';

const MEDAL = ['🥇', '🥈', '🥉'];
const PODIUM_BG = [Colors.yellow + '22', '#C0C0C022', '#CD7F3222'];
const PODIUM_COLOR = [Colors.yellowDark, '#888888', '#CD7F32'];

export default function SegmentDetailScreen() {
  const { segmentId } = useLocalSearchParams();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Themes[colorScheme];
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [segment, setSegment] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myEntry, setMyEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSegmentLeaderboard(segmentId);
        setSegment(data.segment);
        setLeaderboard(data.leaderboard || []);
        setMyEntry(data.myEntry || null);
      } catch (e) { setError(e.message || 'Failed to load'); }
      finally { setLoading(false); }
    })();
  }, [segmentId]);

  const renderRow = ({ item }) => {
    const isMe = user && item.userId === user.id;
    const isTop3 = item.rank <= 3;
    return (
      <View style={[
        styles.row,
        { backgroundColor: isMe ? Colors.red + '12' : theme.surface, borderColor: isMe ? Colors.red + '40' : theme.border },
        isTop3 && { borderColor: PODIUM_COLOR[item.rank-1] + '60' },
      ]}>
        <View style={[styles.rankBubble, isTop3 && { backgroundColor: PODIUM_BG[item.rank-1] }]}>
          {isTop3 ? (
            <Text style={styles.rankMedal}>{MEDAL[item.rank-1]}</Text>
          ) : (
            <Text style={[styles.rankNum, { color: theme.textMuted }]}>{item.rank}</Text>
          )}
        </View>
        <View style={styles.rowMid}>
          <Text style={[styles.rowName, { color: theme.text }, isMe && { color: Colors.red }]} numberOfLines={1}>
            {item.displayName}{isMe ? ' (You)' : ''}
          </Text>
          {item.vehicle ? (
            <Text style={[styles.rowVehicle, { color: theme.textMuted }]}>
              🏍️ {item.vehicle.year} {item.vehicle.make} {item.vehicle.model}
            </Text>
          ) : null}
        </View>
        <View style={styles.rowRight}>
          <Text style={[styles.rowTime, { color: isTop3 ? PODIUM_COLOR[item.rank-1] : theme.text }]}>{item.time}</Text>
          {item.gapToLeader ? (
            <Text style={[styles.rowGap, { color: theme.textMuted }]}>{item.gapToLeader}</Text>
          ) : (
            <Text style={[styles.rowGap, { color: Colors.yellow }]}>LEADER</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: Colors.red }]}>‹ Back</Text>
        </Pressable>
      </View>
      <View style={styles.center}><ActivityIndicator color={Colors.red} size="large" /></View>
    </View>
  );

  if (error || !segment) return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: Colors.red }]}>‹ Back</Text>
        </Pressable>
      </View>
      <View style={styles.center}>
        <Text style={{ fontSize: 40, marginBottom: Spacing.md }}>⚠️</Text>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Failed to load</Text>
        <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>{error}</Text>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.heroTitle, { color: theme.text }]}>{segment.name}</Text>
        <View style={styles.heroMeta}>
          {segment.distance_km ? (
            <View style={[styles.pill, { backgroundColor: Colors.blue + '18' }]}>
              <Text style={[styles.pillText, { color: Colors.blue }]}>
                📍 {parseFloat(segment.distance_km).toFixed(1)} km
              </Text>
            </View>
          ) : null}
          <View style={[styles.pill, { backgroundColor: Colors.red + '18' }]}>
            <Text style={[styles.pillText, { color: Colors.red }]}>
              👥 {segment.total_attempts || 0} riders
            </Text>
          </View>
        </View>
      </View>
      {/* Section label */}
      <View style={[styles.sectionLabel, { backgroundColor: theme.background }]}>
        <Text style={[styles.sectionLabelText, { color: theme.textMuted }]}>RANKINGS</Text>
      </View>
    </View>
  );

  const ListFooter = () => myEntry ? (
    <View style={[styles.myCard, { backgroundColor: Colors.red + '12', borderColor: Colors.red + '50' }]}>
      <Text style={[styles.myCardLabel, { color: Colors.red }]}>YOUR BEST</Text>
      <View style={styles.myCardRow}>
        <Text style={[styles.myCardRank, { color: Colors.red }]}>#{myEntry.rank}</Text>
        <Text style={[styles.myCardTime, { color: theme.text }]}>{myEntry.time}</Text>
        {myEntry.avgSpeedKmh ? (
          <Text style={[styles.myCardSpeed, { color: theme.textSecondary }]}>
            {myEntry.avgSpeedKmh.toFixed(1)} km/h avg
          </Text>
        ) : null}
      </View>
      {myEntry.gapToLeader ? (
        <Text style={[styles.myCardGap, { color: theme.textMuted }]}>
          {myEntry.gapToLeader} off the leader
        </Text>
      ) : (
        <Text style={[styles.myCardGap, { color: Colors.yellow }]}>👑 You are the leader!</Text>
      )}
    </View>
  ) : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Pressable id="lb-detail-back" onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: Colors.red }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>🏆 Rankings</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={i => i.userId}
        renderItem={renderRow}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Spacing.xxl }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.center}>
            <Text style={{ fontSize: 40, marginBottom: Spacing.md }}>🏁</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No times yet</Text>
            <Text style={[styles.emptyBody, { color: theme.textSecondary }]}>Be the first to set a time on this segment!</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 0.5 },
  backBtn: { paddingVertical: Spacing.sm, minWidth: 60 },
  backText: { ...Typography.bodyLarge, fontWeight: '700' },
  headerTitle: { ...Typography.heading },
  hero: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.xl, borderBottomWidth: 0.5 },
  heroTitle: { ...Typography.displayMedium, marginBottom: Spacing.md },
  heroMeta: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  pill: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.pill },
  pillText: { ...Typography.bodySmall, fontFamily: 'Inter_600SemiBold' },
  sectionLabel: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  sectionLabelText: { ...Typography.label, fontSize: 10 },
  list: { gap: 0 },
  row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, gap: Spacing.md },
  rankBubble: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  rankMedal: { fontSize: 22 },
  rankNum: { ...Typography.heading },
  rowMid: { flex: 1 },
  rowName: { ...Typography.bodyLarge, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  rowVehicle: { ...Typography.bodySmall },
  rowRight: { alignItems: 'flex-end' },
  rowTime: { ...Typography.heading, fontFamily: 'Outfit_700Bold' },
  rowGap: { ...Typography.bodySmall, marginTop: 2 },
  myCard: { margin: Spacing.lg, padding: Spacing.lg, borderRadius: Radius.lg, borderWidth: 1.5 },
  myCardLabel: { ...Typography.label, fontSize: 10, marginBottom: Spacing.sm },
  myCardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg, marginBottom: Spacing.xs },
  myCardRank: { ...Typography.displayMedium, fontFamily: 'Outfit_700Bold' },
  myCardTime: { ...Typography.displaySmall },
  myCardSpeed: { ...Typography.bodySmall, flex: 1, textAlign: 'right' },
  myCardGap: { ...Typography.bodySmall },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  emptyTitle: { ...Typography.displaySmall, textAlign: 'center', marginBottom: Spacing.sm },
  emptyBody: { ...Typography.body, textAlign: 'center', lineHeight: 22 },
});
