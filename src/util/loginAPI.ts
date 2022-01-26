import axios from 'axios';
import User  from './Api';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.put['Content-Type'] = 'application/json';
axios.defaults.baseURL =
  process.env.NODE_ENV === 'development' ? 'http://localhost:4565/api' : '/csi/api';

class loginAPI {
  static  async login(nid: string, password: string) {
    const response = await axios.get('/user', {
      params: {
        Nid: nid,
        Password: password
      }
    })
    console.log(response);
    return response.data;
  }
}

export default loginAPI;