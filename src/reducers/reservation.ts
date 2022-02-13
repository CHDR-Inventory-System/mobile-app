import { Reservation, ReservationStatus } from '../types/API';

export type ReservationAction =
  | {
      type: 'ADD_RESERVATION';
      payload: Reservation;
    }
  | {
      type: 'UPDATE_RESERVATION_STATUS';
      payload: {
        id: number;
        status: ReservationStatus;
      };
    }
  | {
      type: 'DELETE_RESERVATION';
      payload: number;
    }
  | {
      type: 'SET_RESERVATIONS';
      payload: Reservation[];
    };

const reservationReducer = (
  state: Reservation[],
  action: ReservationAction
): Reservation[] => {
  switch (action.type) {
    case 'SET_RESERVATIONS':
      return action.payload;
    case 'ADD_RESERVATION':
      return state.concat(action.payload);
    case 'DELETE_RESERVATION':
      return state.filter(({ ID }) => action.payload !== ID);
    case 'UPDATE_RESERVATION_STATUS':
      return state.filter(reservation => {
        if (action.payload.id === reservation.ID) {
          reservation.status = action.payload.status;
        }
        return reservation;
      });
    default:
      throw new Error(`Invalid action ${action}`);
  }
};

export default reservationReducer;
