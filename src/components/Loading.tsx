import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ViewStyle,
  TextStyle
} from 'react-native';
import { Fonts } from '../global-styles';
import { Portal } from '@gorhom/portal';

type LoadingOverlayProps = {
  loading: boolean;
  onCancel?: (loading: boolean) => void;
  text?: string | null | undefined;
  style?: ViewStyle;
  backdropStyle?: ViewStyle;
  textStyle?: TextStyle;
  activityIndicatorColor?: string;
  /**
   * If this props is given, the component will render inside {@link Portal}
   * and its content will be teleported to the portal whose hostname
   * matches this prop
   *
   * @see https://github.com/gorhom/react-native-portal#custom-portal-host
   */
  portalHostName?: string;
};

/**
 * A helper component that displays an opaque loading screen atop content.
 * The loading message can be customized. If the `onCancel` prop is given,
 * the loading screen fire the `onCancel` callback with a value of `false`.
 * That callback is used to help components maintain their loading state.
 */
const LoadingOverlay = ({
  loading,
  onCancel,
  style,
  text,
  portalHostName,
  backdropStyle,
  textStyle,
  activityIndicatorColor = '#fff'
}: LoadingOverlayProps): JSX.Element | null => {
  if (!loading) {
    return null;
  }

  const renderLoadingScreen = () => (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={() => onCancel?.(false)}
        style={[styles.backdrop, backdropStyle]}
        activeOpacity={1}
      >
        <ActivityIndicator size="large" color={activityIndicatorColor} />
        <View style={styles.textContainer}>
          {!!text && <Text style={[styles.loadingText, textStyle]}>{text}</Text>}
          {!!onCancel && <Text style={styles.cancelText}>Tap to cancel</Text>}
        </View>
      </TouchableOpacity>
    </View>
  );

  return portalHostName ? (
    <Portal hostName={portalHostName}>{renderLoadingScreen()}</Portal>
  ) : (
    renderLoadingScreen()
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    position: 'absolute',
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
