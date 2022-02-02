import React, { useState, useCallback } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  View,
  Platform,
  ScrollView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import BackTitleHeader from '../components/BackTitleHeader';
import { NavigationProps, RouteProps } from '../types/navigation';
import LabeledInput from '../components/LabeledInput';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomSheet from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { BottomSheetBackdropProps, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Button from '../components/Button';
import { formatDate } from '../util/date';

/**
 * Because not all react native components work on all devices, there are a
 * few differences in this component between Android and iOS.
 *
 * `Android`: The date picker renders as a dialog
 *
 * `iOS`: The date picker renders as a native picker inside a bottom sheet
 */
const EditItemScreen = (): JSX.Element => {
  const { params: item } = useRoute<RouteProps<'ItemDetail'>>();
  const navigation = useNavigation<NavigationProps>();
  const { showActionSheetWithOptions } = useActionSheet();
  const [isDatePickerShowing, setDatePickerShowing] = useState(false);
  const [isDateSheetShowing, setDateSheetShowing] = useState(false);

  // Need to modify the backdrop so that it shows up if we only have one snap point
  // https://github.com/gorhom/react-native-bottom-sheet/issues/585#issuecomment-900619713
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop disappearsOnIndex={-1} appearsOnIndex={0} {...props} />
    ),
    []
  );

  const confirmBackPress = () => {
    Alert.alert(
      'Unsaved Changes',
      "Are you sure you want to go back? you'll lose any unsaved changes.",
      [
        {
          text: 'Go Back',
          onPress: () => navigation.goBack()
        },
        {
          text: 'Cancel'
        }
      ]
    );
  };

  const showStatusActionSheet = () => {
    const options = [
      {
        title: 'Available',
        value: true
      },
      {
        title: 'Unavailable',
        value: false
      }
    ];
    showActionSheetWithOptions(
      {
        options: options.map(({ title }) => title),
        destructiveButtonIndex: 1,
        cancelButtonIndex: 0
      },
      buttonIndex => {
        if (buttonIndex !== undefined) {
          // eslint-disable-next-line no-console
          console.log(options[buttonIndex]);
        }
      }
    );
  };

  /**
   * On Android, this is called when the `OK` button on the date picker
   * dialog is clicked. On iOS, it's called whenever the value of the
   * picker slider changes.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onDatePickerChange = (event: Event, date?: Date | undefined) => {
    // Since the date picker only shows as a dialog on Android, we
    // only need to worry about hiding it on Android
    setDatePickerShowing(Platform.OS === 'android');
  };

  const renderDatePickerBottomSheet = () => {
    if (!isDateSheetShowing) {
      return false;
    }

    return (
      <Portal>
        <BottomSheet
          onClose={() => setDateSheetShowing(false)}
          snapPoints={['35%']}
          backdropComponent={renderBackdrop}
        >
          <View style={{ flex: 1 }}>
            <DateTimePicker
              // Disabled because this type is to complicated to write out...
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onChange={onDatePickerChange}
              value={new Date()}
              mode="date"
              display="spinner"
              style={{ flex: 1 }}
              maximumDate={new Date()}
            />
          </View>
        </BottomSheet>
      </Portal>
    );
  };

  const renderPurchaseDatePicker = () =>
    Platform.select({
      ios: renderDatePickerBottomSheet(),
      android: isDatePickerShowing && (
        <DateTimePicker
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          onChange={onDatePickerChange}
          value={new Date()}
          maximumDate={new Date()}
          mode="date"
          display="default"
        />
      )
    });

  return (
    <View style={{ flex: 1 }}>
      <BackTitleHeader title="Edit Item" onBackPress={confirmBackPress} />
      <KeyboardAvoidingView
        behavior="height"
        style={{ flex: 1 }}
        keyboardVerticalOffset={125}
      >
        <ScrollView style={styles.inputContainer} showsVerticalScrollIndicator={true}>
          <LabeledInput
            label="Title"
            value={item.name}
            style={styles.input}
            returnKeyType="done"
          />
          <LabeledInput
            label="Description"
            value={item.description || ''}
            style={styles.input}
            inputStyle={styles.multilineInput}
            returnKeyType="done"
            multiline
            blurOnSubmit
          />
          <LabeledInput
            label="Location"
            value={item.location}
            style={styles.input}
            returnKeyType="done"
          />
          <LabeledInput
            label="Barcode"
            value={item.barcode}
            style={styles.input}
            returnKeyType="done"
          />
          <LabeledInput
            label="Quantity"
            value={item.quantity.toString()}
            keyboardType="numeric"
            returnKeyType="done"
            style={styles.input}
          />

          <TouchableWithoutFeedback onPress={showStatusActionSheet}>
            <LabeledInput
              disabled
              label="Status"
              editable={false}
              value={item.available ? 'Available' : 'Unavailable'}
              style={styles.input}
            />
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback
            onPress={() =>
              Platform.select({
                ios: setDateSheetShowing(true),
                android: setDatePickerShowing(true)
              })
            }
          >
            <LabeledInput
              disabled
              label="Purchase Date"
              value={item.purchaseDate ? formatDate(item.purchaseDate, false) : ''}
              style={styles.input}
            />
          </TouchableWithoutFeedback>

          {renderPurchaseDatePicker()}

          <LabeledInput label="Serial" value={item.serial || ''} style={styles.input} />
          <LabeledInput label="Type" value={item.type} style={styles.input} />
          <LabeledInput
            label="Vendor Name"
            value={item.vendorName || ''}
            style={styles.input}
          />
          <LabeledInput
            label="Vendor Price"
            value={item.vendorPrice?.toString() || ''}
            style={styles.input}
            keyboardType="numeric"
            returnKeyType="done"
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <Button text="Save" style={styles.saveButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    paddingHorizontal: 16
  },
  input: {
    marginVertical: 12
  },
  multilineInput: {
    lineHeight: 20
  },
  saveButton: {
    marginBottom: 24,
    marginTop: 16,
    marginHorizontal: 16
  }
});

export default EditItemScreen;
