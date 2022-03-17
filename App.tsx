import React, { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import MainScreen from './src/screens/MainScreen';
import Navbar from './src/components/Navbar';
import { PortalProvider } from '@gorhom/portal';
import { RootStackParamsList } from './src/types/navigation';
import BarcodeScanner from './src/screens/BarcodeScanner';
import { Colors } from './src/global-styles';
import ItemDetail from './src/screens/ItemDetail';
import { UserProvider } from './src/contexts/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from './src/types/API';
import EditItemScreen from './src/screens/EditItemScreen';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { InventoryProvider } from './src/contexts/InventoryContext';
import { StatusBar } from 'expo-status-bar';
import useLoader from './src/hooks/loading';
import ReservationScreen from './src/screens/ReservationScreen';
import CreateReservationScreen from './src/screens/CreateReservationScreen';
import { ReservationProvider } from './src/contexts/ReservationContext';
import AddItemScreen from './src/screens/AddItemScreen';
import jwtDecode from 'jwt-decode';
import { UserJWT } from './src/util/types';
import API from './src/util/API';

const Stack = createNativeStackNavigator<RootStackParamsList>();

type WithProvidersProps = {
  children: React.ReactNode;
  initialUserValue?: User;
};

const WithProviders = ({ children, initialUserValue }: WithProvidersProps) => (
  <SafeAreaProvider>
    <ActionSheetProvider>
      <InventoryProvider>
        <UserProvider initialValue={initialUserValue}>
          <ReservationProvider>
            <PortalProvider>{children}</PortalProvider>
          </ReservationProvider>
        </UserProvider>
      </InventoryProvider>
    </ActionSheetProvider>
  </SafeAreaProvider>
);

const App = (): JSX.Element => {
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamsList>('Login');
  const [initialUserValue, setInitialUserValue] = useState<User | undefined>(undefined);
  const loader = useLoader(true);
  const [fontsLoaded, fontLoadError] = useFonts({
    'Gotham-Book': require('./assets/fonts/Gotham-Book.ttf'),
    'Gotham-Medium': require('./assets/fonts/Gotham-Medium.ttf'),
    'Gotham-Bold': require('./assets/fonts/Gotham-Bold.ttf')
  });

  const loadUserFromStorage = async () => {
    // If the user was previously logged in, grab their credentials
    // from AsyncStorage, set the the user context object,
    // then take them to the main screen
    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = JSON.parse(user || '') as User;
      const jwt = jwtDecode<UserJWT>(parsedUser.token);
      const time = new Date();

      time.setMinutes(time.getMinutes() - 30);

      // Only log the user in if their stored JWT isn't within 30
      // minutes of its expiration time
      if (jwt.exp !== undefined && +time < jwt.exp * 1000) {
        setInitialUserValue(parsedUser);
        setInitialRoute('Main');
      }
    } catch (err) {
      console.log('User not found in storage', err);
    }

    loader.stopLoading();
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
      <Stack.Screen name="Main" component={MainScreen} />
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
          headerShown: false,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="EditItemScreen"
        component={EditItemScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReservationScreen"
        component={ReservationScreen}
        options={{
          headerShown: false,
          gestureEnabled: true
        }}
      />
      <Stack.Screen
        name="CreateReservationScreen"
        component={CreateReservationScreen}
        options={{
          headerShown: false,
          gestureEnabled: false
        }}
      />
      <Stack.Screen
        name="AddItem"
        component={AddItemScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );

  useEffect(() => {
    API.setupAxiosInterceptor();
    loadUserFromStorage();
  }, []);

  useEffect(() => {
    if (fontLoadError) {
      console.error('Error loading fonts', fontLoadError);
    }
  }, [fontLoadError]);

  if (!fontsLoaded || loader.isLoading) {
    return <AppLoading />;
  }

  return (
    <WithProviders initialUserValue={initialUserValue}>
      <NavigationContainer>
        <StatusBar style="dark" />
        {stack}
      </NavigationContainer>
    </WithProviders>
  );
};

export default App;
