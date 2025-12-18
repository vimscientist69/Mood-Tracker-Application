// src/__mocks__/firebase/app.ts
const initializeApp = jest.fn(() => ({}));
const getApps = jest.fn(() => [{}]);
const getApp = jest.fn(() => ({}));

export {
  initializeApp,
  getApps,
  getApp,
};

export default {
  initializeApp,
  getApps,
  getApp,
};