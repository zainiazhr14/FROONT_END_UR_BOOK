import { message } from 'antd';
import axios from 'axios';
import storage from './storage';


const BASE_API = process.env.REACT_APP_BASE_API
const STORAGE_TOKEN = process.env.REACT_APP_STORAGE_TOKEN

const request = axios.create({
  baseURL: BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 30000 // request timeout
});

request.interceptors.request.use(
  config => {
    const getToken = storage.get(STORAGE_TOKEN)


    if (getToken) {
      config.headers['Authorization'] = `Bearer ${getToken}`
    }

    return config
  },
  error => {
    // do something with request error
    // console.log(error) // for debug
    return Promise.reject(error)
    // return error
  }
)

request.interceptors.response.use(
  response => {
    if (response.data && response.data.errorMessage && !response.data.canForce) {
      message.error(response.data.errorMessage.split('\n')[0] || response.data.errorMessage)
      throw response.data.errorMessage
    }

    return response.data
  },
  error => {
    if (error.response) {
      if (error.response.status && [401, 403].includes(error.response.status)) {
        // socket.disconnect()
        storage.removeAll()
        window.location.replace('/login')
      }

      if (error.response.data) {
        message.error(error.response.data)
        throw error.response.data
      }
    }
    return error
  }
)

export default request


