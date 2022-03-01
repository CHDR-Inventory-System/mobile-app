import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  StyleSheet,
  View
} from 'react-native';
import { Colors, Fonts } from '../global-styles';

type ButtonProps = {
  text?: string;
  variant?: 'primary' | 'danger';
  icon?: JSX.Element;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconStyle?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  activeOpacity?: number;
};

const Button = ({
  style,
  textStyle,
  text,
  icon,
  iconStyle,
  variant = 'primary',
  activeOpacity = 0.8,
  onPress = () => {},
  disabled = false
}: ButtonProps): JSX.Element => {
  const styleMap = {
    primary: styles.primary,
    danger: styles.danger
  };

  const disabledStyle = disabled ? styles.disabled : {};

  return (
    <TouchableOpacity
      disabled={disabled}
      activeOpacity={activeOpacity}
      style={[styles.button, styleMap[variant], disabledStyle, style]}
      onPress={onPress}
    >
      <View style={styles.contentRow}>
        {!!text && <Text style={[styles.buttonText, textStyle]}>{text}</Text>}
        {icon && <View style={[styles.icon, iconStyle]}>{icon}</View>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  disabled: {
    backgroundColor: '#777777'
  },
  primary: {
    backgroundColor: Colors['monoChromatic-1']
  },
  danger: {
    backgroundColor: Colors.danger
  },
  button: {
    borderRadius: 6,
    alignItems: 'center',
    paddingTop: 14,
    paddingRight: 8,
    paddingBottom: 14,
    paddingLeft: 8
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: Fonts.defaultTextSize,
    fontFamily: Fonts.text
  },
  icon: {
    marginLeft: 12
  }
});

export default Button;
