import React from 'react';
import { createContext, useReducer } from 'react';
import userReducer, { UserAction } from '../reducers/user';
import { User } from '../types/API';

export type UserContextType = {
  state: User;
  dispatch: React.Dispatch<UserAction>;
};

type UserProviderProps = {
  children: React.ReactNode;
  initialValue: User | undefined;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider = ({ children, initialValue }: UserProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(userReducer, initialValue || ({} as User));

  return (
    <UserContext.Provider value={{ state, dispatch }}>{children}</UserContext.Provider>
  );
};

export { UserContext as default, UserProvider };
