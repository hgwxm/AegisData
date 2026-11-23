// js/app.js —— 完整版，设置弹窗已扩展为 6 个 tab
const { createApp, ref, reactive } = Vue;

// 点击外部关闭指令
const clickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = (e) => { if (!(el === e.target || el.contains(e.target))) binding.value(); };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) { document.removeEventListener('click', el.clickOutsideEvent); }
};

createApp({
  setup() {
    // ===== 页面状态 =====
    const currentPage = ref('select-industry');
    const industries = ref([
  { name: '制造业', icon: '🏭' },
  { name: '金融业', icon: '🏦' },
  { name: '信息技术', icon: '💻' },
  { name: '批发零售', icon: '🛒' },
  { name: '能源化工', icon: '⚡' },
  { name: '医疗健康', icon: '🏥' },
  { name: '建筑地产', icon: '🏗️' },
  { name: '交通运输', icon: '🚚' },
  { name: '教育文化', icon: '🎓' },
  { name: '农业食品', icon: '🌾' },
  { name: '餐饮住宿', icon: '🍜' },
  { name: '文体娱乐', icon: '🎬' },
  { name: '公共管理', icon: '🏛️' },
  { name: '科学研究', icon: '🔬' },
  { name: '居民服务', icon: '🧰' }
]);
    const selectedIndustry = ref({ name: '' });
    const nickname = ref('普通用户');
    const showUserMenu = ref(false);
    const showLeftUserMenu = ref(false);
    const currentProject = ref(null);
    const monthlyProjects = ref([{ id: 1, name: '2025年度财务合规审计' }]);
    const historyProjects = ref([{ id: 2, name: '2024年度内控审计' }]);
    const showNewProjectModal = ref(false);
    const newProjectName = ref('');
    const currentStep = ref(1);
    const originalRecords = ref([]);
    const currentRecords = ref([]);
    const currentAnomalies = ref([]);
    const activeReceipt = ref(0);
    const expandedAnomalyId = ref(null);
    const filterMessage = ref('');
    const filterExplanation = ref('');
    const showFilterResult = ref(false);
    const currentConditions = ref([]);
    const filterMatchCount = ref(0);
    const aiAnalysisComplete = ref(false);
    const aiElapsedTime = ref(0);
    const aiTasks = ref([]);
    const activeAiTaskIndex = ref(0);
    const suggestionsData = ref(null);
    const showChartModal = ref(false);
    const aiChartMessage = ref('');
    const isAiGenerating = ref(false);
    const isExporting = ref(false);
    const showExplainModal = ref(false);
    const explainLoading = ref(false);
    const explainText = ref('');
    const toastMsg = ref('');
    const loginAccount = ref('admin');
    const password = ref('');
    const errorMsg = ref('');
    const logging = ref(false);
    const showSettingsModal = ref(false);

    const showToast = (msg) => { toastMsg.value = msg; setTimeout(() => toastMsg.value = '', 1800); };

    // ===== 页面方法 =====
    function selectIndustry(ind) { selectedIndustry.value = ind; currentPage.value = 'login'; }
    function handleLogin() {
      if (!loginAccount.value || !password.value) { errorMsg.value = '请输入账号密码'; return; }
      logging.value = true;
      setTimeout(() => { logging.value = false; currentPage.value = 'main'; showToast('登录成功'); }, 500);
    }
    function logout() { currentPage.value = 'select-industry'; showUserMenu.value = false; showLeftUserMenu.value = false; }
    function closeUserMenu() { showUserMenu.value = false; }
    function closeLeftUserMenu() { showLeftUserMenu.value = false; }
    function createProject() {
      if (!newProjectName.value) return showToast('请输入项目名称');
      currentProject.value = { name: newProjectName.value };
      showNewProjectModal.value = false; newProjectName.value = ''; currentStep.value = 1;
    }
    function resetWorkflow() { currentStep.value = 1; aiAnalysisComplete.value = false; }
    function handleUploadAndGoFilter() { currentStep.value = 2; originalRecords.value = Array.from({ length: 12 }, (_, i) => ({})); }
    function handleFilter() {
      filterExplanation.value = '已理解：筛出金额异常及高频交易记录';
      showFilterResult.value = true;
      currentConditions.value = [{ field: '金额', op: '>', value: '50000', window: {} }];
      filterMatchCount.value = 3261;
    }
    function skipFilter() { currentStep.value = 3; runAiAnalysis(); }
    function onConditionChange() { filterMatchCount.value = 3261; }
    function confirmFilter() { currentStep.value = 3; runAiAnalysis(); }
    function resetFilterInput() { filterMessage.value = ''; showFilterResult.value = false; filterExplanation.value = ''; }
    function runAiAnalysis() {
      aiTasks.value = [
        { text: '解析财务凭证数据结构', done: false },
        { text: '全量扫描异常交易', done: false },
        { text: '关联企业股权与供应商网络', done: false },
        { text: '生成风险评级', done: false }
      ];
      let i = 0;
      const t = setInterval(() => {
        aiElapsedTime.value++;
        if (i < aiTasks.value.length) { aiTasks.value[i].done = true; i++; activeAiTaskIndex.value = i; }
        if (aiElapsedTime.value >= 8) {
          clearInterval(t); aiAnalysisComplete.value = true;
          currentAnomalies.value = Array.from({ length: 8 }, (_, i) => ({
            id: i + 1, field: ['金额异常','频次异常','时间异常','关联方异常'][i % 4],
            riskLevel: ['高','中','低'][i % 3], description: '系统检测到该笔交易与历史基线存在显著偏离',
            evidenceRecords: Array.from({ length: 3 }, (_, j) => ({ date: '2025-01-' + (j + 10), subject: '示例企业', amount: '128,000', desc: '对应凭证' }))
          }));
          suggestionsData.value = {
            overallRisk: '高',
            keyIssues: ['部分交易缺乏对应合同支撑', '关联供应商集中度高'],
            measures: ['补充交易背景说明材料', '建立供应商准入复核机制'],
            internalControl: ['完善审批分级授权', '强化跨部门数据核对'],
            followUp: ['30日内完成整改', '下季度复核']
          };
        }
      }, 300);
    }
    function goToReport() { currentStep.value = 4; }
    function toggleEvidence(id) { expandedAnomalyId.value = expandedAnomalyId.value === id ? null : id; }
    function handleExplain(id, a) {
      showExplainModal.value = true; explainLoading.value = true; explainText.value = '';
      setTimeout(() => { explainLoading.value = false; explainText.value = '该异常主要源于交易金额与历史均值偏离超过 3 个标准差，且对应凭证缺失。'; }, 600);
    }
    function openChartModal() { showChartModal.value = true; setTimeout(renderCharts, 100); }
    function generateCustomChart() { isAiGenerating.value = true; setTimeout(() => isAiGenerating.value = false, 800); }
    function exportChartsToZip() { isExporting.value = true; setTimeout(() => { isExporting.value = false; showToast('图表压缩包已生成'); }, 800); }
    function renderCharts() {
      const charts = [
        { id: 'modalChart1', x: ['1月','2月','3月','4月','5月','6月'], y: [120,200,150,280,190,310], t: 'line' },
        { id: 'modalChart2', x: ['供应商A','供应商B','供应商C','供应商D','供应商E'], y: [320,210,180,150,120], t: 'bar' },
        { id: 'modalChart3', x: ['金额异常','频次异常','时间异常','关联方异常'], y: [45,25,20,10], t: 'pie' },
        { id: 'modalChart4', x: ['高','中','低'], y: [12,26,42], t: 'bar' }
      ];
      charts.forEach(c => {
        const el = document.getElementById(c.id); if (!el) return;
        const chart = echarts.init(el);
        const opt = c.t === 'pie'
          ? { series: [{ type: 'pie', radius: '60%', data: c.x.map((k, i) => ({ name: k, value: c.y[i] })) }] }
          : { tooltip: {}, xAxis: { type: 'category', data: c.x }, yAxis: { type: 'value' }, series: [{ type: c.t, data: c.y, smooth: true, itemStyle: { color: '#1d4ed8' } }] };
        chart.setOption(opt);
      });
    }

    // ===== 设置弹窗 6 个 tab =====
    const settingsTab = ref('profile');
    const settingsTabs = [
      { key: 'profile', label: '基本资料', icon: '👤' },
      { key: 'security', label: '账号安全', icon: '🔒' },
      { key: 'notify', label: '通知设置', icon: '🔔' },
      { key: 'logs', label: '操作日志', icon: '📋' },
      { key: 'sessions', label: '登录记录', icon: '📱' },
      { key: 'appearance', label: '外观设置', icon: '🎨' }
    ];
    const editNickname = ref('普通用户');
    const editGender = ref('男');
    const editBirthday = ref('1990-01-01');
    const editEmail = ref('admin@aegisdata.com');
    const editPhone = ref('13800000000');
    const editAvatar = ref('');
    const oldPassword = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const notifyPrefs = reactive({ loginAlert: true, riskAlert: true, systemNotice: false, weeklyReport: true });
    const notifyLabel = { loginAlert: '登录提醒', riskAlert: '风险预警', systemNotice: '系统通知', weeklyReport: '周报推送' };
    const notifyDesc = { loginAlert: '异地或新设备登录时通知我', riskAlert: '发现高风险异常时立即通知', systemNotice: '版本更新与系统维护公告', weeklyReport: '每周一推送审计周报' };
    const userLogs = ref([
      { id: 1, time: '2026-11-23 10:12', action: '登录系统', ip: '192.168.1.10', result: '成功' },
      { id: 2, time: '2026-11-22 16:40', action: '导出审计报告', ip: '192.168.1.10', result: '成功' },
      { id: 3, time: '2026-11-21 09:05', action: '修改密码', ip: '192.168.1.22', result: '失败' }
    ]);
    const userSessions = ref([
      { id: 1, time: '2026-11-23 10:12', ip: '192.168.1.10', location: '中国·南京', device: 'Chrome / Windows', status: '成功' },
      { id: 2, time: '2026-11-21 09:05', ip: '192.168.1.22', location: '中国·上海', device: 'Safari / macOS', status: '失败' }
    ]);
    const darkMode = ref(false);

    function openSettings() { showSettingsModal.value = true; settingsTab.value = 'profile'; }
    function handleAvatarUpload(e) {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { editAvatar.value = ev.target.result; };
      reader.readAsDataURL(file);
    }
    function saveSettings() {
      if (settingsTab.value === 'security' && newPassword.value && newPassword.value !== confirmPassword.value) return showToast('两次密码不一致');
      showToast('保存成功');
      showSettingsModal.value = false;
      oldPassword.value = newPassword.value = confirmPassword.value = '';
    }

    return {
      currentPage, industries, selectedIndustry, nickname, showUserMenu, showLeftUserMenu,
      currentProject, monthlyProjects, historyProjects, showNewProjectModal, newProjectName,
      currentStep, originalRecords, currentRecords, currentAnomalies, activeReceipt, expandedAnomalyId,
      filterMessage, filterExplanation, showFilterResult, currentConditions, filterMatchCount,
      aiAnalysisComplete, aiElapsedTime, aiTasks, activeAiTaskIndex, suggestionsData,
      showChartModal, aiChartMessage, isAiGenerating, isExporting, showExplainModal, explainLoading, explainText,
      toastMsg, loginAccount, password, errorMsg, logging, showSettingsModal,
      selectIndustry, handleLogin, logout, closeUserMenu, closeLeftUserMenu, createProject, resetWorkflow,
      handleUploadAndGoFilter, handleFilter, skipFilter, onConditionChange, confirmFilter, resetFilterInput,
      goToReport, toggleEvidence, handleExplain, openChartModal, generateCustomChart, exportChartsToZip,
      settingsTab, settingsTabs, editNickname, editGender, editBirthday, editEmail, editPhone, editAvatar,
      oldPassword, newPassword, confirmPassword, notifyPrefs, notifyLabel, notifyDesc, userLogs, userSessions, darkMode,
      openSettings, handleAvatarUpload, saveSettings, showToast
    };
  }
}).directive('click-outside', clickOutside).mount('#app');