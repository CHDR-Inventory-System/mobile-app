import axios from 'axios';
import { Item, JWT, User } from '../types/API';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.baseURL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:4565/api' : '/inventory/api';

class API {
  static async login(nid: string, password: string): Promise<User & JWT> {
    const response = await axios.post('/users/login', {
      nid,
      password
    });

    return response.data;
  }

  static async getItemByBarcode(barcode: string): Promise<Item> {
    const response = await axios.get(`/inventory/barcode/${barcode}`);
    return response.data;
  }
}

export default API;
