import { request } from './request';

// 创建订单
export function createOrder(data) {
  return request({ url: '/orders', method: 'POST', data });
}

// 订单列表（身份感知）
export function getOrders(params = {}) {
  const qs = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');
  return request({ url: `/orders?${qs}`, method: 'GET' });
}

// 附近可接订单（师傅）
export function getNearbyOrders(page = 1) {
  return request({ url: `/orders/nearby?page=${page}`, method: 'GET' });
}

// 订单详情
export function getOrderDetail(id) {
  return request({ url: `/orders/${id}`, method: 'GET' });
}

// 状态时间线
export function getOrderTimeline(id) {
  return request({ url: `/orders/${id}/timeline`, method: 'GET' });
}

// 接单
export function acceptOrder(id) {
  return request({ url: `/orders/${id}/accept`, method: 'POST' });
}

// 拒单
export function rejectOrder(id, reason) {
  return request({ url: `/orders/${id}/reject`, method: 'POST', data: { reason } });
}

// 开始服务
export function startService(id) {
  return request({ url: `/orders/${id}/start`, method: 'POST' });
}

// 完成服务
export function completeService(id, data) {
  return request({ url: `/orders/${id}/complete`, method: 'POST', data });
}

// 确认付款（宠主）
export function payOrder(id, paymentProof) {
  return request({ url: `/orders/${id}/pay`, method: 'POST', data: { paymentProof } });
}

// 确认验收（宠主）
export function confirmOrder(id) {
  return request({ url: `/orders/${id}/confirm`, method: 'POST' });
}

// 取消订单
export function cancelOrder(id, reason) {
  return request({ url: `/orders/${id}/cancel`, method: 'POST', data: { reason } });
}
