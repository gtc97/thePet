import { request } from './request';

// 我的押金状态
export function getDepositStatus() {
  return request({ url: '/deposits/me', method: 'GET' });
}

// 缴纳押金
export function payDeposit(amount = 100) {
  return request({ url: '/deposits/pay', method: 'POST', data: { amount } });
}

// 押金流水
export function getDepositLogs() {
  return request({ url: '/deposits/me/logs', method: 'GET' });
}
