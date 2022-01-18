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
  text: string;
  icon?: JSX.Element;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  disabled?: boolean;
  activeOpacity?: number;
};

const Button = ({
  style,
  textStyle,
  text,
  icon,
  activeOpacity = 0.8,
  onPress = () => {},
  disabled = false
}: ButtonProps): JSX.Element => (
  <TouchableOpacity
    disabled={disabled}
    activeOpacity={activeOpacity}
    style={[styles.button, disabled ? styles.disabled : {}, style]}
    onPress={onPress}
  >
    <View style={styles.contentRow}>
      <Text style={[styles.buttonText, textStyle]}>{text}</Text>
      {icon && <View style={styles.icon}>{icon}</View>}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  disabled: {
    backgroundColor: '#C4C4CA'
  },
  button: {
    backgroundColor: Colors['monoChromatic-1'],
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
