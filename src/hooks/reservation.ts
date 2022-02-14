import { useContext } from 'react';
import ReservationContext from '../contexts/ReservationContext';
import { CreateReservationOpts, Reservation, ReservationStatus } from '../types/API';
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
  createReservation: (opts: CreateReservationOpts) => Promise<Reservation>;
  updateStatus: (
    reservationId: number,
    adminId: number,
    status: ReservationStatus
  ) => Promise<void>;
  deleteReservation: (reservationId: number) => Promise<void>;
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

  const init = async (itemId: number): Promise<Reservation[]> => {
    const reservations = await API.getReservationsForItem(itemId);
    setReservations(reservations);
    return reservations;
  };

  const createReservation = async (opts: CreateReservationOpts): Promise<Reservation> => {
    const reservation = await API.createReservation(opts);

    dispatch({
      type: 'ADD_RESERVATION',
      payload: reservation
    });

    return reservation;
  };

  const updateStatus = async (
    reservationId: number,
    adminId: number,
    status: ReservationStatus
  ) => {
    await API.updateReservationStatus(reservationId, adminId, status);
    dispatch({
      type: 'UPDATE_RESERVATION_STATUS',
      payload: {
        id: reservationId,
        status
      }
    });
  };

  const deleteReservation = async (reservationId: number) => {
    await API.deleteReservation(reservationId);
    dispatch({
      type: 'DELETE_RESERVATION',
      payload: reservationId
    });
  };

  return {
    reservations: state,
    init,
    setReservations,
    createReservation,
    updateStatus,
    deleteReservation
  };
};

export default useReservations;
