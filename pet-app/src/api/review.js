import { request } from './request';

// 提交评价
export function createReview(orderId, data) {
  return request({ url: `/orders/${orderId}/reviews`, method: 'POST', data });
}

// 查看订单评价
export function getOrderReviews(orderId) {
  return request({ url: `/orders/${orderId}/reviews`, method: 'GET' });
}

// 用户收到的评价
export function getUserReviews(userId) {
  return request({ url: `/users/${userId}/reviews`, method: 'GET' });
}

// 发起申诉
export function createDispute(orderId, data) {
  return request({ url: `/orders/${orderId}/disputes`, method: 'POST', data });
}

// 我的申诉
export function getMyDisputes() {
  return request({ url: '/disputes/me', method: 'GET' });
}

// 撤销申诉
export function cancelDispute(id) {
  return request({ url: `/disputes/${id}/cancel`, method: 'PUT' });
}

// 拉黑/取消拉黑
export function getBlacklist() {
  return request({ url: '/blacklist', method: 'GET' });
}

export function blockUser(blockedUserId, reason) {
  return request({ url: '/blacklist', method: 'POST', data: { blockedUserId, reason } });
}

export function unblockUser(id) {
  return request({ url: `/blacklist/${id}`, method: 'DELETE' });
}
