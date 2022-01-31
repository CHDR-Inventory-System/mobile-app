import { Platform } from 'react-native';

/**
 * Takes 2 values (the first for android and the second for iOS)
 * and applies that value depending on the platform
 */
export function platformValue<T>(androidValue: T, iosValue: T): T {
  return Platform.OS === 'android' ? androidValue : iosValue;
}
