import { request } from './request';

export function getShares(params) {
  const query = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');
  return request({ url: `/shares?${query}`, method: 'GET' });
}

export function createShare(data) {
  return request({ url: '/shares', method: 'POST', data });
}

export function getShareDetail(id) {
  return request({ url: `/shares/${id}`, method: 'GET' });
}

export function getShareByCode(code) {
  return request({ url: `/shares/code/${code}`, method: 'GET' });
}

export function likeShare(id) {
  return request({ url: `/shares/${id}/like`, method: 'POST' });
}

export function deleteShare(id) {
  return request({ url: `/shares/${id}`, method: 'DELETE' });
}

// 收藏
export function getFavorites() {
  return request({ url: '/favorites', method: 'GET' });
}

export function addFavorite(targetType, targetId) {
  return request({ url: '/favorites', method: 'POST', data: { targetType, targetId } });
}

export function removeFavorite(id) {
  return request({ url: `/favorites/${id}`, method: 'DELETE' });
}
