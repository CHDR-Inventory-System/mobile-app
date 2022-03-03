// All Imports used to make this page
import React, { useEffect } from 'react';
import {
  Alert as RNAlert,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  BackHandler
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LabeledInput from '../components/LabeledInput';
import Button from '../components/Button';
import { Formik, FormikHandlers, FormikProps } from 'formik';
import DatePickerInput from '../components/DatePickerInput';
import BackTitleHeader from '../components/BackTitleHeader';
import { NavigationProps, RouteProps } from '../types/navigation';
import * as Haptics from 'expo-haptics';
import * as yup from 'yup';
import { Item } from '../types/API';
import LoadingOverlay from '../components/Loading';
import useLoader from '../hooks/loading';
import useInventory from '../hooks/inventory';
import Select from '../components/Select';
import Alert from '../components/Alert';
import { AtLeast } from '../util/types';

// Item fields
const itemSchema = yup.object({
  name: yup.string().trim().required('A name is required'),
  description: yup.string().trim().optional().nullable(true),
  vendorName: yup.string().trim().optional().nullable(true),
  barcode: yup.string().trim().required('This item must have a barcode'),
  location: yup.string().trim().required('Location is required'),
  type: yup.string().trim().required('Type is required'),
  serial: yup.string().trim().optional().nullable(true),
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

const AddItemScreen = (): JSX.Element | null => {
  const loader = useLoader();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProps>();
  const inventory = useInventory();
  const { params } = useRoute<RouteProps<'AddItem'>>();
  const title = params.barcode ? 'Add Item' : 'Add Child Item';

  // If parameter item that is passed in is not null it means that you're
  // adding a child item, otherwise it's a Parent Item
  const initialValues: Partial<Item> = params.barcode
    ? {
        barcode: params.barcode,
        main: true
      }
    : {
        location: params.item?.location,
        barcode: params.item?.barcode,
        quantity: params.item?.quantity,
        available: params.item?.available,
        moveable: params.item?.moveable,
        main: false
      };

  // back press button
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

  // hardBackPress function
  const handleHardwareBackPress = () => {
    confirmBackPress();
    return true;
  };

  // form submit and API call
  const onFormSubmit = async (item: Partial<Item>) => {
    if (!params.item) {
      throw new Error(
        'Cannot add undefined item, did you pass an item prop to this screen?'
      );
    }

    loader.startLoading();

    try {
      const parsedItem = await itemSchema.validate(item, { abortEarly: false });

      // if item's main is true, this means that we are trying to add a parent Item
      if (item.main) {
        await inventory.addItem(parsedItem);
      } else {
        // otherwise it's a child Item that we will add to the Parent item that already exists
        await inventory.addChildItem(
          params.item.ID,
          params.item.item,
          parsedItem as AtLeast<Item, 'name' | 'type'>
        );
      }
    } catch (err) {
      loader.stopLoading();
      RNAlert.alert('Server Error', 'An unexpected error occurred, please try again.', [
        {
          text: 'Retry',
          onPress: () => onFormSubmit(item)
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]);
      return;
    }

    loader.stopLoading();
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => navigation.goBack(), 300);
  };
  // function to handle form submittion using formik
  const formSubmitHandler = (
    values: Partial<Item>,
    handleSubmit: FormikHandlers['handleSubmit']
  ) => {
    if (!itemSchema.isValidSync(values, { abortEarly: false })) {
      Haptics.notificationAsync(
        Platform.select({
          ios: Haptics.NotificationFeedbackType.Error,
          android: Haptics.NotificationFeedbackType.Warning
        })
      );
    }

    handleSubmit();
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
    handleSubmit,
    dirty
  }: FormikProps<Readonly<Partial<Item>>>) => (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']} mode="margin">
      <LoadingOverlay loading={loader.isLoading} text="Saving" />
      {/* back press button UI */}
      <BackTitleHeader
        title={title}
        onBackPress={dirty ? confirmBackPress : navigation.goBack}
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
          {/* Item fields admins have to type in to add an item  */}
          <View>
            <LabeledInput
              required
              autoCapitalize="none"
              label="Name"
              placeholder="Name of item"
              value={values.name}
              errorMessage={errors.name}
              style={styles.input}
              onChangeText={handleChange('name')}
              returnKeyType="done"
            />
            <LabeledInput
              label="Description"
              placeholder="Microsoft's mixed reality holo lens 2"
              style={styles.input}
              value={values.description || undefined}
              errorMessage={errors.description}
              onChangeText={handleChange('description')}
              returnKeyType="done"
            />
            <LabeledInput
              required
              label="Location"
              placeholder="Cabinet 14A"
              style={styles.input}
              value={values.location}
              errorMessage={errors.location}
              returnKeyType="done"
              onChangeText={handleChange('location')}
              disabled={!initialValues.main}
              help={
                !initialValues.main
                  ? 'This value can only be updated through the parent item.'
                  : ''
              }
            />
            <LabeledInput
              required
              label="Barcode"
              placeholder="eg: CHDR1234"
              style={styles.input}
              value={values.barcode}
              errorMessage={errors.barcode}
              returnKeyType="done"
              onChangeText={handleChange('barcode')}
              disabled={!initialValues.main}
              help={
                !initialValues.main
                  ? 'This value can only be updated through the parent item.'
                  : ''
              }
            />
            <LabeledInput
              required
              label="Quantity"
              value={values.quantity?.toString() || undefined}
              onChangeText={value => setFieldValue('quantity', value)}
              keyboardType="decimal-pad"
              returnKeyType="done"
              style={styles.input}
              errorMessage={errors.quantity}
              disabled={!initialValues.main}
              help={
                !initialValues.main
                  ? 'This value can only be updated through the parent item.'
                  : ''
              }
            />
            <Select
              required
              label="Availability"
              sheetTitle="If an item is unavailable, users will not be able to reserve or checkout the item."
              style={styles.input}
              defaultValueIndex={values.available ? 0 : 1}
              disabled={!initialValues.main}
              inputProps={{
                disabled: !initialValues.main,
                help: !initialValues.main
                  ? 'This value can only be updated through the parent item.'
                  : ''
              }}
              options={[
                {
                  title: 'Available',
                  value: true,
                  onSelect: () => setFieldValue('available', true)
                },
                {
                  title: 'Unavailable',
                  value: false,
                  onSelect: () => setFieldValue('available', false)
                }
              ]}
            />
            <Select
              required
              label="Movable"
              style={styles.input}
              defaultValueIndex={values.moveable ? 0 : 1}
              sheetTitle="Can this item be moved? If it's stationary, this should usually be set to 'No'"
              disabled={!initialValues.main}
              inputProps={{
                disabled: !initialValues.main,
                help: !initialValues.main
                  ? 'This value can only be updated through the parent item.'
                  : ''
              }}
              options={[
                {
                  title: 'Yes',
                  value: true,
                  onSelect: () => setFieldValue('moveable', true)
                },
                {
                  title: 'No',
                  value: false,
                  onSelect: () => setFieldValue('moveable', false)
                }
              ]}
            />
            <DatePickerInput
              mode="date"
              onChange={date => setFieldValue('purchaseDate', date)}
              value={values.purchaseDate ? new Date(values.purchaseDate) : null}
              label="Purchase Date"
              style={styles.input}
            />
            <LabeledInput
              label="Serial"
              placeholder="12-3456-312-43"
              style={styles.input}
              onChangeText={handleChange('serial')}
            />
            <LabeledInput
              required
              label="Type"
              placeholder="eg: Tech"
              style={styles.input}
              value={values.type}
              errorMessage={errors.type}
              onChangeText={handleChange('type')}
              returnKeyType="done"
            />
            <LabeledInput
              label="Vendor Name"
              placeholder="HP"
              style={styles.input}
              value={values.vendorName || undefined}
              errorMessage={errors.vendorName}
              returnKeyType="done"
              onChangeText={handleChange('vendorName')}
            />
            <LabeledInput
              label="Purchase Price"
              placeholder="$50"
              style={styles.input}
              value={values.vendorPrice?.toString() || undefined}
              onChangeText={value => setFieldValue('vendorPrice', value)}
              errorMessage={errors.vendorPrice}
              keyboardType="decimal-pad"
              returnKeyType="done"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Button
        text="Add Item"
        onPress={() => formSubmitHandler(values, handleSubmit)}
        style={{
          ...styles.addItemButton,
          marginBottom: insets.bottom === 0 ? 8 : Platform.select({ ios: 24, android: 8 })
        }}
      />
    </SafeAreaView>
  );

  // Formik props that calls functions to check fields are filled
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={values => onFormSubmit(values)}
      validationSchema={itemSchema}
      validateOnChange={false}
    >
      {props => renderForm(props)}
    </Formik>
  );
};

// style sheets used for CSS
const styles = StyleSheet.create({
  header: {
    zIndex: 200,
    paddingTop: Platform.select({
      ios: 8,
      android: 16
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
  addItemButton: {
    marginBottom: 8,
    marginTop: 16,
    marginHorizontal: 16
  },
  requiredFieldsAlert: {
    marginVertical: 12,
    padding: 16
  }
});

export default AddItemScreen;
