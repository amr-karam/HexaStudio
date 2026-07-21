/** A single achievement / stat-bar entry (e.g. "50+" projects delivered) */
export interface Achievement {
  id: number;
  title: string;
  value: string;
  description?: string;
  order: number;
}

/** Response shape for the Achievements collection endpoint */
export interface AchievementResponse {
  data: Achievement[];
}
