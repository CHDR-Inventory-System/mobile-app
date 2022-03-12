import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';
import LabeledInput from '../components/LabeledInput';
import Button from '../components/Button';
import { Formik, FormikHandlers } from 'formik';
import { Colors, Fonts } from '../global-styles';
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';
import { AxiosError } from 'axios';
import useUser from '../hooks/user';
import * as yup from 'yup';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import useLoader from '../hooks/loading';

type Credentials = {
  email: string;
  password: string;
};

const credentialSchema = yup.object({
  email: yup.string().email().required('Your email is required'),
  password: yup.string().required('Your password is required')
});

const validRoles = ['super', 'admin'];

const LoginScreen = (): JSX.Element => {
  const loader = useLoader();

  const navigation = useNavigation<NavigationProps>();
  const user = useUser();

  const login = async (credentials: Credentials) => {
    Keyboard.dismiss();
    loader.startLoading();

    try {
      const response = await user.login(credentials.email, credentials.password);
      loader.stopLoading();

      if (!validRoles.includes(response.role.toLowerCase())) {
        Alert.alert('Insufficient Permissions', "You don't have permission to login.");
      } else if (!response.verified) {
        Alert.alert(
          'Verify Your Account',
          "Looks like you haven't verified your account yet. " +
            'Check your email for a link to verify your account'
        );
      } else {
        navigation.replace('Main');
      }
    } catch (err) {
      if ((err as AxiosError).response?.status === 401) {
        Alert.alert(
          'Invalid Credentials',
          'Make sure your email and password are correct and try again.'
        );
      } else {
        Alert.alert(
          'Error Logging In',
          'An unexpected error occurred, please try again later.'
        );
      }

      loader.stopLoading();
    }
  };

  // Formik won't call handleSubmit if there are errors in the form, however,
  // if there are error, we want vibrate the device with haptic feedback
  const formSubmitHandler = (
    values: Credentials,
    handleSubmit: FormikHandlers['handleSubmit']
  ) => {
    if (!credentialSchema.isValidSync(values)) {
      Haptics.notificationAsync(
        Platform.select({
          ios: Haptics.NotificationFeedbackType.Error,
          android: Haptics.NotificationFeedbackType.Warning
        })
      );
    }

    handleSubmit();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <Formik
              validateOnChange={false}
              validationSchema={credentialSchema}
              initialValues={{
                email: '',
                password: ''
              }}
              onSubmit={login}
            >
              {({ handleChange, handleSubmit, errors, values }) => (
                <View style={styles.formContentContainer}>
                  <View>
                    <View style={styles.header}>
                      <Text style={styles.title}>CHDR Inventory</Text>
                      <Text style={styles.subtitle}>Barcode Scanner</Text>
                    </View>
                    <View style={styles.inputContainer}>
                      <LabeledInput
                        autoCapitalize="none"
                        label="Email"
                        keyboardType="email-address"
                        style={styles.input}
                        onChangeText={handleChange('email')}
                        errorMessage={errors.email}
                      />
                      <LabeledInput
                        label="Password"
                        secureTextEntry
                        style={styles.input}
                        onChangeText={handleChange('password')}
                        errorMessage={errors.password}
                      />
                    </View>
                  </View>
                  <Button
                    text="Login"
                    onPress={() => formSubmitHandler(values, handleSubmit)}
                    style={styles.loginButton}
                    disabled={loader.isLoading}
                  />
                </View>
              )}
            </Formik>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 24,
    marginRight: 24
  },
  formContentContainer: {
    flex: 1,
    justifyContent: 'space-between'
  },
  header: {
    paddingTop: Platform.select({
      android: 48,
      ios: 36
    }),
    paddingBottom: 24
  },
  title: {
    fontSize: 40,
    fontFamily: Fonts.heading,
    color: Colors.text
  },
  subtitle: {
    marginTop: 16,
    fontSize: Fonts.defaultTextSize,
    fontFamily: Fonts.subtitle,
    color: Colors.textMuted
  },
  inputContainer: {
    marginTop: 32
  },
  input: {
    marginBottom: 24
  },
  loginButton: {
    marginBottom: 16
  }
});

export default LoginScreen;
