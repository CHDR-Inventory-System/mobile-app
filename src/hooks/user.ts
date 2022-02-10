import { useContext } from 'react';
import UserContext from '../contexts/UserContext';
import API from '../util/API';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/API';

type UseUserHook = {
  readonly state: Readonly<User>;
  /**
   * Makes a call to the API to log a user in. If successful, this also sets
   * the `user` field in {@link AsyncStorage} to the value of the current user.
   *
   * @throws {AxiosError} Will throw an error if login was unsuccessful
   */
  login: (nid: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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

  const login = async (nid: string, password: string): Promise<void> => {
    const user = await API.login(nid, password);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    dispatch({
      type: 'LOGIN',
      payload: user
    });
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
    } catch (err) {
      console.error('Error clearing storage during logout call', err);
    }

    dispatch({ type: 'LOG_OUT' });
  };

  return {
    state,
    login,
    logout
  };
};

export default useUser;
