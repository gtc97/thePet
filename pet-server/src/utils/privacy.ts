// 手机号脱敏：138****1234
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

// 地址脱敏：仅保留省市区，隐藏详细门牌号
export function maskAddress(address: string): string {
  if (!address) return address;
  // 简单策略：保留前8个字符，其余用**替代
  if (address.length <= 8) return address;
  return address.slice(0, 8) + '****';
}

// 用户公开信息过滤：移除敏感字段
export function sanitizeUser(user: Record<string, unknown>): Record<string, unknown> {
  const safe = { ...user };
  if (safe.phone) safe.phone = maskPhone(safe.phone as string);
  if (safe.address) safe.address = maskAddress(safe.address as string);
  delete safe.password;
  delete safe.openid;
  delete safe.unionid;
  return safe;
}
