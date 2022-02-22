import axios from 'axios';
import {
  CreateReservationOpts,
  ImageUploadParams,
  Item,
  ItemImage,
  Reservation,
  ReservationStatus,
  User
} from '../types/API';
import { DEBUG_API_URL, PROD_API_URL } from '@env';
import { AtLeast } from './types';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.baseURL = __DEV__ ? DEBUG_API_URL : PROD_API_URL;

class API {
  static async login(email: string, password: string): Promise<User> {
    const response = await axios.post('/users/login', {
      email,
      password
    });

    return response.data;
  }

  static async deleteItem(id: number): Promise<void> {
    const response = await axios.delete(`/inventory/${id}`);
    return response.data;
  }

  static async getAllItems(): Promise<Item[]> {
    const response = await axios.get('/inventory/');
    return response.data;
  }

  static async updateItem(item: AtLeast<Item, 'ID'>): Promise<void> {
    const response = await axios.put(`/inventory/${item.ID}`, {
      ...item
    });
    return response.data;
  }

  static async uploadImage({
    itemId,
    base64ImageData,
    name
  }: ImageUploadParams): Promise<ItemImage> {
    const response = await axios.post(`/inventory/${itemId}/uploadImage`, {
      image: base64ImageData,
      filename: name
    });

    return response.data;
  }

  static async deleteImage(imageId: number): Promise<void> {
    const response = await axios.delete(`/inventory/image/${imageId}`);
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async addItem(item: Partial<Item>): Promise<Item> {
    throw new Error('Not implemented');
  }

  static async addChildItem(
    itemId: number,
    item: AtLeast<Item, 'name' | 'type'>
  ): Promise<Item> {
    const response = await axios.post(`/inventory/${itemId}/addChild`, {
      ...item
    });
    return response.data;
  }

  static async getReservationsForItem(itemId: number): Promise<Reservation[]> {
    const response = await axios.get(`/reservations/item/${itemId}`);
    return response.data;
  }

  static async updateReservationStatus(
    reservationId: number,
    adminId: number,
    status: ReservationStatus
  ): Promise<void> {
    const response = await axios.patch(`/reservations/${reservationId}/status`, {
      status,
      adminId
    });
    return response.data;
  }

  static async createReservation({
    email,
    item,
    checkoutDate,
    returnDate,
    status,
    adminId
  }: CreateReservationOpts): Promise<Reservation> {
    const response = await axios.post('/reservations/', {
      email,
      item,
      status,
      adminId,
      startDateTime: checkoutDate,
      endDateTime: returnDate
    });

    return response.data;
  }

  static async deleteReservation(reservationId: number): Promise<void> {
    const response = await axios.delete(`/reservations/${reservationId}`);
    return response.data;
  }
}

export default API;
