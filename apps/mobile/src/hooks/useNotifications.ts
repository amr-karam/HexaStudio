import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { apiFetch } from '@/lib/api';

/* eslint-disable @typescript-eslint/no-explicit-any */

const PUSH_TOKEN_KEY = 'hexa_push_token';

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });
  }

  const { status: existingStatus } =
    (await Notifications.getPermissionsAsync()) as unknown as {
      status: string;
    };
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = (await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
      android: {},
    })) as unknown as { status: string };
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch {
    return null;
  }
}

export function useNotifications() {
  const responseListenerRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    const setup = async () => {
      const token = await registerForPushNotificationsAsync();
      if (!token) return;

      const storedToken = await SecureStore.getItemAsync(PUSH_TOKEN_KEY);
      if (token !== storedToken) {
        try {
          await apiFetch('/api/mobile/push/register', {
            method: 'POST',
            body: JSON.stringify({ token, platform: Platform.OS }),
          });
          await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token);
        } catch {
          // Registration failed — will retry on next mount
        }
      }
    };

    setup();

    responseListenerRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.screen && typeof data.screen === 'string') {
          router.push(data.screen as any);
        }
      });

    return () => {
      responseListenerRef.current?.remove();
    };
  }, []);
}
