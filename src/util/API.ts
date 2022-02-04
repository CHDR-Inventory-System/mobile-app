import axios from 'axios';
import { User } from '../types/API';
import { DEBUG_API_URL, PROD_API_URL } from '@env';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.baseURL = __DEV__ ? DEBUG_API_URL : PROD_API_URL;

class API {
  static async login(nid: string, password: string): Promise<User> {
    const response = await axios.post('/users/login', {
      nid,
      password
    });

    return response.data;
  }

  static async deleteItem(id: number): Promise<void> {
    const response = await axios.delete(`/inventory/item/${id}`, {
      data: {
        id
      }
    });

    return response.data;
  }
}

export default API;
