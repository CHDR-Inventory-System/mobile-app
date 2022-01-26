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
import Alert, { AlertProps } from '../components/Alert';
import loginAPI from '../util/loginAPI';
import { AxiosError } from 'axios';

type Credentials = {
  nid: string;
  password: string;
};

type ErrorObject = {
  title: string;
  message: string;
  type: AlertProps['type'];
};

const LoginScreen = (): JSX.Element => {
  const [isAlertShowing, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorObject, setErrorObject] = useState<ErrorObject>({
    title: '',
    message: '',
    type: undefined
  });

  // login function called when login button is pressed
  const login = async (credentials: Credentials) => {
    Keyboard.dismiss();
    setIsLoading(true);
    // seee if either nid or password field is empty, if it is display error
    if (credentials.nid == '' || credentials.password == '') {
      setErrorObject({
        title: 'Field Empty',
        message: 'One or both fields are empty .',
        type: 'error'
      });
      setShowAlert(true);
      setIsLoading(false);
    }
    // otherwise call loginApi and check if credentials match, if not display error as seen fit
    else {
      loginAPI
        .login(credentials.nid, credentials.password)
        .then(() => new Error('Not Implemented'))
        .catch((err: AxiosError) => {
          if (err.response?.status === 404) {
            setErrorObject({
              title: 'Invalid Credentials',
              message: 'Make sure your NID and password are correct and try again.',
              type: 'error'
            });
            setShowAlert(true);
          } else {
            setErrorObject({
              title: 'Server Error',
              message: 'An unexpected error occurred, please try again.',
              type: 'error'
            });
            setShowAlert(true);
          }
        })
        .finally(() => setIsLoading(false));
    }
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
                nid: '',
                password: ''
              }}
              onSubmit={login}
            >
              {({ handleChange, handleBlur, handleSubmit }) => (
                <View style={styles.formContentContainer}>
                  <View>
                    <View style={styles.header}>
                      <Text style={styles.title}>CHDR Inventory</Text>
                      <Text style={styles.subtitle}>Barcode Scanner</Text>
                    </View>
                    <View style={styles.inputContainer}>
                      <LabeledInput
                        autoCapitalize="none"
                        onBlur={handleBlur('nid')}
                        label="NID"
                        //keyboardType="default"
                        style={styles.input}
                        onChangeText={handleChange('nid')}
                      />
                      <LabeledInput
                        onBlur={handleBlur('password')}
                        label="Password"
                        secureTextEntry
                        style={styles.input}
                        onChangeText={handleChange('password')}
                      />
                      {isAlertShowing && (
                        <Alert
                          type={errorObject.type}
                          title={errorObject.title}
                          message={errorObject.message}
                          onClose={() => setShowAlert(false)}
                        />
                      )}
                    </View>
                  </View>
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
  formContentContainer: {
    flex: 1,
    justifyContent: 'space-between'
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
