import { request } from './request';

// 相册
export function getAlbums(petId) {
  return request({ url: `/pets/${petId}/albums`, method: 'GET' });
}

export function createAlbum(petId, data) {
  return request({ url: `/pets/${petId}/albums`, method: 'POST', data });
}

export function updateAlbum(petId, albumId, data) {
  return request({ url: `/pets/${petId}/albums/${albumId}`, method: 'PUT', data });
}

export function deleteAlbum(petId, albumId) {
  return request({ url: `/pets/${petId}/albums/${albumId}`, method: 'DELETE' });
}

// 照片
export function getPhotos(petId, params = {}) {
  const query = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');
  return request({ url: `/pets/${petId}/photos?${query}`, method: 'GET' });
}

export function addPhotos(petId, photos, albumId) {
  return request({ url: `/pets/${petId}/photos`, method: 'POST', data: { photos, albumId } });
}

export function deletePhoto(petId, photoId) {
  return request({ url: `/pets/${petId}/photos/${photoId}`, method: 'DELETE' });
}
