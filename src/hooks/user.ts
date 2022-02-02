import { useContext } from 'react';
import UserContext, { UserContextType } from '../contexts/UserContext';

const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      `Invalid hook call. Hooks can only be called
      inside of the body of a function component.`
    );
  }

  return context;
};

export default useUser;
