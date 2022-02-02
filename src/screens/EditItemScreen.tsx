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
import { Formik, FormikHelpers } from 'formik';
import { Item } from '../types/API';

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
  const [purchaseDate, setPurchaseDate] = useState(
    item.purchaseDate ? formatDate(item.purchaseDate, false) : ''
  );

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

  const showStatusActionSheet = (setFieldValue: FormikHelpers<Item>['setFieldValue']) => {
    const options = [
      {
        title: 'Cancel',
        value: undefined
      },
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
        cancelButtonIndex: 0
      },
      buttonIndex => {
        if (buttonIndex !== undefined && buttonIndex > 0) {
          setFieldValue('available', options[buttonIndex].value);
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
    if (date) {
      setPurchaseDate(formatDate(date.toString(), false));
    }

    // Since the date picker only shows as a dialog on Android, we
    // only need to worry about hiding it on Android
    if (Platform.OS === 'android') {
      setDatePickerShowing(false);
    }
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
              // Disabled because this type is too complicated to write out...
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              onChange={onDatePickerChange}
              value={new Date(purchaseDate)}
              mode="date"
              display="spinner"
              style={{ flex: 1 }}
            />
          </View>
        </BottomSheet>
      </Portal>
    );
  };

  const renderPurchaseDatePicker = () => {
    if (Platform.OS === 'ios') {
      return renderDatePickerBottomSheet();
    }

    if (!isDatePickerShowing) {
      return null;
    }

    return (
      <DateTimePicker
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onChange={onDatePickerChange}
        value={new Date(purchaseDate)}
        maximumDate={new Date()}
        mode="date"
        display="default"
      />
    );
  };

  const handleSubmit = (item: Item) => {
    // eslint-disable-next-line no-console
    console.log(item);
  };

  return (
    <Formik initialValues={item} onSubmit={handleSubmit}>
      {({ handleChange, handleSubmit, values, setFieldValue }) => (
        <View style={{ flex: 1 }}>
          <BackTitleHeader title="Edit Item" onBackPress={confirmBackPress} />
          <KeyboardAvoidingView
            behavior="height"
            style={{ flex: 1 }}
            keyboardVerticalOffset={125}
          >
            <ScrollView style={styles.inputContainer} showsVerticalScrollIndicator={true}>
              <View>
                <LabeledInput
                  label="Name"
                  value={values.name}
                  style={styles.input}
                  onChangeText={handleChange('name')}
                  returnKeyType="done"
                />
                <LabeledInput
                  multiline
                  blurOnSubmit
                  onChangeText={handleChange('description')}
                  label="Description"
                  value={values.description || undefined}
                  style={styles.input}
                  inputStyle={styles.multilineInput}
                  returnKeyType="done"
                />
                <LabeledInput
                  label="Location"
                  onChangeText={handleChange('location')}
                  value={values.location}
                  style={styles.input}
                  returnKeyType="done"
                />
                <LabeledInput
                  label="Barcode"
                  value={values.barcode}
                  style={styles.input}
                  onChangeText={handleChange('barcode')}
                  returnKeyType="done"
                />
                <LabeledInput
                  label="Quantity"
                  value={values.quantity.toString() || undefined}
                  onChangeText={value => setFieldValue('quantity', value)}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  style={styles.input}
                />

                <TouchableWithoutFeedback
                  onPress={() => showStatusActionSheet(setFieldValue)}
                >
                  <LabeledInput
                    // TODO: Handle this
                    disabled
                    label="Status"
                    editable={false}
                    value={values.available ? 'Available' : 'Unavailable'}
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
                    value={purchaseDate}
                    style={styles.input}
                  />
                </TouchableWithoutFeedback>

                {renderPurchaseDatePicker()}

                <LabeledInput
                  label="Serial"
                  value={values.serial || undefined}
                  style={styles.input}
                  onChangeText={handleChange('serial')}
                />
                <LabeledInput
                  label="Type"
                  onChangeText={handleChange('type')}
                  value={values.type}
                  style={styles.input}
                />
                <LabeledInput
                  label="Vendor Name"
                  value={values.vendorName || undefined}
                  style={styles.input}
                  onChangeText={handleChange('vendorName')}
                />
                <LabeledInput
                  label="Vendor Price"
                  value={values.vendorPrice?.toString() || undefined}
                  onChangeText={value => setFieldValue('vendorPrice', value)}
                  style={styles.input}
                  keyboardType="numeric"
                  returnKeyType="done"
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
          <Button text="Save" style={styles.saveButton} onPress={handleSubmit} />
        </View>
      )}
    </Formik>
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
