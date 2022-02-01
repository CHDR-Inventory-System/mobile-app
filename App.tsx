import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';
import Navbar from './src/components/Navbar';
import { Portal, PortalProvider } from '@gorhom/portal';
import { RootStackParamsList } from './src/types/navigation';
import BarcodeScanner from './src/screens/BarcodeScanner';
import { Colors } from './src/global-styles';
import ItemDetail from './src/screens/ItemDetail';
import { UserProvider } from './src/contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from './src/types/API';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator<RootStackParamsList>();

const App = (): JSX.Element => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamsList>('Main');
  const [isLoading, setLoading] = useState(true);
  const [initialUserValue, setInitialUserValue] = useState<User | null>(null);
  const [fontsLoaded] = useFonts({
    'Gotham-Book': require('./assets/fonts/Gotham-Book.ttf'),
    'Gotham-Medium': require('./assets/fonts/Gotham-Medium.ttf'),
    'Gotham-Bold': require('./assets/fonts/Gotham-Bold.ttf')
  });

  const loadUser = () => {
    AsyncStorage.getItem('user')
      .then(user => JSON.parse(user || '') as User)
      .then(user => {
        setInitialUserValue(user);
        setInitialRoute('Main');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const stack = (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        gestureEnabled: false,
        contentStyle: {
          backgroundColor: Colors.appBackgroundColor
        },
        header: () => <Navbar />
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: true }} />
      <Stack.Screen
        name="BarcodeScanner"
        component={BarcodeScanner}
        options={{
          headerShown: false,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="ItemDetail"
        component={ItemDetail}
        options={{
          headerShown: true,
          gestureEnabled: true
        }}
      />
    </Stack.Navigator>
  );

  useEffect(() => {
    loadUser();
  }, []);

  if (!fontsLoaded || isLoading) {
    return <AppLoading />;
  }

  return (
    <PortalProvider>
      <Portal>
        <UserProvider initialValue={initialUserValue}>
          <StatusBar style="dark" />
          <NavigationContainer>{stack}</NavigationContainer>
        </UserProvider>
      </Portal>
    </PortalProvider>
  );
};

export default App;
