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
import { AtLeast, UserJWT } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.headers.patch['Content-Type'] = 'application/json';
axios.defaults.headers.delete['Content-Type'] = 'application/json';
axios.defaults.baseURL = __DEV__ ? DEBUG_API_URL : PROD_API_URL;

class API {
  /**
   * This function intercepts every axios request to check if the user's
   * JWT is close to its expiration date. If it is, we'll make a request
   * to `/api/refresh` to refresh the JWT and store it using AsyncStorage.
   */
  static setupAxiosInterceptor(): void {
    axios.interceptors.request.use(async config => {
      // Because this function is called before every request, we don't
      // want this to run if we're making a request to refresh the token
      // or we'll be stuck in ain infinite loop.
      if (config.url?.toLowerCase().includes('refreshtoken')) {
        return config;
      }

      try {
        let token = (await AsyncStorage.getItem('jwt')) || '';
        let parsedJwt = jwtDecode<UserJWT>(token);

        // If the user's current JWT is close to expiring, request a new one
        const targetTimestamp = new Date();
        targetTimestamp.setHours(targetTimestamp.getHours() + 1);

        if (parsedJwt.exp !== undefined && +targetTimestamp > parsedJwt.exp * 1000) {
          token = (await API.refreshJWT(token)).token;
          parsedJwt = jwtDecode<UserJWT>(token);
          await AsyncStorage.setItem('jwt', token);
        }

        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers['X-CSRF-TOKEN'] = parsedJwt.csrf;
      } catch (err) {
        console.log('Error setting up interceptor', err);
      }

      return config;
    });
  }

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

  static async addItem(item: Partial<Item>): Promise<Item> {
    const response = await axios.post(`/inventory/add`, {
      ...item
    });
    return response.data;
  }

  static async addChildItem(
    parentId: number,
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

  static async refreshJWT(jwt: string): Promise<{ token: string }> {
    const parsedJwt = jwtDecode<UserJWT>(jwt);
    const response = await axios.get('/refreshToken', {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'X-CSRF-Token': parsedJwt.csrf
      }
    });

    return response.data;
  }

  static async logout(): Promise<void> {
    const response = await axios.post('/users/logout');
    return response.data;
  }

  static async resendVerificationEmail(email: string): Promise<void> {
    const response = await axios.post('/users/resendVerificationEmail', {
      email
    });

    return response.data;
  }
}

export default API;
