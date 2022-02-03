import React, { useState, useEffect } from 'react';
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
import Button from '../components/Button';
import { Formik, FormikProps } from 'formik';
import { Item } from '../types/API';
import * as yup from 'yup';
import Alert from '../components/Alert';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import ImageEditList from '../components/edit/ImageEditList';
import LoadingOverlay from '../components/Loading';
import Select from '../components/Select';
import DatePickerInput from '../components/DatePickerInput';

const itemSchema = yup.object({
  name: yup.string().trim().required('A name is required'),
  description: yup.string().trim().optional().nullable(true),
  vendorName: yup.string().trim().optional().nullable(true),
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
  const [isLoading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

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

  const onFormSubmit = async (item: Item) => {
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
            <Select
              required
              label="Availability"
              style={styles.input}
              defaultIndex={values.available ? 0 : 1}
              options={[
                {
                  title: 'Available',
                  value: true,
                  disabled: true,
                  onSelect: () => setFieldValue('available', true)
                },
                {
                  title: 'Unavailable',
                  value: false,
                  onSelect: () => setFieldValue('available', false)
                }
              ]}
            />
            <DatePickerInput
              required
              mode="date"
              onChange={date => setFieldValue('purchaseDate', date)}
              value={item.purchaseDate ? new Date(item.purchaseDate) : null}
              label="Purchase Date"
              style={styles.input}
            />
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
        onPress={handleSubmit}
        style={{
          ...styles.saveButton,
          marginBottom: insets.bottom === 0 ? 8 : Platform.select({ ios: 24, android: 8 })
        }}
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
