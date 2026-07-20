import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

function TabIcon({ focused, label }: { focused: boolean; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text
        style={{
          fontSize: 10,
          color: focused ? colors.accent : colors.muted,
          fontWeight: focused ? '600' : '400',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Home" />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Projects" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Profile" />,
        }}
      />
    </Tabs>
  );
}
