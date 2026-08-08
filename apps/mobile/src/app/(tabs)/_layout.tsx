import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { ParamListBase } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useTheme } from '@/components/ThemeProvider';

type TabParamList = ParamListBase;

const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap; label: string }> = {
  index: { focused: 'home', unfocused: 'home-outline', label: 'Dashboard' },
  projects: { focused: 'folder-open', unfocused: 'folder-open-outline', label: 'Projects' },
  notifications: { focused: 'notifications', unfocused: 'notifications-outline', label: 'Notifications' },
  profile: { focused: 'person-circle', unfocused: 'person-circle-outline', label: 'Profile' },
};

interface ScreenOptionsProps {
  route: RouteProp<TabParamList, string>;
}

interface TabBarIconProps {
  focused: boolean;
  color: string;
  size: number;
}

export default function TabsLayout() {
  const { colors, typography } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }: ScreenOptionsProps): BottomTabNavigationOptions => {
        const config = TAB_ICONS[route.name];
        return {
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 72,
          },
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: typography.bodyS.fontSize,
            fontWeight: '500',
            letterSpacing: 0.3,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarIcon: ({ focused, size: _size }: TabBarIconProps) => {
            if (!config) return null;
            return (
              <Ionicons
                name={focused ? config.focused : config.unfocused}
                size={22}
                color={focused ? colors.accent : colors.muted}
              />
            );
          },
          tabBarLabel: config?.label ?? route.name,
        };
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
      <Tabs.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
