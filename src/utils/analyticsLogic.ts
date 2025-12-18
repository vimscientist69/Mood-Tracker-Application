import { subDays, subMonths, subYears } from "date-fns";

export type TimeRange = "7d" | "30d" | "3m" | "6m" | "1y" | "all";

// Helper to filter logs by range
export const filterLogsByDate = (logs: any[], range: TimeRange) => {
  const now = new Date();
  let cutoffDate: Date | null = null;

  switch (range) {
    case "7d":
      cutoffDate = subDays(now, 7);
      break;
    case "30d":
      cutoffDate = subDays(now, 30);
      break;
    case "3m":
      cutoffDate = subMonths(now, 3);
      break;
    case "6m":
      cutoffDate = subMonths(now, 6);
      break;
    case "1y":
      cutoffDate = subYears(now, 1);
      break;
    case "all":
      cutoffDate = null;
      break;
  }

  if (!cutoffDate) {
    return logs;
  }
  return logs.filter((log) => new Date(log.date) >= cutoffDate);
};

// Calculate Mood Counts for Pie Chart
export const calculateMoodCounts = (logs: any[]) => {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  logs.forEach((log) => {
    if (counts[log.moodRating] !== undefined) {
      counts[log.moodRating]++;
    }
  });
  return counts;
};

// Calculate Average Mood
export const calculateAverageMood = (logs: any[]): string => {
  if (logs.length === 0) {
    return "0";
  }
  const sum = logs.reduce((acc, log) => acc + log.moodRating, 0);
  return (sum / logs.length).toFixed(1);
};

// Calculate Top Tags
export const calculateTopTags = (logs: any[]) => {
  const tagCounts: Record<string, number> = {};
  logs.forEach((log) => {
    log.tags.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
};
