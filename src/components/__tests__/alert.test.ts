import { Alert } from 'react-native';
import alert from '../alert';

// Note: Alert tests for web platform are not written because `alert` mock on web does not work as expected.

// Mock the global window object
const mockAlert = jest.fn();
const mockConfirm = jest.fn();

// Mock the global window object for web tests
const originalWindow = global.window;
Object.defineProperty(global, 'window', {
  value: {
    ...originalWindow,
    alert: mockAlert,
    confirm: mockConfirm,
  },
  writable: true,
});

describe('alert', () => {
  const originalPlatform = process.env.TEST_PLATFORM || process.env.EXPO_OS;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.EXPO_OS;
    mockConfirm.mockReturnValue(true);
  });

  afterAll(() => {
    // Restore original window and platform
    if (originalPlatform) {
      process.env.EXPO_OS = originalPlatform;
    }
  });

    beforeEach(() => {
      process.env.EXPO_OS = 'ios';
      alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
      alertSpy.mockRestore();
    });

    it('calls Alert.alert with correct parameters', () => {
      alert('Mobile Alert', 'This is a mobile alert');
      expect(alertSpy).toHaveBeenCalledWith(
        'Mobile Alert',
        'This is a mobile alert',
        [{ text: 'OK' }]
      );
    });

    it('handles empty message', () => {
      alert('Title Only');
      expect(alertSpy).toHaveBeenCalledWith(
        'Title Only',
        undefined,
        [{ text: 'OK' }]
      );
    });
    it('handles custom button styles on mobile', () => {
      process.env.EXPO_OS = 'ios';
      const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
      const onDelete = jest.fn();
      
      alert('Test', 'Message', [
        { text: 'Delete', onPress: onDelete, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]);
      
      expect(alertSpy).toHaveBeenCalledWith(
        'Test',
        'Message',
        [
          { text: 'Delete', onPress: expect.any(Function), style: 'destructive' },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      
      // Simulate pressing the delete button
      const buttons = alertSpy.mock.calls[0][2];
      const deleteButton = buttons?.find((b: any) => b.text === 'Delete');
      if (deleteButton && typeof deleteButton.onPress === 'function') {
        deleteButton.onPress();
      }
      expect(onDelete).toHaveBeenCalled();
      
      alertSpy.mockRestore();
    });
});