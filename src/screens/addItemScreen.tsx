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
//import API from '../util/API';
//import { AxiosError } from 'axios';
//import { connectActionSheet } from '@expo/react-native-action-sheet';

type ItemInfo = {
  name: string;
  type: string;
  description: string;
  location: string;
  barcode: string;
  quantity: number;
  available: boolean;
  movable: boolean;
  serial: string;
};

type ErrorObject = {
  title: string;
  message: string;
  type: AlertProps['type'];
};

const AddItem = (): JSX.Element => {
  const [isAlertShowing, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorObject, setErrorObject] = useState<ErrorObject>({
    title: '',
    message: '',
    type: undefined
  });

  // login function called when login button is pressed
  const addItem = async (addItem: ItemInfo) => {
    Keyboard.dismiss();
    setIsLoading(true);
    // seee if either nid or password field is empty, if it is display error
    if (addItem.name === '' || addItem.type === '') {
      setErrorObject({
        title: 'Missing Field',
        message: 'Your NID and/or password are required Please fill and try again',
        type: 'error'
      });
      setShowAlert(true);
      setIsLoading(false);
      return;
    }
    // otherwise call loginApi and check if credentials match, if not display error as seen fit
    // API.login(credentials.nid, credentials.password)
    //   .then(() => new Error('Not Implemented'))
    //   .catch((err: AxiosError) => {
    //     if (err.response?.status === 404) {
    //       setErrorObject({
    //         title: 'Invalid Credentials',
    //         message: 'Make sure your NID and password are correct and try again.',
    //         type: 'error'
    //       });
    //       setShowAlert(true);
    //     } else {
    //       setErrorObject({
    //         title: 'Server Error',
    //         message: 'An unexpected error occurred, please try again.',
    //         type: 'error'
    //       });
    //       setShowAlert(true);
    //     }
    //   })
    //   .finally(() => setIsLoading(false));
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
                name: '',
                type: '',
                description: '',
                location: '',
                barcode: '',
                quantity: -1,
                available: false,
                movable: false,
                serial: ''
              }}
              onSubmit={addItem}
            >
              {({ handleChange, handleBlur, handleSubmit }) => (
                <View style={styles.formContentContainer}>
                  <View>
                    <View style={styles.header}>
                      <Text style={styles.title}>CHDR</Text>
                      <Text style={styles.subtitle}>Add Item</Text>
                    </View>
                    <View style={styles.inputContainer}>
                      <LabeledInput
                        autoCapitalize="none"
                        onBlur={handleBlur('name')}
                        label="*Title"
                        //keyboardType="default"
                        placeholder="*Name of item"
                        style={styles.input}
                        onChangeText={handleChange('name')}
                      />
                      <LabeledInput
                        onBlur={handleBlur('type')}
                        label="*Type"
                        placeholder="eg: Tech"
                        style={styles.input}
                        onChangeText={handleChange('type')}
                      />
                      <LabeledInput
                        onBlur={handleBlur('description')}
                        label="Description"
                        placeholder="Microsoft's mixed reality holo lens 2"
                        style={styles.input}
                        onChangeText={handleChange('description')}
                      />
                      <LabeledInput
                        onBlur={handleBlur('location')}
                        label="*Location"
                        placeholder="Cabinet 14A"
                        style={styles.input}
                        onChangeText={handleChange('location')}
                      />
                      <LabeledInput
                        onBlur={handleBlur('barcode')}
                        label="*Barcode ID"
                        placeholder="eg: CHDR 1234"
                        style={styles.input}
                        onChangeText={handleChange('barcode')}
                      />
                      <LabeledInput
                        onBlur={handleBlur('quantity')}
                        label="*Quantity"
                        placeholder="23"
                        style={styles.input}
                        onChangeText={handleChange('quntity')}
                      />
                      <LabeledInput
                        onBlur={handleBlur('available')}
                        label="*Status"
                        placeholder="Available"
                        style={styles.input}
                        onChangeText={handleChange('available')}
                      />
                      <LabeledInput
                        onBlur={handleBlur('movable')}
                        label="*Portable"
                        placeholder="Yes"
                        style={styles.input}
                        onChangeText={handleChange('movable')}
                      />
                      <LabeledInput
                        onBlur={handleBlur('serial')}
                        label="*Serial"
                        placeholder="12-3456-312-43"
                        style={styles.input}
                        onChangeText={handleChange('serial')}
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
                    text="Add Item"
                    onPress={handleSubmit}
                    style={styles.AddItemButton}
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
  AddItemButton: {
    marginBottom: 16
  }
});

export default AddItem;
