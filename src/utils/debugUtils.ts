import {
  collection,
  getDocs,
  writeBatch,
  doc,
  Timestamp,
} from "firebase/firestore";
import {
  db,
  USERS_COLLECTION,
  MOOD_LOGS_COLLECTION,
} from "../services/firebase";

// Predefined mood tags for random selection
const MOOD_TAGS = [
  "happy",
  "sad",
  "anxious",
  "calm",
  "energetic",
  "tired",
  "stressed",
  "relaxed",
  "excited",
  "bored",
  "grateful",
  "frustrated",
  "content",
  "overwhelmed",
  "peaceful",
];

// Simple placeholder journal entries
const JOURNAL_ENTRIES = [
  "Had a good day today.",
  "Feeling okay overall.",
  "Just another day.",
  "Things went well.",
  "Could be better.",
];

/**
 * Deletes all mood log data for a given user
 * Uses batched deletion for efficiency
 */
export const deleteAllMoodData = async (userId: string): Promise<void> => {
  console.log(`deleteAllMoodData called for userId: ${userId}`);
  if (!userId) {
    console.error(
      "deleteAllMoodData requires a userId, but none was provided.",
    );
    throw new Error("User ID is required");
  }

  const logsRef = collection(
    db,
    USERS_COLLECTION,
    userId,
    MOOD_LOGS_COLLECTION,
  );

  try {
    console.log("Fetching mood log references to delete...");
    // Get all documents
    const snapshot = await getDocs(logsRef);

    if (snapshot.empty) {
      console.log("No mood data to delete for this user.");
      return;
    }

    console.log(`Found ${snapshot.docs.length} mood logs to delete.`);

    // Firestore batches can handle up to 500 operations
    const batchSize = 500;
    const batches: any[] = [];
    let currentBatch = writeBatch(db);
    let operationCount = 0;

    snapshot.docs.forEach((document) => {
      currentBatch.delete(document.ref);
      operationCount++;

      if (operationCount === batchSize) {
        console.log(`Adding a batch of ${operationCount} deletions.`);
        batches.push(currentBatch);
        // Reset for the next batch
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    });

    // Add the last batch if it has operations
    if (operationCount > 0) {
      console.log(`Adding the final batch of ${operationCount} deletions.`);
      batches.push(currentBatch);
    }

    console.log(`Committing ${batches.length} batches...`);
    // Commit all batches
    await Promise.all(batches.map((batch) => batch.commit()));

    console.log(
      `Successfully deleted ${snapshot.docs.length} mood log entries.`,
    );
  } catch (error) {
    console.error("Error during the deletion process:", error);
    // Re-throw the error so the calling function can handle it
    throw error;
  }
};

/**
 * Generates a random integer between min and max (inclusive)
 */
const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Randomly selects n items from an array
 */
const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

/**
 * Populates random mood data for the past year
 * Generates entries for ~75% of days with random mood ratings, tags, and simple journal entries
 * Uses efficient batching for Firestore writes
 */
export const populateRandomMoodData = async (
  userId: string,
): Promise<number> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const logsRef = collection(
    db,
    USERS_COLLECTION,
    userId,
    MOOD_LOGS_COLLECTION,
  );

  // Calculate date range (past year)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  // Generate array of all dates in the past year
  const allDates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    allDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Randomly select ~75% of dates
  const targetCount = Math.floor(allDates.length * 0.75);
  const selectedDates = getRandomItems(allDates, targetCount);

  // Sort dates chronologically for better organization
  selectedDates.sort((a, b) => a.getTime() - b.getTime());

  // Create mood log entries
  const batchSize = 500;
  const batches: any[] = [];
  let currentBatch = writeBatch(db);
  let operationCount = 0;
  let totalEntries = 0;

  for (const date of selectedDates) {
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split("T")[0];

    // Generate random mood data
    const moodRating = getRandomInt(1, 5);
    const numTags = getRandomInt(1, 4); // 1-4 tags per entry
    const tags = getRandomItems(MOOD_TAGS, numTags);
    const note = JOURNAL_ENTRIES[getRandomInt(0, JOURNAL_ENTRIES.length - 1)];

    // Create timestamp for the date (set to a random time during the day)
    const hour = getRandomInt(8, 22); // Between 8 AM and 10 PM
    const minute = getRandomInt(0, 59);
    const entryDate = new Date(date);
    entryDate.setHours(hour, minute, 0, 0);

    const moodLog = {
      date: dateStr,
      timestamp: Timestamp.fromDate(entryDate),
      moodRating,
      tags,
      note,
      createdAt: Timestamp.fromDate(entryDate),
      updatedAt: Timestamp.fromDate(entryDate),
    };

    // Add to batch
    const docRef = doc(logsRef, dateStr);
    currentBatch.set(docRef, moodLog);
    operationCount++;
    totalEntries++;

    // Create new batch if current one is full
    if (operationCount === batchSize) {
      batches.push(currentBatch);
      currentBatch = writeBatch(db);
      operationCount = 0;
    }
  }

  // Add the last batch if it has operations
  if (operationCount > 0) {
    batches.push(currentBatch);
  }

  // Commit all batches asynchronously
  await Promise.all(batches.map((batch) => batch.commit()));

  console.log(`Created ${totalEntries} random mood log entries`);
  return totalEntries;
};
