import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import LabeledInput from '../components/LabeledInput';
import Button from '../components/Button';
import { Formik } from 'formik';
import { Colors, Fonts } from '../global-styles';
import { platformValue } from '../util/platform';
import Alert from '../components/Alert';

type Credentials = {
  email: string;
  password: string;
};

type ErrorObject = {
  title: string;
  message: string;
};

const Spacer = () => <View style={{ flex: 1 }} />;

const LoginScreen = (): JSX.Element => {
  const [isAlertShowing, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorObject, setErrorObject] = useState<ErrorObject>({
    title: '',
    message: ''
  });

  // TODO: Implement login once the API is available
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = async (credentials: Credentials) => {
    Keyboard.dismiss();

    // TODO: Dummy code below to simulate loading and errors.
    // This should be removed when login is actually implemented
    setIsLoading(true);
    setShowAlert(false);

    setTimeout(() => {
      setErrorObject({
        title: 'Invalid credentials',
        message: 'Make sure your email and password are both correct and try again.'
      });
      setShowAlert(true);
      setIsLoading(false);
    }, 3000);
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
              initialValues={{
                email: '',
                password: ''
              }}
              onSubmit={login}
            >
              {({ handleChange, handleBlur, handleSubmit }) => (
                <View style={{ flex: 1 }}>
                  <View style={styles.header}>
                    <Text style={styles.title}>CHDR Inventory</Text>
                    <Text style={styles.subtitle}>Barcode Scanner</Text>
                  </View>
                  <View style={styles.inputContainer}>
                    <LabeledInput
                      autoCapitalize="none"
                      onBlur={handleBlur('email')}
                      label="Email"
                      keyboardType="email-address"
                      style={styles.input}
                      onChangeText={handleChange('email')}
                    />
                    <LabeledInput
                      onBlur={handleBlur('password')}
                      label="Password"
                      secureTextEntry
                      style={styles.input}
                      onChangeText={handleChange('password')}
                    />
                  </View>
                  {isAlertShowing && (
                    <Alert
                      title={errorObject.title}
                      message={errorObject.message}
                      onClose={() => setShowAlert(false)}
                    />
                  )}
                  <Spacer />
                  <Button
                    text="Login"
                    onPress={handleSubmit}
                    style={styles.loginButton}
                    disabled={isLoading}
                  />
                </View>
              )}
            </Formik>
          </View>
        </TouchableWithoutFeedback>
        <StatusBar style="auto" />
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
  header: {
    paddingTop: platformValue(64, 42),
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
