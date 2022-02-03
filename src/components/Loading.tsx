import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { Fonts } from '../global-styles';

type LoadingOverlayProps = {
  loading: boolean;
  onCancel?: (loading: boolean) => void;
  text?: string;
};

/**
 * A helper component that displays an opaque loading screen atop content.
 * The loading message can be customized. If the `onCancel` prop is given,
 * the loading screen fire the `onCancel` callback with a value of `false`.
 * That callback is used to help components maintain their loading state.
 */
const LoadingOverlay = ({
  loading,
  text = 'Loading',
  onCancel
}: LoadingOverlayProps): JSX.Element | null => {
  if (!loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onCancel?.(false)}
        style={styles.backdrop}
        activeOpacity={1}
      >
        <ActivityIndicator size="large" color="#ffffff" />
        <View style={styles.textContainer}>
          <Text style={styles.loadingText}>{text}</Text>
          {!!onCancel && <Text style={styles.cancelText}>Tap to cancel</Text>}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  },
  textContainer: {
    marginTop: 24,
    alignItems: 'center'
  },
  loadingText: {
    fontFamily: Fonts.subtitle,
    fontSize: 24,
    color: '#FFF'
  },
  cancelText: {
    fontSize: Fonts.defaultTextSize,
    fontFamily: Fonts.text,
    color: 'hsl(0, 0%, 70%)',
    marginTop: 16
  }
});

export default LoadingOverlay;
