import React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Fonts } from '../global-styles';

type AlertProps = {
  title: string;
  message: string;
  type?: 'warning' | 'error';
  onClose?: () => void;
};

const Alert = ({
  title,
  message,
  type = 'error',
  onClose = () => {}
}: AlertProps): JSX.Element => {
  return (
    <TouchableOpacity onPress={onClose}>
      <View style={[styles.container, type === 'error' ? styles.error : styles.warning]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <Text style={[styles.message, styles.dismissText]}>Tap to dismiss.</Text>
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
