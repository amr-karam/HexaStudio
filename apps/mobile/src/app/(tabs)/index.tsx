import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { fetchPortalDashboard, PortalDashboard } from '@/lib/api';

function formatAmount(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<PortalDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchPortalDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
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
    if (isLoading) {
      return <ActivityIndicator color={colors.foreground} style={{ marginTop: 40 }} />;
    }
    if (error) {
      return (
        <Text style={[styles.body, { color: colors.muted }]}>{error}</Text>
      );
    }
    if (!dashboard) {
      return (
        <Text style={[styles.body, { color: colors.muted }]}>
          Sign in to view your project dashboard.
        </Text>
      );
    }

    const { project, timeline, invoices } = dashboard;
    const completedMilestones = timeline.filter((t) => t.status === 'completed').length;
    const totalMilestones = timeline.length;
    const pendingInvoices = invoices.filter((i) => i.status !== 'paid');
    const totalDue = pendingInvoices.reduce((sum, i) => sum + i.amount, 0);

    return (
      <>
        {/* Project Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardLabel, { color: colors.muted }]}>Current Project</Text>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{project.title}</Text>
          <Text style={[styles.cardMeta, { color: colors.muted }]}>
            {project.category} · {project.status}
          </Text>
        </View>

        {/* Milestone Progress */}
        {totalMilestones > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.muted }]}>Milestone Progress</Text>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              {completedMilestones} / {totalMilestones} complete
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}%`,
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            </View>
            {timeline.slice(0, 3).map((t, i) => (
              <Text key={i} style={[styles.cardMeta, { color: colors.muted, marginTop: 4 }]}>
                {t.status === 'completed' ? '✓' : '○'} {t.phase}
              </Text>
            ))}
          </View>
        )}

        {/* Invoices Summary */}
        {invoices.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.muted }]}>Invoices</Text>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              {pendingInvoices.length > 0
                ? `${pendingInvoices.length} pending · ${formatAmount(totalDue)} due`
                : 'All paid'}
            </Text>
          </View>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          user ? (
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.muted} />
          ) : undefined
        }
      >
        <Text style={[styles.greeting, { color: colors.foreground }]}>
          Welcome{user?.email ? `, ${user.email}` : ''}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          HEXA Studio — your projects, on the go.
        </Text>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  greeting: { fontSize: 32, fontWeight: '300', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 32 },
  body: { fontSize: 14, lineHeight: 22 },
  card: { padding: 20, borderRadius: 4, borderWidth: 1, marginBottom: 16 },
  cardLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
  cardTitle: { fontSize: 18, fontWeight: '500', marginBottom: 4 },
  cardMeta: { fontSize: 13, lineHeight: 20 },
  barTrack: { height: 4, backgroundColor: '#1a1a2e', borderRadius: 2, marginTop: 8, marginBottom: 4, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
});
