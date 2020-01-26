import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './assets/styles/app.scss';
import './assets/img/blog.svg';
import './assets/img/trash-alt.svg';
import './assets/img/edit.svg';
const axios = require('axios');
const getToken = () => localStorage.getItem('bearer_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

// request interceptor
axios.interceptors.request.use(
  config => {
    // Do something before request is sent
    config.baseURL = 'http://localhost:3000/api/';
    config.headers["Authorization"] = "bearer " + getToken();
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor
axios.interceptors.response.use(response => response,
  error => {
    const { code, message } = error.response.data;
    if (message === 'Token expired') {
      return Promise.reject(error);
    }
    const originalRequest = error.config
    let retryOrigReq;
    if (code === 401) {
      retryOrigReq = new Promise(function(resolve, reject) {
        axios.post('signin/new_token', { bearer_token: getToken(), refresh_token: getRefreshToken() })
        .then(res => {
          const { bearer_token, refresh_token } = res.data;
          localStorage.setItem('bearer_token', bearer_token);
          localStorage.setItem('refresh_token', refresh_token);
          originalRequest.headers["Authorization"] = "bearer " + getToken();
          axios(originalRequest).then(r => resolve(r)).catch(e => reject(e));
        })
        .catch(err => reject(err))
      })
    } else {
      return Promise.reject(error);
    }
    return retryOrigReq;
  }
);

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('app')
);

module.hot.accept();
