import { request } from './request';

export function getDiaries(petId, params = {}) {
  const query = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');
  return request({ url: `/pets/${petId}/diaries?${query}`, method: 'GET' });
}

export function getDiaryDetail(petId, diaryId) {
  return request({ url: `/pets/${petId}/diaries/${diaryId}`, method: 'GET' });
}

export function createDiary(petId, data) {
  return request({ url: `/pets/${petId}/diaries`, method: 'POST', data });
}

export function updateDiary(petId, diaryId, data) {
  return request({ url: `/pets/${petId}/diaries/${diaryId}`, method: 'PUT', data });
}

export function deleteDiary(petId, diaryId) {
  return request({ url: `/pets/${petId}/diaries/${diaryId}`, method: 'DELETE' });
}

export function togglePinDiary(petId, diaryId) {
  return request({ url: `/pets/${petId}/diaries/${diaryId}/pin`, method: 'POST' });
}
