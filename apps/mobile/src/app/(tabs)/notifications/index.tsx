import { useCallback, useEffect, useState } from 'react';
import { Text, View, Switch, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';

interface NotificationPreferences {
  projectUpdates: boolean;
  phaseApprovals: boolean;
  newAnnotations: boolean;
  documentUploads: boolean;
  milestoneCompletions: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  projectUpdates: true,
  phaseApprovals: true,
  newAnnotations: false,
  documentUploads: false,
  milestoneCompletions: true,
};

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrefs = useCallback(async () => {
    try {
      setError(null);
      const data = await apiFetch<NotificationPreferences>('/api/portal/notifications/preferences');
      setPrefs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadPrefs();
    else setIsLoading(false);
  }, [user, loadPrefs]);

  const toggle = async (key: keyof NotificationPreferences) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      await apiFetch('/api/portal/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify({ preferences: next }),
      });
    } catch {
      // Revert on failure
      setPrefs(prefs);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
          <Text style={[styles.body, { color: colors.muted }]}>Sign in to manage notifications.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <ActivityIndicator color={colors.foreground} style={{ marginTop: 48 }} />
      </SafeAreaView>
    );
  }

  const options: { key: keyof NotificationPreferences; label: string; desc: string }[] = [
    { key: 'projectUpdates', label: 'Project Updates', desc: 'Status changes and new milestones' },
    { key: 'phaseApprovals', label: 'Phase Approvals', desc: 'When a project phase needs your approval' },
    { key: 'milestoneCompletions', label: 'Milestone Completions', desc: 'When a milestone is marked complete' },
    { key: 'documentUploads', label: 'Document Uploads', desc: 'New files shared on your projects' },
    { key: 'newAnnotations', label: 'New Annotations', desc: 'Comments or notes on your deliverables' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
        {error && (
          <View style={[styles.errorBar, { backgroundColor: colors.error + '20', borderColor: colors.error }]}>
            <Text style={{ color: colors.error, fontSize: 12 }}>{error}</Text>
          </View>
        )}
        {options.map((opt) => (
          <View
            key={opt.key}
            style={[styles.row, { borderColor: colors.border }]}
          >
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.foreground }]}>{opt.label}</Text>
              <Text style={[styles.rowDesc, { color: colors.muted }]}>{opt.desc}</Text>
            </View>
            <Switch
              value={prefs[opt.key]}
              onValueChange={() => toggle(opt.key)}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.foreground}
            />
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  title: { fontSize: 32, fontWeight: '300', marginBottom: 24 },
  body: { fontSize: 14, lineHeight: 22 },
  errorBar: { padding: 10, borderRadius: 4, borderWidth: 1, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  rowText: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 15, fontWeight: '500', marginBottom: 2 },
  rowDesc: { fontSize: 12, lineHeight: 18 },
});
