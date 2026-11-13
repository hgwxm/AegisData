const { createApp } = Vue;

const app = createApp({
  data() {
    return {
      industries: [
        { name: '制造业', icon: '🏭' }, { name: '教育业', icon: '🎓' }, { name: '医疗业', icon: '🏥' },
        { name: '金融业', icon: '🏦' }, { name: '互联网', icon: '🌐' }, { name: '零售业', icon: '🛒' },
        { name: '物流业', icon: '🚚' }, { name: '房地产业', icon: '🏢' }, { name: '能源业', icon: '⚡' },
        { name: '农业', icon: '🌾' }, { name: '建筑业', icon: '🏗️' }, { name: '服务业', icon: '🤝' },
        { name: '交通运输', icon: '✈️' }, { name: '文化传媒', icon: '🎬' }, { name: '信息技术', icon: '💻' }
      ],
      selectedIndustry: { name: '制造业', icon: '🏭' },
      loginAccount: '',
      password: '',
      logging: false,
      errorMsg: '',
      currentPage: 'select-industry',
      
      projects: [
        { id: 1, name: '2025 年度财务合规审计', type: 'month' },
        { id: 2, name: '供应商结款专项审计', type: 'month' },
        { id: 3, name: 'Q2 销售费用专项审计', type: 'history' },
        { id: 4, name: '2024 年度财务报表审计', type: 'history' }
      ],
      currentProject: null,
      showNewProjectModal: false,
      newProjectName: '',
      currentStep: 1,

      activeAiTaskIndex: -1,
      aiAnalysisComplete: false,
      aiTimer: null,
      aiTasks: [
        { text: '正在解析财务数据结构...', done: false },
        { text: '识别 2,450 条交易凭证记录', done: false },
        { text: '检索发票抬头及供应商资质...', done: false },
        { text: '使用 MaaS 大模型比对异常特征...', done: false },
        { text: '生成最终风险审计报告', done: false }
      ],
      
      aiElapsedTime: 0,
      aiTimerInterval: null,
      isExporting: false,

      activeReceipt: 0,
      showChartModal: false, 
      showStatusModal: false,

      nickname: '审计员',
      userAvatar: '',
      showUserMenu: false,
      showLeftUserMenu: false, // 左下角独立菜单状态
      showSettingsModal: false,
      showMessagesModal: false,
      settingsTab: 'profile', 
      currentTheme: 'light',
      
      editNickname: '',
      editAvatar: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      toastMsg: ''
    };
  },

  computed: {
    themeClass() {
      if (this.currentTheme === 'dark') return 'dark-mode';
      if (this.currentTheme === 'eye') return 'eye-mode';
      return '';
    },
    monthlyProjects() { return this.projects.filter(p => p.type === 'month'); },
    historyProjects() { return this.projects.filter(p => p.type === 'history'); }
  },

  methods: {
    getIndustryData() {
      const ind = this.selectedIndustry.name;
      if (ind === '制造业') {
        return {
          vouchers: [
            { type: '增值税专用发票', company: '深圳市某某钢材贸易有限公司', date: '2025-06-15', amount: '¥ 450,000.00', status: 'danger', reason: '进项发票无对应的物流单据' },
            { type: '费用报销单', company: '某机械维修服务部', date: '2025-11-02', amount: '¥ 32,000.00', status: 'danger', reason: '维修费用超出定额标准' },
            { type: '采购入库单', company: '杭州某五金配件商行', date: '2025-11-10', amount: '¥ 8,500.00', status: 'pass', reason: '数据逻辑正常，已通过' }
          ],
          suppliers: ['深圳某钢材贸易', '某机械维修', '杭州某五金', '广州某物流', '东莞某模具'],
          supplierAmounts: [450000, 32000, 8500, 12000, 8000],
          trend: [25000, 40000, 15000, 35000, 10000, 450000, 120000, 35000, 15000, 22000, 60000, 28000]
        };
      } else if (ind === '医疗业') {
        return {
          vouchers: [
            { type: '医疗器械采购发票', company: '某医疗设备有限公司', date: '2025-08-20', amount: '¥ 1,200,000.00', status: 'danger', reason: '设备采购未走公开招标流程' },
            { type: '药品入库单', company: '某医药销售公司', date: '2025-09-12', amount: '¥ 85,000.00', status: 'danger', reason: '部分药品效期临近，存在减值风险' },
            { type: '耗材报销单', company: '某口腔耗材供应商', date: '2025-10-05', amount: '¥ 12,000.00', status: 'pass', reason: '数据逻辑正常，已通过' }
          ],
          suppliers: ['某医疗设备', '某医药销售', '某口腔耗材', '某消毒用品', '某外包服务'],
          supplierAmounts: [1200000, 85000, 12000, 8000, 4500],
          trend: [100000, 80000, 90000, 1200000, 150000, 200000, 80000, 85000, 12000, 20000, 30000, 25000]
        };
      } else {
        return {
          vouchers: [
            { type: '教学设备采购单', company: '某科教设备有限公司', date: '2025-07-15', amount: '¥ 350,000.00', status: 'danger', reason: '采购单价高于市场均价 40%' },
            { type: '外聘专家劳务费', company: '某教授', date: '2025-09-10', amount: '¥ 50,000.00', status: 'danger', reason: '劳务费发放未代扣代缴个税' },
            { type: '办公用品采购', company: '某文具批发商行', date: '2025-10-20', amount: '¥ 4,500.00', status: 'pass', reason: '数据逻辑正常，已通过' }
          ],
          suppliers: ['某科教设备', '外聘专家', '某文具批发', '某后勤集团', '某软件服务'],
          supplierAmounts: [350000, 50000, 4500, 15000, 22000],
          trend: [15000, 18000, 12000, 20000, 50000, 35000, 350000, 12000, 4500, 22000, 30000, 28000]
        };
      }
    },

    selectIndustry(ind) {
      this.selectedIndustry = ind;
      this.currentPage = 'login';
    },

    async handleLogin() {
      if (this.logging) return;
      if (!this.loginAccount.trim() || !this.password.trim()) {
        this.errorMsg = '请输入账号和密码';
        return;
      }
      this.errorMsg = '';
      this.logging = true;
      try {
        const res = await login(this.loginAccount.trim(), this.password, this.selectedIndustry.name);
        if (res.code === 200) {
          if (res.token) localStorage.setItem('aegisdata_token', res.token);
          this.currentPage = 'main';
          this.currentProject = this.monthlyProjects.length > 0 ? this.monthlyProjects[0] : null;
          this.nickname = this.loginAccount || '审计员';
          this.editNickname = this.nickname;
          this.resetWorkflow(); 
        } else {
          this.errorMsg = res.message || '登录失败';
        }
      } catch (e) {
        this.errorMsg = '登录异常，请稍后重试';
      } finally {
        this.logging = false;
      }
    },

    createProject() {
      if (!this.newProjectName.trim()) { this.showToast('请输入项目名称'); return; }
      const newId = this.projects.length > 0 ? Math.max(...this.projects.map(p => p.id)) + 1 : 1;
      const newProj = { id: newId, name: this.newProjectName.trim(), type: 'month' };
      this.projects.push(newProj);
      this.currentProject = newProj;
      this.resetWorkflow();
      this.showNewProjectModal = false;
      this.newProjectName = '';
    },

    startAIAnalysis() {
      this.currentStep = 2;
      this.activeAiTaskIndex = 0;
      this.aiAnalysisComplete = false;
      this.aiTasks.forEach(task => task.done = false);
      
      this.aiElapsedTime = 0;
      clearInterval(this.aiTimerInterval);
      this.aiTimerInterval = setInterval(() => {
        this.aiElapsedTime = (this.aiElapsedTime + 0.1).toFixed(1);
      }, 100);

      this.runNextAiTask();
    },

    runNextAiTask() {
      if (this.activeAiTaskIndex >= 0 && this.activeAiTaskIndex < this.aiTasks.length) {
        this.aiTimer = setTimeout(() => {
          this.aiTasks[this.activeAiTaskIndex].done = true;
          this.activeAiTaskIndex++;
          
          if (this.activeAiTaskIndex < this.aiTasks.length) {
            this.runNextAiTask();
          } else {
            this.aiAnalysisComplete = true;
            clearInterval(this.aiTimerInterval);
          }
        }, 800); 
      }
    },

    renderModalCharts() {
      setTimeout(() => {
        const data = this.getIndustryData();

        const chartDom1 = document.getElementById('modalChart1');
        if (chartDom1) {
          let myChart1 = echarts.getInstanceByDom(chartDom1) || echarts.init(chartDom1);
          myChart1.setOption({
            tooltip: { trigger: 'axis' },
            grid: { left: '3%', right: '4%', bottom: '5%', top: '15%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], axisLine: { lineStyle: { color: '#dfe5ec' } } },
            yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f2f5fa' } } },
            series: [{
              name: '异常金额', type: 'line', smooth: true, itemStyle: { color: '#e5484d' },
              areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(229,72,77,0.3)' }, { offset: 1, color: 'rgba(229,72,77,0.01)' }]) },
              data: data.trend
            }]
          });
        }

        const chartDom2 = document.getElementById('modalChart2');
        if (chartDom2) {
          let myChart2 = echarts.getInstanceByDom(chartDom2) || echarts.init(chartDom2);
          myChart2.setOption({
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '3%', right: '10%', bottom: '5%', top: '5%', containLabel: true },
            xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { show: false } },
            yAxis: { type: 'category', data: data.suppliers, axisLine: { show: false }, axisTick: { show: false } },
            series: [{
              name: '异常金额', type: 'bar', barWidth: '40%',
              itemStyle: { color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [{ offset: 0, color: '#e5484d' }, { offset: 1, color: '#fa8c16' }]), borderRadius: [0, 4, 4, 0] },
              label: { show: true, position: 'right', formatter: '¥{c}', color: '#e5484d', fontWeight: 'bold' },
              data: data.supplierAmounts
            }]
          });
        }

        const chartDom3 = document.getElementById('modalChart3');
        if (chartDom3) {
          let myChart3 = echarts.getInstanceByDom(chartDom3) || echarts.init(chartDom3);
          myChart3.setOption({
            tooltip: { trigger: 'item' },
            legend: { top: 'bottom' },
            series: [{
              name: '风险类型', type: 'pie', radius: ['40%', '70%'], avoidLabelOverlap: false,
              itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
              label: { show: false, position: 'center' },
              emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
              labelLine: { show: false },
              data: [
                { value: data.supplierAmounts[0], name: '高频异常项', itemStyle: { color: '#e5484d' } },
                { value: data.supplierAmounts[1], name: '合规性风险', itemStyle: { color: '#fa8c16' } },
                { value: data.supplierAmounts[2], name: '逻辑异常', itemStyle: { color: '#1677ff' } },
                { value: 120000, name: '正常流水', itemStyle: { color: '#52c41a' } }
              ]
            }]
          });
        }
      }, 100);
    },

    exportChartsToZip() {
      this.isExporting = true;
      try {
        const zip = new JSZip();
        const charts = [
          { id: 'modalChart1', name: '全年异常金额波动趋势.png' },
          { id: 'modalChart2', name: '高风险供应商异常金额.png' },
          { id: 'modalChart3', name: '风险类型占比分析.png' }
        ];

        charts.forEach(chart => {
          const dom = document.getElementById(chart.id);
          if (dom) {
            const chartInstance = echarts.getInstanceByDom(dom);
            if (chartInstance) {
              const base64Data = chartInstance.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#ffffff' });
              const base64Str = base64Data.split(',')[1];
              zip.file(chart.name, base64Str, { base64: true });
            }
          }
        });

        zip.generateAsync({ type: 'blob' }).then(content => {
          const zipName = `${this.currentProject.name}_可视化数据.zip`;
          saveAs(content, zipName);
          this.showToast('图表压缩包已生成并下载');
          this.isExporting = false;
        });
      } catch (error) {
        console.error(error);
        this.showToast('导出失败，请重试');
        this.isExporting = false;
      }
    },

    resetWorkflow() { 
      clearTimeout(this.aiTimer);
      clearInterval(this.aiTimerInterval);
      this.aiElapsedTime = 0;
      this.currentStep = 1; 
      this.activeAiTaskIndex = -1;
      this.aiAnalysisComplete = false;
      this.aiTasks.forEach(task => task.done = false);
      this.activeReceipt = 0;
    },
    
    showToast(msg) {
      this.toastMsg = msg;
      setTimeout(() => { this.toastMsg = ''; }, 2500);
    },

    closeUserMenu() { this.showUserMenu = false; },
    closeLeftUserMenu() { this.showLeftUserMenu = false; }, // 新增：关闭左下角菜单的方法

    openSettings() {
      this.showUserMenu = false;
      this.showLeftUserMenu = false; // 打开设置时关闭左下角菜单
      this.editNickname = this.nickname;
      this.editAvatar = this.userAvatar;
      this.oldPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.settingsTab = 'profile';
      this.showSettingsModal = true;
    },
    
    handleAvatarUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.editAvatar = URL.createObjectURL(file);
      }
    },

    saveSettings() {
      if (this.settingsTab === 'profile') {
        this.nickname = this.editNickname || '未命名';
        this.userAvatar = this.editAvatar;
        this.showToast('基本资料已更新');
      } 
      else if (this.settingsTab === 'security') {
        if (!this.oldPassword || !this.newPassword) {
          this.showToast('请填写完整的密码信息');
          return;
        }
        if (this.newPassword.length < 6) {
          this.showToast('新密码长度不能少于6位');
          return;
        }
        if (this.newPassword !== this.confirmPassword) {
          this.showToast('两次输入的新密码不一致');
          return;
        }
        this.showToast('密码修改成功');
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      }
      this.showSettingsModal = false;
    },

    logout() {
      this.loginAccount = '';
      this.password = '';
      this.errorMsg = '';
      this.currentPage = 'select-industry';
      this.currentProject = null;
      this.showUserMenu = false;
      this.showLeftUserMenu = false; // 退出登录时关闭左下角菜单
      this.resetWorkflow();
    }
  }
});

app.directive('click-outside', {
  mounted(el, binding) {
    el.clickOutsideEvent = function(event) {
      if (!(el == event.target || el.contains(event.target))) {
        binding.value();
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
});

app.mount('#app');