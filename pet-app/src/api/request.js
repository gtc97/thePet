// API请求封装
export const BASE_URL = 'http://localhost:3000/api/v1';

let isRefreshing = false;
let refreshQueue = [];

function getToken() {
  return uni.getStorageSync('access_token');
}

function setToken(token) {
  uni.setStorageSync('access_token', token);
}

function getRefreshToken() {
  return uni.getStorageSync('refresh_token');
}

function clearAuth() {
  uni.removeStorageSync('access_token');
  uni.removeStorageSync('refresh_token');
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuth();
    return null;
  }
  try {
    const res = await uni.request({
      url: `${BASE_URL}/auth/refresh-token`,
      method: 'POST',
      data: { refreshToken },
    });
    if (res.data.code === 0) {
      setToken(res.data.data.accessToken);
      uni.setStorageSync('refresh_token', res.data.data.refreshToken);
      return res.data.data.accessToken;
    }
  } catch {
    // ignore
  }
  clearAuth();
  return null;
}

export function request(options) {
  return new Promise((resolve, reject) => {
    const token = getToken();

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success: async (res) => {
        if (res.data.code === 0) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // Token过期，尝试刷新
          if (!isRefreshing) {
            isRefreshing = true;
            const newToken = await refreshAccessToken();
            isRefreshing = false;
            if (newToken) {
              // 重试原请求
              try {
                const retryRes = await request(options);
                resolve(retryRes);
              } catch (e) {
                reject(e);
              }
              // 执行队列中的请求
              refreshQueue.forEach(cb => cb());
              refreshQueue = [];
            } else {
              uni.reLaunch({ url: '/subPages/login/index' });
              reject(new Error('登录已过期'));
            }
          } else {
            // 正在刷新中，加入队列
            refreshQueue.push(async () => {
              try {
                const retryRes = await request(options);
                resolve(retryRes);
              } catch (e) {
                reject(e);
              }
            });
          }
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        reject(new Error(err.errMsg || '网络请求失败'));
      },
    });
  });
}

export default { request, BASE_URL, getToken, setToken, clearAuth };
