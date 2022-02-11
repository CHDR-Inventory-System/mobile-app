import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps
} from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import React, { useCallback, useState } from 'react';
import {
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle
} from 'react-native';
import LabeledInput, { LabeledInputProps } from './LabeledInput';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

type DatePickerInputProps = {
  mode?: 'date' | 'time' | 'datetime';
  required?: boolean;
  label?: string;
  value: Date | null;
  style?: ViewStyle;
  showTime?: boolean;
  onChange?: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  inputProps?: Partial<LabeledInputProps>
};

/**
 * Renders an input that opens a date picker when pressed. On Android, this renders
 * as a dialog. On iOS, it renders in a bottom sheet.
 *
 * NOTE: Because `@react-native-community/datetimepicker` doesn't have a time picker
 * that lets you choose date, year, and time all at once, this component will render
 * two separate date pickers (one for date and one for time) if the mode is set to
 * `datetime`.
 */
const DatePickerInput = ({
  style,
  onChange,
  label,
  value,
  minimumDate,
  maximumDate,
  inputProps,
  required = false,
  mode = 'date'
}: DatePickerInputProps): JSX.Element => {
  const [selectedDate, setSelectedDate] = useState(value);
  // Only used on iOS
  const [isIOSDatePickerShowing, setIOSDatePickerShowing] = useState(false);
  // Only used on Android
  const [isAndroidTimePickerShowing, setAndroidTimePickerShowing] = useState(false);
  const [isAndroidDatePickerShowing, setAndroidDatePickerShowing] = useState(false);

  // Need to modify the backdrop so that it shows up if we only have one snap point
  // https://github.com/gorhom/react-native-bottom-sheet/issues/585#issuecomment-900619713
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop disappearsOnIndex={-1} appearsOnIndex={0} {...props} />
    ),
    []
  );

  /**
   * On Android, this is called when the `OK` button on the date picker
   * dialog is clicked. On iOS, it's called whenever the value of the
   * picker slider changes.
   */
  const onDatePickerChange = (event: Event, date?: Date | undefined) => {
    // Since the date picker only shows as a dialog on Android, we
    // only need to worry about hiding it on Android
    if (Platform.OS === 'android') {
      setAndroidDatePickerShowing(false);

      if (mode === 'datetime' && date) {
        // Need to make sure this is called only after 'setSelectedDate(date)' is called
        setTimeout(() => setAndroidTimePickerShowing(true), 500);
      }
    }

    // This needs to be called last in this function, otherwise,
    // the date picker will flash
    // See: https://github.com/react-native-datetimepicker/datetimepicker/issues/54#issuecomment-553826672
    if (date) {
      setSelectedDate(date);
      onChange?.(date);
    }
  };

  /**
   * Because @react-native-community/datetimepicker doesn't have a time picker
   * that lets you choose a date with the year and time, we have to show to
   * separate pickers
   */
  const onTimePickerChange = (event: Event, date?: Date | undefined) => {
    setAndroidTimePickerShowing(false);

    if (date && selectedDate) {
      const updatedDate = new Date(selectedDate);
      updatedDate.setTime(date.getTime());
      setSelectedDate(updatedDate);
      onChange?.(updatedDate);
    }
  };

  const androidRenderTimePicker = () => {
    if (Platform.OS !== 'android' || !isAndroidTimePickerShowing) {
      return null;
    }

    return (
      <DateTimePicker
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onChange={onTimePickerChange}
        value={new Date(selectedDate || Date.now())}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        mode="time"
      />
    );
  };

  const iOSRenderDatePickerBottomSheet = () => {
    if (!isIOSDatePickerShowing) {
      return false;
    }

    let component;

    switch (mode) {
      case 'date':
      case 'time':
        component = (
          <DateTimePicker
            // Disabled because this type is too complicated to write out...
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            onChange={onDatePickerChange}
            value={new Date(selectedDate || Date.now())}
            mode={mode}
            display="spinner"
            style={styles.iOSDatePicker}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        );
        break;
      case 'datetime':
        component = (
          <>
            <DateTimePicker
              // Disabled because this type is too complicated to write out...
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onChange={onDatePickerChange}
              value={new Date(selectedDate || Date.now())}
              mode="date"
              display="spinner"
              style={styles.iOSDatePicker}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
            <DateTimePicker
              // Disabled because this type is too complicated to write out...
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onChange={onDatePickerChange}
              value={new Date(selectedDate || Date.now())}
              mode="time"
              display="spinner"
              style={styles.iOSDatePicker}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          </>
        );
        break;
      default:
        throw new Error(`Invalid mode ${mode}`);
    }

    return (
      <Portal>
        <BottomSheet
          onClose={() => setIOSDatePickerShowing(false)}
          snapPoints={[mode === 'datetime' ? '50%' : '35%']}
          backdropComponent={renderBackdrop}
        >
          <View style={styles.bottomSheetContentWrapper}>{component}</View>
        </BottomSheet>
      </Portal>
    );
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'ios') {
      return iOSRenderDatePickerBottomSheet();
    }

    if (!isAndroidDatePickerShowing) {
      return null;
    }

    return (
      <DateTimePicker
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onChange={onDatePickerChange}
        value={new Date(selectedDate || Date.now())}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        mode="date"
      />
    );
  };

  const getInputValue = () => {
    if (!selectedDate) {
      return '';
    }

    const date = moment(selectedDate);

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

  return (
    <TouchableWithoutFeedback
      onPress={() =>
        Platform.select({
          ios: setIOSDatePickerShowing(true),
          android:
            mode === 'time'
              ? setAndroidTimePickerShowing(true)
              : setAndroidDatePickerShowing(true)
        })
      }
    >
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
        {renderDatePicker()}
        {androidRenderTimePicker()}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  bottomSheetContentWrapper: {
    flex: 1,
    flexDirection: 'column'
  },
  iOSDatePicker: {
    flex: 1
  }
});

export default DatePickerInput;
