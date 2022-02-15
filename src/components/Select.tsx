import { useActionSheet } from '@expo/react-native-action-sheet';
import React, { useState } from 'react';
import { View, TouchableWithoutFeedback, ViewStyle, Platform } from 'react-native';
import { Fonts } from '../global-styles';
import LabeledInput, { LabeledInputProps } from './LabeledInput';

export type SelectOption = {
  title: string;
  // TODO: Maybe don't leave this as 'any'?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  onSelect: (value: SelectOption['value']) => void;
  disabled?: boolean;
};

type SelectProps = {
  /**
   * The index of the default value
   */
  defaultValueIndex: number;
  options: SelectOption[];
  /**
   * The title props that's used in `showActionSheetWithOptions`
   */
  sheetTitle?: string;
  disabled?: boolean;
  onCancel?: () => void;
  required?: boolean;
  label?: string;
  style?: ViewStyle;
  inputProps?: Partial<LabeledInputProps>;
};

const Select = ({
  style,
  label,
  options,
  onCancel,
  defaultValueIndex,
  inputProps,
  disabled,
  required,
  sheetTitle
}: SelectProps): JSX.Element => {
  const [currentValue, setCurrentValue] = useState(options[defaultValueIndex].title);
  const { showActionSheetWithOptions } = useActionSheet();

  const showActionSheet = () => {
    if (disabled) {
      return;
    }

    // Go through the options array and grab the indices of all options
    // that have 'disabled' set to true
    const disabledIndices = options.reduce((prev, curr, index) => {
      return prev.concat(curr.disabled ? index : []);
    }, [] as number[]);

    showActionSheetWithOptions(
      {
        options: [...options.map(({ title }) => title), 'Cancel'],
        disabledButtonIndices: disabledIndices,
        cancelButtonIndex: options.length,
        title: sheetTitle,
        destructiveButtonIndex: Platform.select({
          android: options.length
        }),
        textStyle: {
          fontFamily: Fonts.text
        }
      },
      buttonIndex => {
        if (buttonIndex === undefined) {
          return;
        }

        if (buttonIndex === options.length) {
          onCancel?.();
          return;
        }

        const { onSelect, value, title, disabled } = options[buttonIndex];

        if (!disabled) {
          setCurrentValue(title);
          onSelect(value);
        }
      }
    );
  };

  return (
    <TouchableWithoutFeedback onPress={showActionSheet}>
      <View>
        <LabeledInput
          {...inputProps}
          pointerEvents="none"
          required={required}
          label={label}
          editable={false}
          value={currentValue}
          style={style}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Select;
