import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  TextInputProps,
  Platform
} from 'react-native';
import { Colors, Fonts } from '../global-styles';

type LabeledInputProps = {
  label: string;
  style: ViewStyle;
  labelStyle: TextStyle;
  inputStyle: TextStyle;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
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
    required = false,
    errorMessage = '',
    ...textInputProps
  } = props;

  return (
    <View style={[style]} pointerEvents={disabled ? 'none' : 'auto'}>
      <View style={styles.textLabelContainer}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {required && <Text style={styles.requiredAsterisk}>*</Text>}
      </View>
      <TextInput
        style={[styles.input, errorMessage ? styles.errorInput : {}, inputStyle]}
        autoCorrect={autoCorrect}
        secureTextEntry={secureTextEntry}
        {...textInputProps}
      />
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
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
  textLabelContainer: {
    flexDirection: 'row'
  },
  requiredAsterisk: {
    marginLeft: 4,
    fontFamily: Fonts.text,
    color: '#ff4d4f',
    transform: [{ scale: 1.5 }, { translateY: 6 }]
  },
  input: {
    paddingTop: Platform.select({
      android: 8,
      ios: 12
    }),
    paddingBottom: Platform.select({
      android: 8,
      ios: 12
    }),
    paddingLeft: 8,
    paddingRight: 8,
    fontSize: Fonts.defaultTextSize,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: 'rgb(218, 218, 218)',
    fontFamily: Fonts.text,
    color: Colors.text
  },
  errorInput: {
    borderColor: '#DE1306'
  },
  errorText: {
    fontFamily: Fonts.text,
    marginTop: 8,
    marginLeft: 4,
    color: '#DE1306',
    lineHeight: 20
  }
});

export default LabeledInput;
