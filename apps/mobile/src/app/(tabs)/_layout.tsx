import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/components/ThemeProvider';

const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  index: { focused: 'home', unfocused: 'home-outline' },
  projects: { focused: 'folder-open', unfocused: 'folder-open-outline' },
  invoices: { focused: 'receipt', unfocused: 'receipt-outline' },
  notifications: { focused: 'notifications', unfocused: 'notifications-outline' },
  profile: { focused: 'person-circle', unfocused: 'person-circle-outline' },
};

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, size: _size }) => {
          const icons = TAB_ICONS[route.name];
          if (!icons) return null;
          return (
            <Ionicons
              name={focused ? icons.focused : icons.unfocused}
              size={22}
              color={focused ? colors.accent : colors.muted}
            />
          );
        },
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="projects" />
      <Tabs.Screen name="invoices" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
