import { useCallback, useEffect, useState } from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { fetchProjects, ClientProject } from '@/lib/api';

export default function ProjectsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      load();
    } else {
      setIsLoading(false);
    }
  }, [user, load]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    load();
  }, [load]);

  const renderContent = () => {
    if (!user) {
      return (
        <Text style={[styles.body, { color: colors.muted }]}>
          Sign in from the Login tab to view your projects.
        </Text>
      );
    }
    if (isLoading) {
      return <ActivityIndicator color={colors.foreground} style={styles.spinner} />;
    }
    if (error) {
      return <Text style={[styles.body, { color: colors.muted }]}>{error}</Text>;
    }
    if (projects.length === 0) {
      return (
        <Text style={[styles.body, { color: colors.muted }]}>
          No projects yet. New projects appear here once they start.
        </Text>
      );
    }
    return (
      <FlatList
        data={projects}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.muted} />
        }
        renderItem={({ item }) => {
          const total = item.milestones.length;
          const done = item.milestones.filter((m) => m.completed).length;
          return (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/projects/[id]',
                  params: { id: String(item.id), name: item.name },
                })
              }
            >
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.name}</Text>
              <Text style={[styles.cardMeta, { color: colors.muted }]}>
                {item.status} · {item.type}
              </Text>
              {total > 0 && (
                <Text style={[styles.cardMeta, { color: colors.muted }]}>
                  Milestones: {done}/{total} complete
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Projects</Text>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, flex: 1 },
  title: { fontSize: 32, fontWeight: '300', marginBottom: 16 },
  body: { fontSize: 14, lineHeight: 22 },
  spinner: { marginTop: 32 },
  card: { padding: 20, borderRadius: 4, borderWidth: 1, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  cardMeta: { fontSize: 13, lineHeight: 20 },
});
