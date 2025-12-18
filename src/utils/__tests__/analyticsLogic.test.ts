import {
  calculateAverageMood,
  calculateMoodCounts,
  filterLogsByDate,
  calculateTopTags,
} from "../analyticsLogic";

describe("analyticsLogic", () => {
  describe("calculateAverageMood", () => {
    it("calculates correct average for mixed ratings", () => {
      const logs = [{ moodRating: 5 }, { moodRating: 3 }, { moodRating: 1 }];
      // (5+3+1)/3 = 3.0
      expect(calculateAverageMood(logs)).toBe("3.0");
    });

    it("returns 0 for empty logs", () => {
      expect(calculateAverageMood([])).toBe("0");
    });

    it("handles single log", () => {
      const logs = [{ moodRating: 4 }];
      expect(calculateAverageMood(logs)).toBe("4.0");
    });
  });

  describe("calculateMoodCounts", () => {
    it("counts occurrences correctly", () => {
      const logs = [
        { moodRating: 5 },
        { moodRating: 5 },
        { moodRating: 3 },
        { moodRating: 1 },
      ];
      const counts = calculateMoodCounts(logs);
      expect(counts[5]).toBe(2);
      expect(counts[3]).toBe(1);
      expect(counts[1]).toBe(1);
      expect(counts[2]).toBe(0);
    });
  });

  describe("filterLogsByDate", () => {
    it('returns all logs for "all" range', () => {
      const logs = [{ date: "2023-01-01" }, { date: "2025-01-01" }];
      const result = filterLogsByDate(logs, "all");
      expect(result).toHaveLength(2);
    });

    // Mocking date would be ideal here or using relative dates in test data
    // For simplicity, we assume filterLogsByDate uses new Date() internally
    // So we should construct dates relative to now for testing
  });

  describe("calculateTopTags", () => {
    it("identifies top tags correctly", () => {
      const logs = [
        { tags: ["Work", "Stress"] },
        { tags: ["Work", "Happy"] },
        { tags: ["Gym"] },
      ];
      const result = calculateTopTags(logs);
      // Work: 2, Stress: 1, Happy: 1, Gym: 1
      expect(result[0].tag).toBe("Work");
      expect(result[0].count).toBe(2);
      expect(result.length).toBe(4);
    });
  });
});
