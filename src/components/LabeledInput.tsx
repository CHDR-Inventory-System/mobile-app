import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextStyle,
  ViewStyle,
  TextInputProps,
  Platform,
  ViewProps
} from 'react-native';
import { Colors, Fonts } from '../global-styles';

export type LabeledInputProps = {
  label: string;
  style: ViewStyle;
  labelStyle: TextStyle;
  inputStyle: TextStyle;
  required?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  pointerEvents?: ViewProps['pointerEvents'];
  /**
   * Displays an information message underneath this input
   */
  help?: string;
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
    help = '',
    pointerEvents,
    ...textInputProps
  } = props;

  return (
    <View style={style} pointerEvents={pointerEvents}>
      <View style={styles.textLabelContainer}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {required && <Text style={styles.requiredAsterisk}>*</Text>}
      </View>
      <TextInput
        editable={!disabled}
        style={[
          styles.input,
          errorMessage ? styles.errorInput : {},
          disabled ? styles.disabled : {},
          inputStyle
        ]}
        autoCorrect={autoCorrect}
        secureTextEntry={secureTextEntry}
        {...textInputProps}
      />
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      {!!help && <Text style={styles.helpText}>{help}</Text>}
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
  disabled: {
    color: Colors.textMuted
  },
  errorText: {
    fontFamily: Fonts.text,
    marginTop: 8,
    marginLeft: 4,
    color: '#DE1306',
    lineHeight: 20
  },
  helpText: {
    fontFamily: Fonts.text,
    marginTop: 8,
    marginLeft: 4,
    color: Colors.textMuted,
    lineHeight: 20
  }
});

export default LabeledInput;
