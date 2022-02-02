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
  /*
  static async addItem(item: Partial<Item>): Promise<{ itemId: number }> {
const itemKeys = Object.keys(item) as Array<keyof typeof item>;

// Since this function takes a partial item, we need to filter out
// any null or undefined properties
itemKeys.forEach(key => {
if (item[key] === null || item[key] === undefined) {
delete item[key];
}
});

const response = await axios.post('/inventory/add', { ...item });

return response.data;
}

  */
}

export default API;
