import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.greeting, { color: colors.foreground }]}>
          Welcome{user?.email ? `, ${user.email}` : ''}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          HEXA Studio — your projects, on the go.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Active Projects</Text>
          <Text style={[styles.cardBody, { color: colors.muted }]}>
            View project timelines, milestones, and documents from the Projects tab.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Notifications</Text>
          <Text style={[styles.cardBody, { color: colors.muted }]}>
            Stay updated with phase approvals, annotations, and milestone completions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 32,
  },
  card: {
    padding: 20,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 20,
  },
});
