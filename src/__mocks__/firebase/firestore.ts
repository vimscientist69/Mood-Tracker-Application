export const doc = jest.fn((db, collection, id) => ({
  id: id || 'mock-doc-id',
  collection: collection,
  get: jest.fn(() => Promise.resolve({
    exists: () => true,
    data: () => ({}),
    id: id || 'mock-doc-id'
  })),
  set: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
}));

export const getDoc = jest.fn(() => Promise.resolve({
  exists: () => true,
  data: () => ({}),
  id: 'mock-doc-id'
}));

export const setDoc = jest.fn(() => Promise.resolve());
export const updateDoc = jest.fn(() => Promise.resolve());
export const deleteDoc = jest.fn(() => Promise.resolve());
export const collection = jest.fn((db, collectionName) => `mocked-collection/${collectionName}`);
export const getDocs = jest.fn(() => Promise.resolve({
  docs: [],
  empty: true,
  size: 0,
  forEach: (callback: any) => callback({}),
  docChanges: () => [],
  metadata: { hasPendingWrites: false, fromCache: false, isEqual: () => true }
}));

export const query = jest.fn((ref, ...queryConstraints) => ref);
export const where = jest.fn((field, op, value) => ({}));
export const orderBy = jest.fn((field, direction) => ({}));

// Mock Timestamp
export const Timestamp = {
  now: jest.fn(() => ({ seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 })),
  fromDate: jest.fn((date) => ({
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date,
    toMillis: () => date.getTime(),
    isEqual: (other: any) => other && other.seconds === Math.floor(date.getTime() / 1000),
    valueOf: () => date.toString()
  })),
  fromMillis: jest.fn((millis) => ({
    seconds: Math.floor(millis / 1000),
    nanoseconds: 0,
    toDate: () => new Date(millis),
    toMillis: () => millis,
    isEqual: (other: any) => other && other.seconds === Math.floor(millis / 1000),
    valueOf: () => millis.toString()
  }))
};

// Mock the initializeApp and getFirestore functions
export const initializeApp = jest.fn(() => ({}));
export const getFirestore = jest.fn(() => ({}));

// Mock the Firestore instance methods
export const mockFirebase = {
  firestore: {
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    Timestamp
  }
};

export default {
  initializeApp,
  getFirestore,
  firestore: mockFirebase.firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
};