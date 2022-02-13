import { useContext } from 'react';
import ReservationContext from '../contexts/ReservationContext';
import { Reservation, ReservationStatus } from '../types/API';
import mockReservations from '../../assets/mocks/reservations.json';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import API from '../util/API';

type ReservationHook = {
  readonly reservations: Reservation[];
  /**
   * This should only need to be called once when the reservation screen is
   * navigated to. This makes an API call to fetch all reservations form a
   * specific item and updates the state with those reservations. For convenience,
   * this method 4returns the response from {@link API.getReservations}
   */
  init: (itemId: number) => Promise<Reservation[]>;
  addReservation: (adminId: number, reservation: Reservation) => Promise<void>;
  updateStatus: (id: number, status: ReservationStatus) => Promise<void>;
  deleteReservation: (id: number) => Promise<void>;
  setReservations: (reservations: Reservation[]) => void;
};

const useReservations = (): ReservationHook => {
  const context = useContext(ReservationContext);

  if (!context) {
    throw new Error(
      `Invalid hook call for useReservations(). Hooks can only be called
      inside of the body of a function component.`
    );
  }

  const { state, dispatch } = context;

  const setReservations = (reservations: Reservation[]) => {
    dispatch({
      type: 'SET_RESERVATIONS',
      payload: reservations
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const init = async (itemId: number): Promise<Reservation[]> => {
    // TODO: Make API call here
    const reservations = mockReservations as Reservation[];
    setReservations(reservations);
    return reservations;
  };

  const addReservation = async (adminId: number, reservation: Reservation) => {
    // TODO: Make API call here
    dispatch({
      type: 'ADD_RESERVATION',
      payload: reservation
    });
  };

  const updateStatus = async (id: number, status: ReservationStatus) => {
    // TODO: Make API call here
    dispatch({
      type: 'UPDATE_RESERVATION_STATUS',
      payload: {
        id,
        status
      }
    });
  };

  const deleteReservation = async (id: number) => {
    // TODO: Make API call here
    dispatch({
      type: 'DELETE_RESERVATION',
      payload: id
    });
  };

  return {
    reservations: state,
    init,
    setReservations,
    addReservation,
    updateStatus,
    deleteReservation
  };
};

export default useReservations;
