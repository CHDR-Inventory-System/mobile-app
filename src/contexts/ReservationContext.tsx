import React from 'react';
import { createContext, useReducer } from 'react';
import reservationReducer, { ReservationAction } from '../reducers/reservation';
import { Reservation } from '../types/API';

export type ReservationContextType = {
  state: Reservation[];
  dispatch: React.Dispatch<ReservationAction>;
};

type ReservationProviderProps = {
  children: React.ReactNode;
};

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

const ReservationProvider = ({ children }: ReservationProviderProps): JSX.Element => {
  const [state, dispatch] = useReducer(reservationReducer, []);

  return (
    <ReservationContext.Provider value={{ state, dispatch }}>
      {children}
    </ReservationContext.Provider>
  );
};

export { ReservationContext as default, ReservationProvider };
