import { useCallback, useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { fetchProjectDetail, ClientProjectDetail } from '@/lib/api';

export default function ProjectMilestonesScreen() {
  const { colors } = useTheme();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const [project, setProject] = useState<ClientProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchProjectDetail(Number(id));
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      load();
    } else {
      setIsLoading(false);
    }
  }, [user, load]);

  // Auth guard — wait for session restore, then redirect unauthenticated users
  // to the login screen (data fetches are gated on `user` to avoid firing
  // token-less requests while the session is still being restored).
  if (isAuthLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ActivityIndicator color={colors.foreground} style={styles.spinner} />
      </SafeAreaView>
    );
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator color={colors.foreground} style={styles.spinner} />;
    }
    if (error) {
      return <Text style={[styles.body, { color: colors.muted }]}>{error}</Text>;
    }
    if (!project) {
      return (
        <Text style={[styles.body, { color: colors.muted }]}>
          Project not found.
        </Text>
      );
    }

    const milestones = project.milestones ?? [];
    return (
      <FlatList
        data={milestones}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.status, { color: colors.muted }]}>
              {project.type} · {project.status}
            </Text>
            {project.progress > 0 && (
              <Text style={[styles.progress, { color: colors.accent }]}>
                {project.progress}% complete
              </Text>
            )}
            <View style={[styles.arBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.arText, { color: colors.accent }]}>
                ✦ 1:1 Scale AR Asset Cached &amp; Ready
              </Text>
            </View>
          </View>
        }
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
      <Stack.Screen options={{ title: name ?? 'Project' }} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>{name ?? 'Project'}</Text>
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
  headerCard: { padding: 16, borderRadius: 4, borderWidth: 1, marginBottom: 16 },
  status: { fontSize: 13, lineHeight: 20, marginBottom: 4 },
  progress: { fontSize: 14, fontWeight: '600' },
  arBadge: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4, borderWidth: 1, alignItems: 'center' },
  arText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  card: { padding: 20, borderRadius: 4, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  cardMeta: { fontSize: 13, lineHeight: 20, marginBottom: 2 },
});
