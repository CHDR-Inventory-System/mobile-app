import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors, Fonts } from '../global-styles';

export type AlertProps = {
  title?: string;
  message: string;
  type?: 'warning' | 'error' | 'info';
  onClose?: () => void;
  style?: ViewStyle;
};

const Alert = ({
  title,
  message,
  onClose,
  style,
  type = 'error'
}: AlertProps): JSX.Element => {
  const styleMap = {
    error: styles.error,
    warning: styles.warning,
    info: styles.info
  };

  return (
    <TouchableOpacity onPress={onClose} activeOpacity={!!onClose ? 0.7 : 1}>
      <View style={[styles.container, styleMap[type], style]}>
        {!!title && <Text style={styles.title}>{title}</Text>}
        <Text style={styles.message}>{message}</Text>
        {!!onClose && (
          <Text style={[styles.message, styles.dismissText]}>Tap to dismiss.</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  error: {
    backgroundColor: '#FFF1F0',
    borderColor: '#FFCCC7'
  },
  warning: {
    backgroundColor: '#FFFBE6',
    borderColor: '#FFE58F'
  },
  info: {
    backgroundColor: '#E6F7FF',
    borderColor: '#91D5FF'
  },
  container: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 24
  },
  title: {
    fontSize: Fonts.defaultTextSize,
    marginBottom: 8,
    fontFamily: Fonts.heading,
    color: Colors.text
  },
  message: {
    fontSize: Fonts.defaultTextSize,
    lineHeight: 22,
    fontFamily: Fonts.text,
    color: Colors.text
  },
  dismissText: {
    marginTop: 8,
    fontFamily: Fonts.subtitle,
    color: Colors.textMuted
  }
});

export default Alert;
