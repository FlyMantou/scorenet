import axios from 'axios'
import { Message } from 'element-ui'
import * as $router from 'vue-router'

// create an axios instance
const service = axios.create({
  baseURL: process.env.BASE_API, // api 的 base_url
  withCredentials: false, // 允许携带cookie
  timeout: 20000, // request timeout
  headers: {
    //'Content-Type': 'application/json'
    'Content-Type': 'application/json'
  }
})

service.interceptors.request.use(
  config => {
    //config.headers['token'] = getToken()
    return config
  },
  error => {
    console.log(error)
  }
)
service.interceptors.response.use(
  response => {
    console.log('收到拦截信息')
    console.log(response)
    if (response.data.status === 5) {
      Message({
        message: response.data.msg,
        type: 'error',
        duration: 5 * 1000
      })
      removeToken()
      $router.replace({
        path: 'login',
        query: { redirect: $router.currentRoute.fullPath }
      })
      return response
    } else {
      return response
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
