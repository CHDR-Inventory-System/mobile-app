import React, { useState, useCallback, useEffect } from 'react';
import {
  Alert as RNAlert,
  KeyboardAvoidingView,
  StyleSheet,
  View,
  Platform,
  ScrollView,
  BackHandler
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
import { Formik, FormikHelpers, FormikProps } from 'formik';
import { Item } from '../types/API';
import * as yup from 'yup';
import Alert from '../components/Alert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageEditList from '../components/edit/ImageEditList';
import { Fonts } from '../global-styles';
import LoadingOverlay from '../components/Loading';

const itemSchema = yup.object({
  name: yup.string().trim().required('A name is required'),
  description: yup.string().trim().optional(),
  vendorName: yup.string().trim().optional(),
  barcode: yup.string().trim().required('This item must have a barcode'),
  location: yup.string().trim().required('Location is required'),
  type: yup.string().trim().required('Type is required'),
  serial: yup.string().trim().optional(),
  quantity: yup
    .number()
    .required('Quantity is required')
    .positive()
    .min(0, 'Quantity must by greater than 0')
    .integer('Quantity cannot contain decimals'),
  vendorPrice: yup
    .number()
    .notRequired()
    .typeError('Invalid vendor price')
    .nullable(true)
    // Because trying to parse an empty string to a number would result in an
    // error, we have to instead return null since the schema allows it
    .transform((value: string, originalValue: string) =>
      originalValue === '' ? null : value
    )
});

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
  const [isLoading, setLoading] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(
    item.purchaseDate ? formatDate(item.purchaseDate, false) : ''
  );
  const insets = useSafeAreaInsets();

  // Need to modify the backdrop so that it shows up if we only have one snap point
  // https://github.com/gorhom/react-native-bottom-sheet/issues/585#issuecomment-900619713
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop disappearsOnIndex={-1} appearsOnIndex={0} {...props} />
    ),
    []
  );

  const confirmBackPress = () => {
    RNAlert.alert(
      'Unsaved Changes',
      "Are you sure you want to go back? you'll lose any unsaved changes.",
      [
        {
          text: 'Go Back',
          style: 'destructive',
          onPress: () => navigation.goBack()
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const handleHardwareBackPress = () => {
    confirmBackPress();
    return true;
  };

  const showStatusActionSheet = (setFieldValue: FormikHelpers<Item>['setFieldValue']) => {
    const options = [
      {
        title: 'Available',
        value: true
      },
      {
        title: 'Unavailable',
        value: false
      },
      {
        title: 'Cancel',
        value: undefined
      }
    ];
    showActionSheetWithOptions(
      {
        options: options.map(({ title }) => title),
        cancelButtonIndex: 2,
        textStyle: {
          fontFamily: Fonts.text
        }
      },
      buttonIndex => {
        if (buttonIndex !== undefined && buttonIndex !== 2) {
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

  const onFormSubmit = (item: Item) => {
    // eslint-disable-next-line no-console
    console.log(itemSchema.cast(item));
    // navigation.goBack();
  };

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleHardwareBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleHardwareBackPress);
    };
  }, []);

  const renderForm = ({
    handleChange,
    values,
    setFieldValue,
    errors,
    handleSubmit
  }: FormikProps<Readonly<Item>>) => (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']} mode="margin">
      <LoadingOverlay loading={isLoading} />
      <BackTitleHeader
        title="Edit Item"
        onBackPress={confirmBackPress}
        style={styles.header}
      />
      <KeyboardAvoidingView
        behavior="height"
        style={{ flex: 1 }}
        keyboardVerticalOffset={125}
      >
        <ScrollView style={styles.inputContainer} showsVerticalScrollIndicator={false}>
          <Alert
            title="Required Fields"
            message="Fields marked with an asterisk are required."
            type="info"
            style={styles.requiredFieldsAlert}
          />
          <View>
            <LabeledInput
              required
              label="Name"
              value={values.name}
              style={styles.input}
              onChangeText={handleChange('name')}
              returnKeyType="done"
              errorMessage={errors.name}
            />
            <LabeledInput
              multiline
              onChangeText={handleChange('description')}
              label="Description"
              value={values.description || undefined}
              style={styles.input}
              inputStyle={styles.multilineInput}
            />
            <LabeledInput
              required
              label="Location"
              onChangeText={handleChange('location')}
              value={values.location}
              style={styles.input}
              returnKeyType="done"
              errorMessage={errors.location}
            />
            <LabeledInput
              required
              label="Barcode"
              value={values.barcode}
              style={styles.input}
              onChangeText={handleChange('barcode')}
              returnKeyType="done"
              errorMessage={errors.barcode}
            />
            <LabeledInput
              required
              label="Quantity"
              value={values.quantity.toString() || undefined}
              onChangeText={value => setFieldValue('quantity', value)}
              keyboardType="decimal-pad"
              returnKeyType="done"
              style={styles.input}
              errorMessage={errors.quantity}
            />

            <TouchableWithoutFeedback
              onPress={() => showStatusActionSheet(setFieldValue)}
            >
              <LabeledInput
                disabled
                required
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
                required
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
              required
              label="Type"
              onChangeText={handleChange('type')}
              value={values.type}
              style={styles.input}
              errorMessage={errors.type}
            />
            <LabeledInput
              label="Vendor Name"
              value={values.vendorName || undefined}
              style={styles.input}
              onChangeText={handleChange('vendorName')}
              returnKeyType="done"
            />
            <LabeledInput
              label="Vendor Price"
              value={values.vendorPrice?.toString() || undefined}
              onChangeText={value => setFieldValue('vendorPrice', value)}
              style={styles.input}
              keyboardType="numeric"
              returnKeyType="done"
              errorMessage={errors.vendorPrice}
            />
          </View>
          <ImageEditList onLoadStateChange={setLoading} />
        </ScrollView>
      </KeyboardAvoidingView>
      <Button
        text="Save"
        style={{
          ...styles.saveButton,
          marginBottom: insets.bottom === 0 ? 8 : Platform.select({ ios: 24, android: 8 })
        }}
        onPress={handleSubmit}
      />
    </SafeAreaView>
  );

  return (
    <Formik
      initialValues={item}
      onSubmit={values => onFormSubmit(values)}
      validationSchema={itemSchema}
      validateOnChange={false}
    >
      {props => renderForm(props)}
    </Formik>
  );
};

const styles = StyleSheet.create({
  header: {
    zIndex: 200,
    paddingTop: Platform.select({
      ios: 8,
      android: 32
    })
  },
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
    marginBottom: 8,
    marginTop: 16,
    marginHorizontal: 16
  },
  requiredFieldsAlert: {
    marginVertical: 12,
    padding: 16
  }
});

export default EditItemScreen;
