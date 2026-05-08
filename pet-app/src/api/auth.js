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

// 微信手机号授权登录
export function wechatPhoneLogin(code, encryptedData, iv) {
  return request({ url: '/auth/wechat-phone-login', method: 'POST', data: { code, encryptedData, iv } });
}

// 绑定微信到已有账号
export function bindWechat(code) {
  return request({ url: '/auth/bind-wechat', method: 'POST', data: { code } });
}

export function register(data) {
  return request({ url: '/auth/register', method: 'POST', data });
}
