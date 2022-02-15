import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

/**
 * A list of routes/screens and the props that each screen takes. Whenever
 * a new screen is created, it's props should be added here. This is to
 * help with creating the types needed for the
 * `createNativeStackNavigator` hook.
 */
export type RootStackParamsList = {
  Login: undefined;
  Main: undefined;
  BarcodeScanner: undefined;
  AddItem: undefined;
  EditItemScreen: {
    itemId: number;
  };
  ItemDetail: {
    itemId: number;
  };
};

/**
 * This type should be used with the `useNavigation` hook so TypeScript can determine
 * what parameters (if any) a route should take.
 *
 * @example
 * ```
 * const navigation = useNavigation<NavigationProps>();
 * ```
 */
export type NavigationProps = NativeStackNavigationProp<
  RootStackParamsList,
  keyof RootStackParamsList
>;

/**
 * This type should be used with the `useRoute` hook so TypeScript
 * can determine what properties a route has.
 *
 * @example
 * ```
 * const route = useRoute<RouteProps<'Main'>>();
 */
export type RouteProps<T extends keyof RootStackParamsList> = RouteProp<
  RootStackParamsList,
  T
>;
