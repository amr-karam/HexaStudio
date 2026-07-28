import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type NotificationCategory = 'approval' | 'project_update' | 'document' | 'milestone' | 'default';

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  category?: NotificationCategory;
}

const CATEGORY_CHANNELS: Record<NotificationCategory, { id: string; name: string; description: string }> = {
  approval: { id: 'approvals', name: 'Approvals', description: 'Phase and deliverable approvals' },
  project_update: { id: 'project-updates', name: 'Project Updates', description: 'Project status changes' },
  document: { id: 'documents', name: 'Documents', description: 'New files and uploads' },
  milestone: { id: 'milestones', name: 'Milestones', description: 'Milestone completions and due dates' },
  default: { id: 'default', name: 'Default', description: 'General HEXA Studio notifications' },
};

export async function ensureNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#6366F1',
  });

  for (const channel of Object.values(CATEGORY_CHANNELS)) {
    await Notifications.setNotificationChannelAsync(channel.id, {
      name: channel.name,
      description: channel.description,
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6366F1',
    });
  }
}

export function getChannelId(category: NotificationCategory = 'default'): string | undefined {
  return Platform.OS === 'android' ? CATEGORY_CHANNELS[category].id : undefined;
}

export async function scheduleLocalNotification(
  payload: PushNotificationPayload,
): Promise<string> {
  await ensureNotificationChannels();

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: payload.title,
      body: payload.body,
      data: payload.data,
      sound: 'default',
      ...(Platform.OS === 'android' ? { channelId: getChannelId(payload.category) } : {}),
    },
    trigger: null,
  });

  return id;
}

function isGranted(permission: Notifications.NotificationPermissionsStatus): boolean {
  return (permission as unknown as { status?: string }).status === 'granted';
}

export async function getPushToken(): Promise<string | null> {
  try {
    const permission = await Notifications.getPermissionsAsync();
    if (!isGranted(permission)) return null;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch {
    return null;
  }
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}
