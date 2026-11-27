const { createApp, ref, reactive } = Vue;

const clickOutside = {
  beforeMount(el, binding) {
    el.clickOutsideEvent = (e) => { if (!(el === e.target || el.contains(e.target))) binding.value(); };
    document.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) { document.removeEventListener('click', el.clickOutsideEvent); }
};

createApp({
  setup() {
    const currentPage = ref('select-industry');
    const industries = ref([
      { name: '汽车制造', icon: '🚗' },
      { name: '电子元器件', icon: '🔌' },
      { name: '半导体芯片', icon: '💾' },
      { name: '机械设备', icon: '⚙️' },
      { name: '钢铁冶炼', icon: '🏗️' },
      { name: '有色金属', icon: '🔩' },
      { name: '石油化工', icon: '🛢️' },
      { name: '医药制造', icon: '💊' },
      { name: '食品加工', icon: '🍞' },
      { name: '纺织服装', icon: '🧵' },
      { name: '家电制造', icon: '📺' },
      { name: '航空航天', icon: '✈️' },
      { name: '船舶制造', icon: '🚢' },
      { name: '新能源电池', icon: '🔋' },
      { name: '医疗器械', icon: '🩺' }
    ]);
    const selectedIndustry = ref({ name: '' });
    const nickname = ref('普通用户');
    const showUserMenu = ref(false);
    const showLeftUserMenu = ref(false);
    const currentProject = ref(null);
    const monthlyProjects = ref([{ id: 1, name: '2025年度财务合规审计', createdAt: '2025-11-01T00:00:00.000Z' }]);
    const historyProjects = ref([{ id: 2, name: '2024年度内控审计', createdAt: '2024-06-01T00:00:00.000Z' }]);
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
    const isDownloading = ref(false);
    const showExplainModal = ref(false);
    const explainLoading = ref(false);
    const explainText = ref('');
    const explainData = ref(null);
    const toastMsg = ref('');
    const loginAccount = ref('');
    const password = ref('');
    const errorMsg = ref('');
    const logging = ref(false);
    const showSettingsModal = ref(false);

    const showToast = (msg) => { toastMsg.value = msg; setTimeout(() => toastMsg.value = '', 1800); };

    const darkMode = ref(false);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      darkMode.value = true;
      document.documentElement.classList.add('dark');
    }

    // ★★★ 新增：localStorage 持久化工具 ★★★
    function saveProjectToLocal(projectId, data) {
      const allProjects = JSON.parse(localStorage.getItem('aegis_projects') || '{}');
      allProjects[projectId] = { ...allProjects[projectId], ...data, savedAt: new Date().toISOString() };
      localStorage.setItem('aegis_projects', JSON.stringify(allProjects));
      console.log('💾 项目已存到localStorage:', projectId, data);
    }

    function loadProjectFromLocal(projectId) {
      const allProjects = JSON.parse(localStorage.getItem('aegis_projects') || '{}');
      const data = allProjects[projectId];
      console.log('📂 从localStorage加载:', projectId, data);
      return data;
    }

    function selectIndustry(ind) { selectedIndustry.value = ind; currentPage.value = 'login'; }
    function handleLogin() {
      if (!loginAccount.value || !password.value) { errorMsg.value = '请输入账号密码'; return; }
      logging.value = true;
      setTimeout(() => { logging.value = false; currentPage.value = 'main'; showToast('登录成功'); }, 500);
    }
    function logout() { currentPage.value = 'select-industry'; showUserMenu.value = false; showLeftUserMenu.value = false; }
    function closeUserMenu() { showUserMenu.value = false; }
    function closeLeftUserMenu() { showLeftUserMenu.value = false; }

    function isProjectThisMonth(proj) {
      if (!proj || !proj.createdAt) return true;
      const now = new Date();
      const created = new Date(proj.createdAt);
      return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
    }

    function createProject() {
      if (!newProjectName.value) return showToast('请输入项目名称');
      if (currentProject.value && currentProject.value.name) {
        const old = { ...currentProject.value };
        monthlyProjects.value = monthlyProjects.value.filter(p => p.name !== old.name);
        historyProjects.value = historyProjects.value.filter(p => p.name !== old.name);
        if (isProjectThisMonth(old)) monthlyProjects.value.push(old);
        else historyProjects.value.push(old);
      }
      const newId = Date.now();
      currentProject.value = {
        id: newId,
        name: newProjectName.value,
        createdAt: new Date().toISOString()
      };
      // ★ 存项目列表
      monthlyProjects.value.push({ id: newId, name: newProjectName.value, createdAt: new Date().toISOString() });
      showNewProjectModal.value = false; newProjectName.value = ''; currentStep.value = 1;
      showToast('项目已创建');
    }

    function openProject(p, group) {
      // 归档当前项目
      if (currentProject.value && currentProject.value.name) {
        const old = { ...currentProject.value };
        monthlyProjects.value = monthlyProjects.value.filter(x => x.name !== old.name);
        historyProjects.value = historyProjects.value.filter(x => x.name !== old.name);
        if (isProjectThisMonth(old)) monthlyProjects.value.push(old);
        else historyProjects.value.push(old);
      }

      const projectId = p.id || Date.now();
      currentProject.value = { ...p, id: projectId };

      // ★★★ 核心：先从 localStorage 加载 ★★★
      const localData = loadProjectFromLocal(projectId);

      if (localData && localData.completed) {
        // 有本地数据，恢复
        currentStep.value = localData.currentStep || 4;
        filterMatchCount.value = localData.analyzed || 0;
        currentAnomalies.value = localData.anomalies || [];
        suggestionsData.value = {
          overallRisk: localData.overallRisk || '',
          keyIssues: localData.keyIssues || [],
          measures: localData.measures || [],
          internalControl: localData.internalControl || [],
          followUp: localData.followUp || []
        };
        aiAnalysisComplete.value = true;
        showToast('已加载项目：' + p.name);
      } else {
        // 没数据，尝试走 window.api
        if (window.api && window.api.getProjectResult) {
          window.api.getProjectResult(projectId).then(data => {
            if (data && data.completed) {
              currentStep.value = 4;
              filterMatchCount.value = data.analyzed || 0;
              currentAnomalies.value = data.anomalies || [];
              suggestionsData.value = {
                overallRisk: data.overallRisk || '',
                keyIssues: data.keyIssues || [],
                measures: data.measures || [],
                internalControl: data.internalControl || [],
                followUp: data.followUp || []
              };
              aiAnalysisComplete.value = true;
              showToast('已加载项目审计结果');
            } else {
              currentStep.value = 1;
            }
          }).catch(() => {
            currentStep.value = 1;
          });
        } else {
          currentStep.value = 1;
        }
      }
    }

    function resetWorkflow() { currentStep.value = 1; aiAnalysisComplete.value = false; }

    function handleUploadAndGoFilter() {
      currentStep.value = 2;
      originalRecords.value = Array.from({ length: 12 }, (_, i) => ({}));
      // ★ 存进度
      if (currentProject.value) {
        saveProjectToLocal(currentProject.value.id, { currentStep: 2, projectName: currentProject.value.name });
      }
    }

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

      if (window._aiTimer) { clearInterval(window._aiTimer); window._aiTimer = null; }

      aiElapsedTime.value = 0;
      aiAnalysisComplete.value = false;

      const startTime = Date.now();
      let i = 0;

      window._aiTimer = setInterval(() => {
        aiElapsedTime.value = Math.floor((Date.now() - startTime) / 1000);
        if (i < aiTasks.value.length && aiElapsedTime.value >= (i + 1) * 2) {
          aiTasks.value[i].done = true;
          i++;
          activeAiTaskIndex.value = i;
        }
      }, 1000);

      // 模拟 api 调用
      setTimeout(() => {
        clearInterval(window._aiTimer);
        window._aiTimer = null;
        aiAnalysisComplete.value = true;
        aiElapsedTime.value = Math.floor((Date.now() - startTime) / 1000);

        currentRecords.value = Array.from({ length: 12840 }, (_, i) => ({
          id: i + 1,
          department: ['采购部', '财务部', '销售部', '研发部', '行政部'][i % 5],
          supplier: ['供应商A', '供应商B', '供应商C', '供应商D', '供应商E'][i % 5],
          riskLevel: ['高', '中', '低'][i % 3],
          amount: Math.floor(Math.random() * 50000) + 1000,
          date: '2025-01-' + String((i % 28) + 1).padStart(2, '0'),
          type: ['付款', '收款', '转账', '报销'][i % 4]
        }));

        currentAnomalies.value = Array.from({ length: 8 }, (_, i) => ({
          id: i + 1,
          field: ['金额异常', '频次异常', '时间异常', '关联方异常'][i % 4],
          riskLevel: ['高', '中', '低'][i % 3],
          description: '系统检测到该笔交易与历史基线存在显著偏离',
          evidenceRecords: Array.from({ length: 3 }, (_, j) => ({
            date: '2025-01-' + (j + 10), subject: '示例企业', amount: '128,000', desc: '对应凭证'
          }))
        }));

        suggestionsData.value = {
          overallRisk: '高',
          keyIssues: ['部分交易缺乏对应合同支撑', '关联供应商集中度高'],
          measures: ['补充交易背景说明材料', '建立供应商准入复核机制'],
          internalControl: ['完善审批分级授权', '强化跨部门数据核对'],
          followUp: ['30日内完成整改', '下季度复核']
        };

        currentStep.value = 4;

        // ★★★ 核心：分析完立即存到 localStorage ★★★
        if (currentProject.value && currentProject.value.id) {
          const resultData = {
            projectId: currentProject.value.id,
            projectName: currentProject.value.name || '',
            currentStep: 4,
            analyzed: currentRecords.value.length,
            anomalyCount: currentAnomalies.value.length,
            overallRisk: suggestionsData.value.overallRisk,
            keyIssues: suggestionsData.value.keyIssues,
            measures: suggestionsData.value.measures,
            internalControl: suggestionsData.value.internalControl,
            followUp: suggestionsData.value.followUp,
            anomalies: currentAnomalies.value,
            completed: true
          };
          saveProjectToLocal(currentProject.value.id, resultData);

          // 同时尝试走 window.api
          if (window.api && window.api.saveProjectResult) {
            window.api.saveProjectResult(resultData).then(res => {
              if (res && res.success) console.log('✅ 项目结果已保存(后端)');
            }).catch(err => console.error('后端保存失败', err));
          }
        }

        showToast('AI 分析完成，报告已生成');
      }, 3000);
    }

    function goToReport() { currentStep.value = 4; }
    function toggleEvidence(id) { expandedAnomalyId.value = expandedAnomalyId.value === id ? null : id; }

    function handleExplain(id, a) {
      showExplainModal.value = true;
      document.body.style.overflow = 'hidden';
      explainLoading.value = true;
      explainText.value = '';
      explainData.value = null;

      setTimeout(() => {
        explainLoading.value = false;
        const mockJson = {
          overview: '32笔完全重复（日期+金额+科目+经办人），暂定中风险。金额缺失待核实。',
          risks: [
            { title: '重复报销/入账', desc: '可能为同一票据多次报销或系统重复推送，存在资金损失风险。' },
            { title: '内控失效', desc: '同经办人集中同要素记录，审核/查重未有效执行。' },
            { title: '数据质量', desc: '金额0.0、对手方缺失，影响风险敞口量化与税务合规。' }
          ],
          suggestion: '暂停付款 → 调原始凭证/审批流 → 排查系统重复导入 → 落实"先核查后付款"。',
          conclusion: '维持中风险；确认无真实业务支撑则上调高风险。'
        };
        explainData.value = mockJson;
      }, 600);
    }

    function closeExplainModal() {
      showExplainModal.value = false;
      document.body.style.overflow = '';
    }

    function openChartModal() { showChartModal.value = true; setTimeout(renderCharts, 100); }

    function aggregateData(dimension, metric, options = {}) {
      const records = currentRecords.value;
      if (!records || records.length === 0) {
        return { categories: ['无数据'], values: [0] };
      }
      const { aggregate = 'sum', sort = 'desc', topN = 0 } = options;
      const groupMap = {};
      records.forEach(r => {
        const key = r[dimension] || '未知';
        if (!groupMap[key]) groupMap[key] = [];
        groupMap[key].push(r);
      });
      let result = Object.entries(groupMap).map(([key, group]) => {
        let value = 0;
        if (aggregate === 'count') value = group.length;
        else if (aggregate === 'avg') {
          const sum = group.reduce((s, r) => s + (parseFloat(r[metric]) || 0), 0);
          value = group.length > 0 ? sum / group.length : 0;
        } else if (aggregate === 'ratio') value = (group.length / records.length * 100);
        else value = group.reduce((s, r) => s + (parseFloat(r[metric]) || 0), 0);
        return { name: key, value: Math.round(value * 100) / 100 };
      });
      result.sort((a, b) => sort === 'desc' ? b.value - a.value : a.value - b.value);
      if (topN > 0 && result.length > topN) result = result.slice(0, topN);
      return { categories: result.map(r => r.name), values: result.map(r => r.value) };
    }

    async function generateCustomChart() {
      if (!aiChartMessage.value.trim()) return showToast('请输入你想生成图表的描述');
      isAiGenerating.value = true;
      try {
        const res = await window.api.charts(aiChartMessage.value);
        const intent = {
          chartType: res.chartType || 'bar', dimension: res.dimension || 'department', metric: res.metric || 'amount',
          title: res.title || 'AI 智能生成图表', subTitle: res.subTitle || '', color: res.color || '',
          theme: res.theme || 'light', colorMode: res.colorMode || 'single', gradient: res.gradient || null,
          opacity: res.opacity !== undefined ? res.opacity : 0.8, borderRadius: res.borderRadius || 0,
          legend: res.legend !== undefined ? res.legend : true, stack: res.stack || false, smooth: res.smooth || false,
          label: res.label || { show: false }, aggregate: res.aggregate || 'sum', topN: res.topN || 0,
          sort: res.sort || 'desc', filter: res.filter || null, timeGranularity: res.timeGranularity || ''
        };
        if (intent.filter) {
          const { field, op, value } = intent.filter;
          currentRecords.value = currentRecords.value.filter(r => {
            const rv = parseFloat(r[field]) || 0, v = parseFloat(value) || 0;
            if (op === '>') return rv > v; if (op === '<') return rv < v; if (op === '=') return rv == v;
            if (op === '>=') return rv >= v; if (op === '<=') return rv <= v; return true;
          });
        }
        const aggregated = aggregateData(intent.dimension, intent.metric, { aggregate: intent.aggregate, sort: intent.sort, topN: intent.topN });
        let colorList = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4'];
        if (intent.color) {
          if (intent.colorMode === 'single') colorList = [intent.color];
          else if (intent.colorMode === 'gradient' && intent.gradient) colorList = [intent.color];
          else if (Array.isArray(intent.color)) colorList = intent.color;
          else colorList = [intent.color];
        }
        const chartDom = document.getElementById('modalChart4');
        if (!chartDom) { isAiGenerating.value = false; return; }
        const chart = echarts.getInstanceByDom(chartDom) || echarts.init(chartDom);
        chart.clear();
        let option = {};
        if (intent.chartType === 'pie') {
          option = {
            title: { text: intent.title, subtext: intent.subTitle, left: 'center', textStyle: { fontSize: 16 } },
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: intent.legend ? { top: 'bottom' } : { show: false },
            color: colorList,
            series: [{ type: 'pie', radius: intent.colorMode === 'gradient' ? ['40%', '70%'] : '60%', data: aggregated.categories.map((name, i) => ({ name, value: aggregated.values[i] || 0 })), label: intent.label.show ? { show: true, position: intent.label.position || 'outside', formatter: '{b}: {d}%' } : { show: false }, itemStyle: intent.colorMode === 'gradient' && intent.gradient ? { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: intent.gradient.from }, { offset: 1, color: intent.gradient.to }] }, borderRadius: intent.borderRadius, opacity: intent.opacity } : { borderRadius: intent.borderRadius, opacity: intent.opacity } }]
          };
        } else if (intent.chartType === 'area') {
          option = {
            title: { text: intent.title, subtext: intent.subTitle, textStyle: { fontSize: 16 } },
            tooltip: { trigger: 'axis' }, legend: intent.legend ? { data: [intent.metric] } : { show: false },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'category', data: aggregated.categories, axisLabel: { rotate: aggregated.categories.length > 6 ? 45 : 0 } },
            yAxis: { type: 'value' }, color: colorList,
            series: [{ name: intent.metric, type: 'line', data: aggregated.values, smooth: intent.smooth, areaStyle: { opacity: intent.opacity }, lineStyle: { width: 2 }, itemStyle: { borderRadius: intent.borderRadius } }]
          };
        } else {
          option = {
            title: { text: intent.title, subtext: intent.subTitle, textStyle: { fontSize: 16 } },
            tooltip: { trigger: 'axis' }, legend: intent.legend ? { data: [intent.metric] } : { show: false },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            dataZoom: aggregated.categories.length > 10 ? [{ type: 'inside' }] : undefined,
            xAxis: { type: 'category', data: aggregated.categories, axisLabel: { rotate: aggregated.categories.length > 6 ? 45 : 0 } },
            yAxis: { type: 'value' }, color: colorList,
            series: [{ name: intent.metric, type: intent.chartType, data: aggregated.values, smooth: intent.smooth, stack: intent.stack ? 'total' : undefined, label: intent.label.show ? { show: true, position: intent.label.position || 'top' } : { show: false }, itemStyle: { borderRadius: intent.chartType === 'bar' ? intent.borderRadius : 0, opacity: intent.opacity }, lineStyle: intent.chartType === 'line' ? { width: 2 } : undefined }]
          };
        }
        chart.setOption(option, true);
        showToast('AI 已为您生成图表：' + intent.title);
      } catch (e) {
        showToast('AI 生成图表失败：' + (e.message || '网络错误'));
      } finally {
        isAiGenerating.value = false;
      }
    }

    function exportChartsToZip() { isExporting.value = true; setTimeout(() => { isExporting.value = false; showToast('图表压缩包已生成'); }, 800); }

    async function downloadReportFile() {
      if (!suggestionsData.value) return showToast('请先完成 AI 分析再下载报告');
      if (isDownloading.value) return;
      isDownloading.value = true;
      showToast('AI 正在生成报告，请稍候…');
      try {
        const payload = {
          projectName: (currentProject.value && currentProject.value.name) || '审计项目',
          industry: selectedIndustry.value && selectedIndustry.value.name,
          analyzed: (currentRecords.value && currentRecords.value.length) || 0,
          anomalyCount: (currentAnomalies.value && currentAnomalies.value.length) || 0,
          overallRisk: suggestionsData.value.overallRisk,
          keyIssues: suggestionsData.value.keyIssues || [],
          measures: suggestionsData.value.measures || [],
          internalControl: suggestionsData.value.internalControl || [],
          followUp: suggestionsData.value.followUp || [],
          anomalies: currentAnomalies.value
        };
        const blob = await window.api.downloadReport(payload);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = `${payload.projectName}_审计报告.docx`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast('报告已开始下载');
      } catch (e) {
        showToast('下载失败：' + (e.message || '网络错误'));
      } finally {
        isDownloading.value = false;
      }
    }

    function renderCharts() {
      const charts = [
        { id: 'modalChart1', x: ['1月','2月','3月','4月','5月','6月'], y: [120,200,150,280,190,310], t: 'line' },
        { id: 'modalChart2', x: ['供应商A','供应商B','供应商C','供应商D','供应商E'], y: [320,210,180,150,120], t: 'bar' },
        { id: 'modalChart3', x: ['金额异常','频次异常','时间异常','关联方异常'], y: [45,25,20,10], t: 'pie' },
        { id: 'modalChart4', x: ['高','中','低'], y: [12,26,42], t: 'bar' }
      ];
      charts.forEach(c => {
        const el = document.getElementById(c.id); if (!el) return;
        const chart = echarts.getInstanceByDom(el) || echarts.init(el);
        const opt = c.t === 'pie'
          ? { series: [{ type: 'pie', radius: '60%', data: c.x.map((k, i) => ({ name: k, value: c.y[i] })) }] }
          : { tooltip: {}, xAxis: { type: 'category', data: c.x }, yAxis: { type: 'value' }, series: [{ type: c.t, data: c.y, smooth: true, itemStyle: { color: '#1d4ed8' } }] };
        chart.setOption(opt);
      });
    }

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
    const editEmail = ref('1@aegisdata.com');
    const editPhone = ref('13800000001');
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

    function openSettings() { showSettingsModal.value = true; settingsTab.value = 'profile'; }
    function handleAvatarUpload(e) {
      const file = e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => { editAvatar.value = ev.target.result; };
      reader.readAsDataURL(file);
    }

    function saveSettings() {
      if (settingsTab.value === 'security' && newPassword.value && newPassword.value !== confirmPassword.value) {
        return showToast('两次密码不一致');
      }
      if (darkMode.value) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      showToast('保存成功');
      showSettingsModal.value = false;
      oldPassword.value = ''; newPassword.value = ''; confirmPassword.value = '';
    }

    return {
      currentPage, industries, selectedIndustry, nickname, showUserMenu, showLeftUserMenu,
      currentProject, monthlyProjects, historyProjects, showNewProjectModal, newProjectName,
      currentStep, originalRecords, currentRecords, currentAnomalies, activeReceipt, expandedAnomalyId,
      filterMessage, filterExplanation, showFilterResult, currentConditions, filterMatchCount,
      aiAnalysisComplete, aiElapsedTime, aiTasks, activeAiTaskIndex, suggestionsData,
      showChartModal, aiChartMessage, isAiGenerating, isExporting, isDownloading, showExplainModal, explainLoading, explainText, explainData,
      toastMsg, loginAccount, password, errorMsg, logging, showSettingsModal,
      selectIndustry, handleLogin, logout, closeUserMenu, closeLeftUserMenu, createProject, openProject, resetWorkflow,
      handleUploadAndGoFilter, handleFilter, skipFilter, onConditionChange, confirmFilter, resetFilterInput,
      goToReport, toggleEvidence, handleExplain, closeExplainModal, openChartModal, generateCustomChart, exportChartsToZip,
      downloadReportFile,
      settingsTab, settingsTabs, editNickname, editGender, editBirthday, editEmail, editPhone, editAvatar,
      oldPassword, newPassword, confirmPassword, notifyPrefs, notifyLabel, notifyDesc, userLogs, userSessions, darkMode,
      openSettings, handleAvatarUpload, saveSettings, showToast, runAiAnalysis
    };
  }
}).directive('click-outside', clickOutside).mount('#app');