import { request } from './request';

export function sendSmsCode(phone, type) {
  return request({ url: '/auth/send-sms-code', method: 'POST', data: { phone, type } });
}

export function loginByCode(phone, code) {
  return request({ url: '/auth/login-by-code', method: 'POST', data: { phone, code } });
}

export function loginByPassword(phone, password) {
  return request({ url: '/auth/login-by-password', method: 'POST', data: { phone, password } });
}

export function wechatLogin(code) {
  return request({ url: '/auth/wechat-login', method: 'POST', data: { code } });
}

export function register(data) {
  return request({ url: '/auth/register', method: 'POST', data });
}
