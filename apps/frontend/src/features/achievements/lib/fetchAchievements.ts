import { captureException } from '@sentry/nextjs';
import { Achievement, AchievementResponse } from '../types';
import { API_BASE_URL } from '@/config/constants';

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 5000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

const EMPTY_ACHIEVEMENT_RESPONSE: AchievementResponse = { data: [] };

/**
 * Fetch all achievements sorted by their `order` field.
 *
 * Server-side callers get the internal Docker DNS address; client-side
 * callers use the public `API_BASE_URL`.
 */
export async function fetchAchievements(): Promise<AchievementResponse> {
  try {
    const baseUrl =
      typeof window === 'undefined'
        ? process.env.API_URL || 'http://backend:4000'
        : API_BASE_URL;

    const response = await fetchWithTimeout(`${baseUrl}/api/achievements`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      captureException(
        new Error(
          `Achievements API Error: ${response.status} ${response.statusText}`,
        ),
      );
      return EMPTY_ACHIEVEMENT_RESPONSE;
    }

    return (await response.json()) as AchievementResponse;
  } catch (error) {
    captureException(error);
    return EMPTY_ACHIEVEMENT_RESPONSE;
  }
}

/**
 * Fetch all achievements as a flat array (convenience wrapper).
 *
 * Items are returned in the order provided by the API (assumed sorted by
 * `Achievement.order`).
 */
export async function fetchAchievementsList(): Promise<Achievement[]> {
  const response = await fetchAchievements();
  return response.data;
}
