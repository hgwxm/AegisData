/* ============================================================
 * API 封装层
 * ------------------------------------------------------------
 * 对外统一暴露：login(username, password, industry) => Promise
 * 内部根据 CONFIG.USE_MOCK 决定走 Mock 还是真实后端。
 * 前端不持有任何 API Key，也不直接调用 MaaS 等外部服务。
 * ============================================================ */

/**
 * 模拟延迟
 * @param {number} ms 毫秒
 */
function mockDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 登录接口
 * @param {string} username 账号
 * @param {string} password 密码
 * @param {string} industry 行业（制造业/教育业/医疗业）
 * @returns {Promise<{code:number, token?:string, data?:object, message?:string}>}
 */
async function login(username, password, industry) {
  // ---------- Mock 模式 ----------
  if (CONFIG.USE_MOCK) {
    await mockDelay(500); // 模拟 500ms 网络延迟

    // 简单校验：账号密码不能为空（演示用）
    if (!username || !password) {
      return { code: 400, message: '账号或密码不能为空' };
    }

    return {
      code: 200,
      token: 'mock_token',
      data: { username, industry }
    };
  }

  // ---------- 真实后端模式 ----------
  try {
    const response = await fetch(`${CONFIG.baseURL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password, industry })
    });

    if (!response.ok) {
      return { code: response.status, message: `请求失败（HTTP ${response.status}）` };
    }

    return await response.json();
  } catch (err) {
    return { code: -1, message: '网络异常，请稍后重试' };
  }
}
