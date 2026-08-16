import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from './ThemeProvider';
import { useOTAUpdates } from '@/hooks/useOTAUpdates';

export function UpdateBanner() {
  const { colors, radius } = useTheme();
  const { status, isUpdateAvailable, isUpdatePending, download, restart } = useOTAUpdates();

  if (__DEV__) return null;

  if (status === 'up-to-date' || status === 'checking') return null;

  if (status === 'error' && !isUpdateAvailable && !isUpdatePending) {
    return (
      <View style={[styles.banner, { backgroundColor: colors.error + '20', borderColor: colors.error }]}>
        <Text style={[styles.text, { color: colors.error }]}>
          Update check failed. Continuing with current version.
        </Text>
      </View>
    );
  }

  if (status === 'available' || (status === 'error' && isUpdateAvailable)) {
    return (
      <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.text, { color: colors.foreground }]}>
          A new version is available.
        </Text>
        <Pressable
          onPress={download}
          accessibilityRole="button"
          accessibilityLabel="Download Update"
          style={[styles.button, { backgroundColor: colors.accent, borderRadius: radius.sm }]}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>Download Update</Text>
        </Pressable>
      </View>
    );
  }

  if (status === 'downloading') {
    return (
      <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.text, { color: colors.foreground, marginLeft: 10 }]}>
          Downloading update...
        </Text>
      </View>
    );
  }

  if (status === 'ready' || isUpdatePending) {
    return (
      <View style={[styles.banner, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.text, { color: colors.foreground }]}>
          Update ready. Restart to apply.
        </Text>
        <Pressable
          onPress={restart}
          accessibilityRole="button"
          accessibilityLabel="Restart Now"
          style={[styles.button, { backgroundColor: colors.accent, borderRadius: radius.sm }]}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>Restart Now</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 101,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    marginLeft: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
