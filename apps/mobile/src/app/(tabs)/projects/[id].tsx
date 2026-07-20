import { useCallback, useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { fetchMilestones, ClientMilestone } from '@/lib/api';

export default function ProjectMilestonesScreen() {
  const { colors } = useTheme();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const [milestones, setMilestones] = useState<ClientMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchMilestones(Number(id));
      setMilestones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load milestones');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator color={colors.foreground} style={styles.spinner} />;
    }
    if (error) {
      return <Text style={[styles.body, { color: colors.muted }]}>{error}</Text>;
    }
    if (milestones.length === 0) {
      return (
        <Text style={[styles.body, { color: colors.muted }]}>
          No milestones for this project yet.
        </Text>
      );
    }
    return (
      <FlatList
        data={milestones}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: item.completed ? colors.accent : colors.border },
                ]}
              />
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.name}</Text>
            </View>
            <Text style={[styles.cardMeta, { color: colors.muted }]}>
              {item.completed ? 'Completed' : 'Upcoming'}
              {item.date ? ` · ${item.date}` : ''}
            </Text>
            {item.description ? (
              <Text style={[styles.cardMeta, { color: colors.muted }]}>{item.description}</Text>
            ) : null}
          </View>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ title: name ?? 'Milestones' }} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>{name ?? 'Milestones'}</Text>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, flex: 1 },
  title: { fontSize: 28, fontWeight: '300', marginBottom: 16 },
  body: { fontSize: 14, lineHeight: 22 },
  spinner: { marginTop: 32 },
  card: { padding: 20, borderRadius: 4, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  cardMeta: { fontSize: 13, lineHeight: 20, marginBottom: 2 },
});
