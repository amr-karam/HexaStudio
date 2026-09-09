import { useCallback, useEffect, useState } from 'react';
import { Text, View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    // Mock data for now; replace with a real API call later
    const mockNotifications: Notification[] = [
      { id: '1', title: 'New Approval Request', message: '3D Renderings v2 are ready for review.', timestamp: '2 hours ago', isRead: false },
      { id: '2', title: 'Milestone Reached', message: 'Phase 2 is 100% complete.', timestamp: '1 day ago', isRead: true },
    ];
    setNotifications(mockNotifications);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) load();
    else setIsLoading(false);
  }, [user, load]);

  if (!user) return <Text style={{ color: colors.muted, padding: 24 }}>Sign in to view notifications.</Text>;
  if (isLoading) return <ActivityIndicator color={colors.foreground} style={styles.spinner} />;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: item.isRead ? 0.7 : 1 }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>{item.title}</Text>
              <Text style={[styles.cardMeta, { color: colors.muted }]}>{item.message}</Text>
              <Text style={[styles.cardMeta, { color: colors.muted }]}>{item.timestamp}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, flex: 1 },
  title: { fontSize: 32, fontWeight: '300', marginBottom: 16 },
  spinner: { marginTop: 32 },
  card: { padding: 16, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  cardMeta: { fontSize: 12, lineHeight: 18 },
});
