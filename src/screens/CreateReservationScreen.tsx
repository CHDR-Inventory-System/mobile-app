import React, { useEffect, useState } from 'react';
import { Formik, FormikHandlers, FormikHelpers } from 'formik';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Platform,
  StyleSheet,
  Alert as RNAlert,
  BackHandler,
  ScrollView
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Alert from '../components/Alert';
import BackTitleHeader from '../components/BackTitleHeader';
import Button from '../components/Button';
import DatePickerInput from '../components/DatePickerInput';
import LabeledInput from '../components/LabeledInput';
import { NavigationProps, RouteProps } from '../types/navigation';
import * as Haptics from 'expo-haptics';
import LoadingOverlay from '../components/Loading';
import useLoader from '../hooks/loading';
import { StatusBar } from 'expo-status-bar';
import Select from '../components/Select';
import { ReservationStatus } from '../types/API';
import useReservations from '../hooks/reservation';
import useUser from '../hooks/user';
import { AxiosError } from 'axios';

type FormValues = {
  email: string;
  checkoutDate: string;
  returnDate: string;
  status: ReservationStatus;
};

const statuses: ReservationStatus[] = [
  'Approved',
  'Checked Out',
  'Denied',
  'Late',
  'Missed',
  'Pending',
  'Returned'
];

const now = new Date();
const handleHardwareBackPress = () => true;

const CreateReservationScreen = (): JSX.Element => {
  const {
    params: { item }
  } = useRoute<RouteProps<'ReservationScreen'>>();

  const navigation = useNavigation<NavigationProps>();
  const insets = useSafeAreaInsets();
  const loader = useLoader();
  const user = useUser();
  const reservation = useReservations();
  const [initialValues] = useState<FormValues>({
    email: '',
    checkoutDate: now.toString(),
    returnDate: now.toString(),
    status: 'Pending'
  });

  // Formik won't call handleSubmit if there are errors in the form, however,
  // if there are error, we want vibrate the device with haptic feedback
  const formSubmitHandler = (
    values: FormValues,
    handleSubmit: FormikHandlers['handleSubmit'],
    setErrors: FormikHelpers<FormValues>['setErrors'],
    setFieldError: FormikHelpers<FormValues>['setFieldError']
  ) => {
    const checkoutDate = +new Date(values.checkoutDate);
    const returnDate = +new Date(values.returnDate);
    let hasError = false;

    setErrors({});

    if (!values.email.trim()) {
      hasError = true;
      setFieldError('email', 'An email is required');
    }

    if (returnDate <= checkoutDate) {
      setFieldError('returnDate', 'Return date must be after checkout date');
      setFieldError('checkoutDate', 'Checkout date must be before return date');
      hasError = true;
    }

    if (hasError) {
      Haptics.notificationAsync(
        Platform.select({
          ios: Haptics.NotificationFeedbackType.Error,
          android: Haptics.NotificationFeedbackType.Warning
        })
      );
    } else {
      handleSubmit();
    }
  };

  const onFormSubmit = async (values: FormValues) => {
    loader.startLoading();

    try {
      await reservation.createReservation({
        email: values.email,
        checkoutDate: values.checkoutDate,
        returnDate: values.returnDate,
        status: values.status,
        adminId: user.state.ID,
        item: item.item
      });
    } catch (err) {
      const statusCode = (err as AxiosError).response?.status;
      let errorTitle: string;
      let errorMessage: string;

      switch (statusCode) {
        case 404:
          errorTitle = 'Invalid Email';
          errorMessage = "Couldn't find a user with this email.";
          break;
        default:
          errorTitle = 'Unexpected Error';
          errorMessage = 'An unexpected error occurred, please try again.';
          break;
      }

      loader.stopLoading();
      RNAlert.alert(errorTitle, errorMessage, [
        {
          text: 'Retry',
          onPress: () => onFormSubmit(values)
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

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleHardwareBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleHardwareBackPress);
    };
  }, []);

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={values => onFormSubmit(values)}
      validateOnChange={false}
      enableReinitialize
    >
      {({
        values,
        handleSubmit,
        errors,
        handleChange,
        setFieldValue,
        setFieldError,
        setErrors,
        dirty
      }) => (
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']} mode="margin">
          <StatusBar style="dark" />
          <BackTitleHeader
            title="New Reservation"
            style={styles.header}
            onBackPress={dirty ? confirmBackPress : navigation.goBack}
          />
          <LoadingOverlay loading={loader.isLoading} />
          <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
            <Alert
              style={styles.infoAlert}
              type="info"
              message={`This will create a reservation for the item: ${item.name}`}
            />
            <LabeledInput
              label="Email"
              required
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              onChangeText={handleChange('email')}
              errorMessage={errors.email}
              help="This is the email address of the user who want to reserve this item."
            />
            <DatePickerInput
              mode="datetime"
              required
              display={Platform.select({
                ios: 'inline',
                android: 'default'
              })}
              label="Checkout Date"
              value={new Date(values.checkoutDate)}
              style={styles.input}
              onChange={date => setFieldValue('checkoutDate', date)}
              minimumDate={now}
              inputProps={{ errorMessage: errors.checkoutDate }}
            />
            <DatePickerInput
              mode="datetime"
              required
              display={Platform.select({
                ios: 'inline',
                android: 'default'
              })}
              label="Return Date"
              value={new Date(values.returnDate)}
              style={styles.input}
              onChange={date => setFieldValue('returnDate', date)}
              minimumDate={now}
              inputProps={{ errorMessage: errors.returnDate }}
            />
            <Select
              label="Reservation Status"
              defaultValueIndex={5} // The index of 'Pending'
              style={styles.input}
              options={statuses.map(status => ({
                title: status,
                value: status,
                onSelect: value => setFieldValue('status', value)
              }))}
            />
          </ScrollView>
          <Button
            text="Create Reservation"
            onPress={() =>
              formSubmitHandler(values, handleSubmit, setErrors, setFieldError)
            }
            style={{
              ...styles.createButton,
              marginBottom:
                insets.bottom === 0 ? 8 : Platform.select({ ios: 24, android: 8 })
            }}
          />
        </SafeAreaView>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    flex: 1
  },
  header: {
    zIndex: 11,
    paddingTop: Platform.select({
      ios: 12,
      android: 16
    })
  },
  input: {
    marginVertical: 14
  },
  createButton: {
    marginBottom: 8,
    marginTop: 16,
    marginHorizontal: 16
  },
  infoAlert: {
    paddingVertical: 16,
    marginVertical: 16
  }
});

export default CreateReservationScreen;
