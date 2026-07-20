import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.muted }]}>Email</Text>
          <Text style={[styles.value, { color: colors.foreground }]}>
            {user?.email ?? 'Not signed in'}
          </Text>
        </View>

        {user && (
          <TouchableOpacity
            onPress={logout}
            style={[styles.button, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  title: { fontSize: 32, fontWeight: '300', marginBottom: 24 },
  card: {
    padding: 20,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 24,
  },
  label: { fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  value: { fontSize: 16, fontWeight: '500' },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: { color: '#0a0a0a', fontWeight: '600', fontSize: 14 },
});
