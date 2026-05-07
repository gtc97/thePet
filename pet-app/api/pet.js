import { request } from './request';

export function getPets(params) {
  return request({ url: '/pets', method: 'GET', data: params });
}

export function getPetDetail(id) {
  return request({ url: `/pets/${id}`, method: 'GET' });
}

export function createPet(data) {
  return request({ url: '/pets', method: 'POST', data });
}

export function updatePet(id, data) {
  return request({ url: `/pets/${id}`, method: 'PUT', data });
}

export function deletePet(id) {
  return request({ url: `/pets/${id}`, method: 'DELETE' });
}

export function archivePet(id) {
  return request({ url: `/pets/${id}/archive`, method: 'POST' });
}

export function getPetStats(id) {
  return request({ url: `/pets/${id}/stats`, method: 'GET' });
}
