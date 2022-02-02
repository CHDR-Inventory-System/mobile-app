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
import { useNavigation } from '@react-navigation/native';
import { NavigationProps } from '../types/navigation';
import API from '../util/API';
import { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useUser from '../hooks/user';

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

  const navigation = useNavigation<NavigationProps>();
  const { userDispatch } = useUser();

  // login function called when login button is pressed
  const login = async (credentials: Credentials) => {
    Keyboard.dismiss();
    setIsLoading(true);

    // see if either nid or password field is empty, if it is display error
    if (credentials.nid === '' || credentials.password === '') {
      setErrorObject({
        title: 'Missing Field',
        message: 'Your NID and/or password are required Please fill and try again',
        type: 'error'
      });
      setShowAlert(true);
      setIsLoading(false);
      return;
    }

    try {
      const user = await API.login(credentials.nid, credentials.password);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      userDispatch({
        type: 'INIT',
        payload: user
      });

      setIsLoading(false);
      navigation.navigate('Main');
    } catch (err) {
      if ((err as AxiosError).response?.status === 404) {
        setErrorObject({
          title: 'Invalid Credentials',
          message: 'Make sure your NID and password are correct and try again.',
          type: 'error'
        });
      } else {
        setErrorObject({
          title: 'Server Error',
          message: 'An unexpected error occurred, please try again.',
          type: 'error'
        });
      }

      setIsLoading(false);
      setShowAlert(true);
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
                        placeholder="UCF NID"
                        style={styles.input}
                        onChangeText={handleChange('nid')}
                      />
                      <LabeledInput
                        onBlur={handleBlur('password')}
                        label="Password"
                        secureTextEntry
                        placeholder="UCF Password"
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
