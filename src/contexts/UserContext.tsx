import React from 'react';
import { createContext, useReducer } from 'react';
import userReducer, { UserAction } from '../reducers/user';
import { User } from '../types/API';

export type UserContextType = {
  user: User;
  userDispatch: React.Dispatch<UserAction>;
};

type UserProviderProps = {
  children: React.ReactNode;
  initialValue: User | null;
};

const UserContext = createContext<UserContextType | null>(null);

const UserProvider = ({ children, initialValue }: UserProviderProps): JSX.Element => {
  const [user, userDispatch] = useReducer(userReducer, initialValue || ({} as User));

  return (
    <UserContext.Provider
      value={{
        user,
        userDispatch
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext as default, UserProvider };
