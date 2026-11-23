// js/api.js —— 统一接口层，后端接入只需改 BASE_URL 与 request 实现
const BASE_URL = '/';

function request(url, options = {}) {
  const token = localStorage.getItem('token') || '';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    ...(options.headers || {})
  };
  // 真实环境直接 fetch；当前用 mock 保证前端可跑
  return mockRequest(url, options.method || 'GET', options.body, headers);
}

function delay(data, ms = 300) {
  return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), ms));
}

function mockRequest(url, method, body, headers) {
  const b = typeof body === 'string' ? JSON.parse(body || '{}') : (body || {});

  // 健康检查
  if (url.includes('/health')) return delay({ status: 'ok' }, 100);

  // 登录
  if (url.includes('/api/login')) {
    if (!b.username || !b.password) return Promise.reject(new Error('账号或密码不能为空'));
    localStorage.setItem('token', 'mock-token-' + Date.now());
    return delay({ token: localStorage.getItem('token'), user: { account: b.username, nickname: '管理员', avatar: '' } });
  }

  // 上传
  if (url.includes('/api/upload')) return delay({ url: URL.createObjectURL(new Blob([b.file || ''])) });

  // 数据初步筛选
  if (url.includes('/api/filter')) return delay({
    total: 12840, filtered: 3261,
    fields: ['企业名称', '行业分类', '注册资本', '风险等级'],
    rows: Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: '示例企业' + (i + 1), risk: i % 3 === 0 ? '高' : '中' }))
  });

  // 异常数据
  if (url.includes('/api/anomalies')) return delay({
    list: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, company: '异常企业' + (i + 1), level: ['高','中','低'][i%3], desc: '数据关联异常' })),
    total: 10
  });

  // AI解读
  if (url.includes('/api/explain')) return delay({ text: '当前数据整体风险偏高，建议重点关注注册资本异常与关联企业交叉持股情况。' });

  // 对话
  if (url.includes('/api/chat')) return delay({ reply: '已收到你的问题，正在结合当前数据集进行分析……' });

  // 整改建议
  if (url.includes('/api/suggestions')) return delay({
    list: [
      { id: 1, title: '完善数据溯源机制', level: '高', content: '建议建立跨源数据校验流程。' },
      { id: 2, title: '强化异常企业监控', level: '中', content: '对高风险企业设置定期复核。' }
    ]
  });

  // 图表
  if (url.includes('/api/charts')) return delay({
    riskPie: [{ value: 120, name: '高风险' }, { value: 260, name: '中风险' }, { value: 420, name: '低风险' }],
    trend: { months: ['1月','2月','3月','4月','5月','6月'], values: [120,200,150,280,190,310] },
    industryBar: { names: ['制造','金融','科技','零售'], values: [320,210,180,150] }
  });

  // 用户资料
  if (url.includes('/api/user/profile') && method === 'GET') return delay({
    account: 'admin', nickname: '管理员', gender: '男', birthday: '1990-01-01',
    email: 'admin@aegisdata.com', phone: '13800000000', avatar: ''
  });
  if (url.includes('/api/user/profile') && method === 'PUT') return delay({ success: true });

  // 头像
  if (url.includes('/api/user/avatar')) return delay({ url: URL.createObjectURL(new Blob([''])) });

  // 密码
  if (url.includes('/api/user/password')) {
    if (b.oldPassword !== '123456') return Promise.reject(new Error('原密码错误'));
    return delay({ success: true });
  }

  // 偏好
  if (url.includes('/api/user/preferences') && method === 'GET') return delay({
    notify: { loginAlert: true, riskAlert: true, systemNotice: false, weeklyReport: true },
    appearance: { darkMode: false }
  });
  if (url.includes('/api/user/preferences') && method === 'PUT') return delay({ success: true });

  // 操作日志
  if (url.includes('/api/user/logs')) return delay([
    { id: 1, time: '2026-11-20 10:22', action: '登录系统', ip: '127.0.0.1' },
    { id: 2, time: '2026-11-19 15:08', action: '执行数据筛选', ip: '127.0.0.1' },
    { id: 3, time: '2026-11-18 09:31', action: '导出报告', ip: '127.0.0.1' }
  ]);

  // 登录记录
  if (url.includes('/api/user/sessions')) return delay([
    { id: 1, device: 'Chrome / Windows', time: '2026-11-20 10:22', location: '本地', current: true },
    { id: 2, device: 'Safari / iOS', time: '2026-11-15 08:14', location: '北京', current: false }
  ]);

  return Promise.reject(new Error('接口未定义：' + url));
}

const api = {
  health: () => request('/health'),
  login: data => request('/api/login', { method: 'POST', body: JSON.stringify(data) }),
  upload: file => {
    const fd = new FormData(); fd.append('file', file);
    return request('/api/upload', { method: 'POST', body: fd, headers: { 'Content-Type': 'multipart/form-data' } });
  },
  filter: data => request('/api/filter', { method: 'POST', body: JSON.stringify(data) }),
  anomalies: params => request('/api/anomalies' + (params ? '?' + new URLSearchParams(params) : '')),
  explain: data => request('/api/explain', { method: 'POST', body: JSON.stringify(data) }),
  chat: data => request('/api/chat', { method: 'POST', body: JSON.stringify(data) }),
  suggestions: params => request('/api/suggestions' + (params ? '?' + new URLSearchParams(params) : '')),
  charts: params => request('/api/charts' + (params ? '?' + new URLSearchParams(params) : '')),
  user: {
    getProfile: () => request('/api/user/profile'),
    updateProfile: data => request('/api/user/profile', { method: 'PUT', body: JSON.stringify(data) }),
    uploadAvatar: file => {
      const fd = new FormData(); fd.append('avatar', file);
      return request('/api/user/avatar', { method: 'POST', body: fd, headers: { 'Content-Type': 'multipart/form-data' } });
    },
    changePassword: data => request('/api/user/password', { method: 'PUT', body: JSON.stringify(data) }),
    getPreferences: () => request('/api/user/preferences'),
    updatePreferences: data => request('/api/user/preferences', { method: 'PUT', body: JSON.stringify(data) }),
    getLogs: () => request('/api/user/logs'),
    getSessions: () => request('/api/user/sessions')
  }
};

window.api = api;