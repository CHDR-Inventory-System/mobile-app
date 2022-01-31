import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../global-styles';

type ButtonProps = {
  text: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  disabled?: boolean;
};

const Button = ({
  style,
  textStyle,
  text,
  onPress = () => {},
  disabled = false
}: ButtonProps): JSX.Element => (
  <TouchableOpacity
    disabled={disabled}
    style={[style, styles.button, disabled ? styles.disabled : {}]}
    onPress={onPress}
  >
    <Text style={[textStyle, styles.buttonText]}>{text}</Text>
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
  buttonText: {
    color: '#fff',
    fontSize: Fonts.defaultTextSize,
    fontFamily: Fonts.text
  }
});

export default Button;
