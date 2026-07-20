import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.foreground }]}>Sign In</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Access your HEXA Studio portal.
        </Text>

        {error && (
          <View style={[styles.error, { backgroundColor: colors.error + '20', borderColor: colors.error }]}>
            <Text style={{ color: colors.error }}>{error}</Text>
          </View>
        )}

        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
          placeholder="Email"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
          placeholder="Password"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={[styles.button, { backgroundColor: colors.accent }, loading && { opacity: 0.6 }]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, justifyContent: 'center', flex: 1 },
  title: { fontSize: 36, fontWeight: '300', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 32 },
  input: {
    padding: 14,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: { color: '#0a0a0a', fontWeight: '600', fontSize: 14 },
  error: {
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 16,
  },
});
