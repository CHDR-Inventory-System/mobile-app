import React, { useEffect, useState } from 'react';
import { Platform, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import LabeledInput, { LabeledInputProps } from './LabeledInput';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  IOSNativeProps,
  AndroidNativeProps
} from '@react-native-community/datetimepicker';
import moment from 'moment';

type Display = IOSNativeProps['display'] | AndroidNativeProps['display'];

type DatePickerInputProps = {
  useUtc?: boolean;
  display?: Display;
  mode?: 'date' | 'time' | 'datetime';
  required?: boolean;
  label?: string;
  value: Date | null;
  style?: ViewStyle;
  onChange?: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  inputProps?: Partial<LabeledInputProps>;
};

const displayModes = {
  android: new Set<Display>([undefined, 'default', 'spinner', 'calendar', 'clock']),
  ios: new Set<Display>([undefined, 'default', 'spinner', 'compact', 'inline'])
};

/**
 * Renders an input that opens a date picker when pressed. On Android, this renders
 * as a dialog. On iOS, it renders in a bottom sheet.
 */
const DatePickerInput = ({
  required,
  inputProps,
  label,
  style,
  display,
  value,
  onChange,
  minimumDate,
  maximumDate,
  useUtc,
  mode = 'date'
}: DatePickerInputProps): JSX.Element => {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);

  const onConfirmDate = (date: Date) => {
    setSelectedDate(date);
    setDatePickerVisible(false);
    onChange?.(date);
  };

  const getInputValue = () => {
    if (!selectedDate) {
      return '';
    }

    const date = useUtc ? moment.utc(selectedDate) : moment(selectedDate);

    switch (mode) {
      case 'time':
        return date.format('h:mm A');
      case 'date':
        return date.format('MMMM Do YYYY');
      case 'datetime':
        return date.format('MMMM Do YYYY h:mm A');
      default:
        throw new Error(`Invalid mode ${mode}`);
    }
  };

  const isDisplayModeValid = () => {
    const OS = Platform.OS.toLowerCase() as keyof typeof displayModes;
    return displayModes[OS].has(display);
  };

  useEffect(() => {
    if (!isDisplayModeValid()) {
      console.warn(
        `${display} mode not supported on ${Platform.OS}, using mode "default" instead...`
      );
    }
  }, []);

  return (
    <>
      <DateTimePickerModal
        mode={mode}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        display={Platform.select({
          ios: isDisplayModeValid() ? display : 'default',
          android: isDisplayModeValid() ? display : 'default'
        })}
        isVisible={isDatePickerVisible}
        onCancel={() => setDatePickerVisible(false)}
        onConfirm={onConfirmDate}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        isDarkModeEnabled={false}
      />
      <TouchableWithoutFeedback onPress={() => setDatePickerVisible(true)}>
        <View>
          <LabeledInput
            // Need to set pointerEvents to none here so the the touch
            // event from TouchableWithoutFeedback doesn't propagate
            // to this input component
            pointerEvents="none"
            required={required}
            label={label}
            value={getInputValue()}
            style={style}
            {...inputProps}
          />
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};

export default DatePickerInput;
