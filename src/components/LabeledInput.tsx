import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  TextInputProps
} from 'react-native';
import { platformValue } from '../util/platform';
import { Colors, Fonts } from '../global-styles';

type LabeledInputProps = {
  label: string;
  style: ViewStyle;
  labelStyle: TextStyle;
  inputStyle: TextStyle;
  disabled?: boolean;
} & TextInputProps;

const LabeledInput = (props: Partial<LabeledInputProps>): JSX.Element => {
  const {
    label,
    style,
    labelStyle,
    inputStyle,
    secureTextEntry = false,
    autoCorrect = false,
    disabled = false,
    ...textInputProps
  } = props;

  return (
    <View style={[style]} pointerEvents={disabled ? 'none' : 'auto'}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <TextInput
        style={[inputStyle, styles.input]}
        autoCorrect={autoCorrect}
        secureTextEntry={secureTextEntry}
        {...textInputProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: Fonts.defaultTextSize,
    fontFamily: Fonts.subtitle,
    marginBottom: 12,
    color: Colors.text
  },
  input: {
    paddingTop: platformValue(8, 12),
    paddingBottom: platformValue(8, 12),
    paddingLeft: 8,
    paddingRight: 8,
    fontSize: Fonts.defaultTextSize,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: 'rgb(218, 218, 218)',
    fontFamily: Fonts.text,
    color: Colors.text
  }
});

export default LabeledInput;
