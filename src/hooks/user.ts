import { useContext, useMemo } from 'react';
import UserContext from '../contexts/UserContext';
import API from '../util/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/API';

type UseUserHook = {
  readonly state: Readonly<User> & {
    readonly firstName: string;
    readonly lastName: string;
  };
  /**
   * Makes a call to the API to log a user in. If successful, this also sets
   * the `user` field in {@link AsyncStorage} to the value of the current user.
   *
   * @throws {AxiosError} Will throw an error if login was unsuccessful
   */
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
};

const useUser = (): UseUserHook => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      `Invalid hook call for useUser(). Hooks can only be called
      inside of the body of a function component.`
    );
  }

  const { state, dispatch } = context;
  const [firstName, ...lastName] = useMemo(
    () => (state.fullName ? state.fullName.split(' ') : []),
    [state.fullName]
  );

  const login = async (email: string, password: string): Promise<User> => {
    const user = await API.login(email, password);
    await AsyncStorage.multiSet(
      [
        ['user', JSON.stringify(user)],
        ['jwt', user.token]
      ],
      err => {
        if (err) {
          console.log('Error setting data after login', err);
        }
      }
    );

    dispatch({
      type: 'LOGIN',
      payload: user
    });

    return user;
  };

  const logout = async () => {
    try {
      await API.logout();
      await AsyncStorage.multiRemove(['user', 'jwt']);
    } catch (err) {
      console.error('Error logging out', err);
    }

    dispatch({ type: 'LOG_OUT' });
  };

  const resendVerificationEmail = async (email: string): Promise<void> => {
    await API.resendVerificationEmail(email);
  };

  return {
    state: {
      ...state,
      firstName: firstName || '',
      lastName: lastName.join(' ') || ''
    },
    login,
    logout,
    resendVerificationEmail
  };
};

export default useUser;
