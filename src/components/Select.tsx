import { useActionSheet } from '@expo/react-native-action-sheet';
import React, { useState } from 'react';
import { View, TouchableWithoutFeedback, ViewStyle, Platform } from 'react-native';
import { Fonts } from '../global-styles';
import LabeledInput from './LabeledInput';

export type SelectOption = {
  title: string;
  // TODO: Maybe don't leave this as 'any'?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  onSelect: (value: SelectOption['value']) => void;
  disabled?: boolean;
};

type SelectProps = {
  defaultIndex: number;
  options: SelectOption[];
  onCancel?: () => void;
  required?: boolean;
  label?: string;
  style?: ViewStyle;
};

const Select = ({
  style,
  label,
  options,
  onCancel,
  defaultIndex,
  required = false
}: SelectProps): JSX.Element => {
  const [currentValue, setCurrentValue] = useState(options[defaultIndex].title);
  const { showActionSheetWithOptions } = useActionSheet();

  const showActionSheet = () => {
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
          disabled
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
