import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  scheduleLocalNotification,
  getPushToken,
  setBadgeCount,
  getBadgeCount,
  ensureNotificationChannels,
} from '../src/lib/notifications';

const mockScheduleNotificationAsync = Notifications.scheduleNotificationAsync as jest.Mock;
const mockSetNotificationChannelAsync = Notifications.setNotificationChannelAsync as jest.Mock;
const mockGetPermissionsAsync = Notifications.getPermissionsAsync as jest.Mock;
const mockGetExpoPushTokenAsync = Notifications.getExpoPushTokenAsync as jest.Mock;
const mockSetBadgeCountAsync = Notifications.setBadgeCountAsync as jest.Mock;
const mockGetBadgeCountAsync = Notifications.getBadgeCountAsync as jest.Mock;

describe('notifications service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
  });

  it('schedules a local notification with category', async () => {
    mockScheduleNotificationAsync.mockResolvedValueOnce('notification-id');

    const id = await scheduleLocalNotification({
      title: 'Project Update',
      body: 'A milestone was completed',
      category: 'project_update',
      data: { screen: '/projects/1' },
    });

    expect(id).toBe('notification-id');
    expect(mockSetNotificationChannelAsync).toHaveBeenCalled();
    expect(mockScheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: 'Project Update',
          body: 'A milestone was completed',
        }),
        trigger: null,
      }),
    );
  });

  it('returns a push token when permission is granted', async () => {
    mockGetPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    mockGetExpoPushTokenAsync.mockResolvedValueOnce({ data: 'ExponentPushToken[abc]' });

    const token = await getPushToken();
    expect(token).toBe('ExponentPushToken[abc]');
  });

  it('returns null when permission is denied', async () => {
    mockGetPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

    const token = await getPushToken();
    expect(token).toBeNull();
  });

  it('ensures notification channels on Android', async () => {
    await ensureNotificationChannels();
    expect(mockSetNotificationChannelAsync).toHaveBeenCalledWith('default', expect.any(Object));
  });

  it('manages badge count', async () => {
    mockGetBadgeCountAsync.mockResolvedValueOnce(3);
    const count = await getBadgeCount();
    expect(count).toBe(3);

    await setBadgeCount(0);
    expect(mockSetBadgeCountAsync).toHaveBeenCalledWith(0);
  });
});
