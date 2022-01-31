import axios from 'axios';
import { User } from './ApiHelper';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.baseURL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:4565/api' : '/csi/api';

class API {
  static async login(nid: string, password: string): Promise<User & { token: string }> {
    const response = await axios.post('/users/login', {
      nid,
      password
    });

    return response.data;
  }
}

export default API;
