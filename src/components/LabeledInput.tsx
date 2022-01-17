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
} & TextInputProps;

const LabeledInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  style,
  labelStyle,
  inputStyle,
  keyboardType,
  onBlur,
  autoCapitalize,
  secureTextEntry = false,
  autoCorrect = false
}: Partial<LabeledInputProps>): JSX.Element => (
  <View style={[style]}>
    <Text style={[labelStyle, styles.label]}>{label}</Text>
    <TextInput
      autoCapitalize={autoCapitalize}
      onBlur={onBlur}
      style={[inputStyle, styles.input]}
      value={value}
      keyboardType={keyboardType}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      autoCorrect={autoCorrect}
      onChangeText={onChangeText}
    />
  </View>
);

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
    borderRadius: 4,
    borderColor: 'rgb(218, 218, 218)',
    fontFamily: Fonts.text,
    color: Colors.text
  }
});

export default LabeledInput;
