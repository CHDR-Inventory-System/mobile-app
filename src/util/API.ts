import axios from 'axios';
import { ImageFormData, Item, Reservation, User } from '../types/API';
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

  static async uploadImage(
    itemId: number,
    image: ImageFormData
  ): Promise<{ imageID: number }> {
    const response = await axios.post(`/inventory/${itemId}/uploadImage`, {
      image: image.base64ImageData,
      filename: image.name
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

  static async getReservations(itemId: number): Promise<Reservation[]> {
    const response = await axios.get(`/reservations/${itemId}`);
    return response.data;
  }
}

export default API;
