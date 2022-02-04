import { useContext } from 'react';
import UserContext, { UserContextType } from '../contexts/UserContext';
import API from '../util/API';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UseUserHook = UserContextType['state'] & {
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

  const login = async (nid: string, password: string): Promise<void> => {
    const user = await API.login(nid, password);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    context.dispatch({
      type: 'INIT',
      payload: user
    });
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error clearing storage during logout call', err);
    }

    context.dispatch({ type: 'LOG_OUT' });
  };

  return {
    ...context.state,
    login,
    logout
  };
};

export default useUser;
