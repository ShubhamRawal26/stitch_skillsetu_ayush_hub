/**
 * SkillSetu UI Rendering Engine & Interactive Controller
 * Recreates the complete Google Stitch design system with full reactivity.
 */

window.AppUI = {
  activeStateModal: null,
  assessmentAnswers: {},
  currentQuestionIndex: 0,
  activeFilterDiscipline: '',
  activeFilterDegree: '',
  searchQuery: '',
  selectedStateDetail: null,

  init() {
    // Setup state subscription
    window.appState.subscribe((state) => {
      this.renderCurrentView();
    });

    // Handle hash changes for browser history
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (['home', 'roles', 'login', 'student-dashboard', 'assessment', 'industry-dashboard', 'college-dashboard', 'ministry-dashboard'].includes(hash)) {
        window.appState.setView(hash);
      }
    });

    // Set initial view from hash if present
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['home', 'roles', 'login', 'student-dashboard', 'assessment', 'industry-dashboard', 'college-dashboard', 'ministry-dashboard'].includes(initialHash)) {
      window.appState.setView(initialHash);
    } else {
      this.renderCurrentView();
    }
  },

  navigate(viewName) {
    window.location.hash = viewName;
    window.appState.setView(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : ''}`;
    
    const icon = type === 'error' ? 'error' : type === 'info' ? 'info' : 'check_circle';
    const iconColor = type === 'error' ? 'text-error' : type === 'info' ? 'text-secondary' : 'text-primary-container';

    toast.innerHTML = `
      <span class="material-symbols-outlined ${iconColor}" style="font-variation-settings: 'FILL' 1;">${icon}</span>
      <div class="flex-1 text-on-surface font-body-md text-[14px] font-medium">${message}</div>
      <button class="text-outline hover:text-on-surface p-1 text-sm" onclick="this.parentElement.remove()">
        <span class="material-symbols-outlined text-[16px]">close</span>
      </button>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  renderCurrentView() {
    const state = window.appState.state;
    const appEl = document.getElementById('app-root');
    if (!appEl) return;

    // Render Navigation Header
    const headerEl = document.getElementById('global-header');
    if (headerEl) {
      headerEl.innerHTML = this.getNavbarHTML(state);
    }

    // Render Main Content
    let contentHTML = '';
    switch (state.currentView) {
      case 'home':
        contentHTML = this.getLandingHTML(state);
        break;
      case 'roles':
        contentHTML = this.getRolesHTML(state);
        break;
      case 'login':
        contentHTML = this.getLoginHTML(state);
        break;
      case 'student-dashboard':
        contentHTML = this.getStudentDashboardHTML(state);
        break;
      case 'assessment':
        contentHTML = this.getAssessmentHTML(state);
        break;
      case 'industry-dashboard':
        contentHTML = this.getIndustryDashboardHTML(state);
        break;
      case 'college-dashboard':
        contentHTML = this.getCollegeDashboardHTML(state);
        break;
      case 'ministry-dashboard':
        contentHTML = this.getMinistryDashboardHTML(state);
        break;
      default:
        contentHTML = this.getLandingHTML(state);
    }

    appEl.innerHTML = contentHTML;

    // Render Judge Controller Bar
    this.renderJudgeController(state);

    // Reattach dynamic event listeners
    this.attachEventListeners();
  },

  getNavbarHTML(state) {
    const isFocused = state.currentView === 'assessment';
    return `
      <div class="flex justify-between items-center px-4 md:px-margin-desktop h-20 max-w-container-max mx-auto w-full">
        <!-- Logo & Title -->
        <div class="flex items-center gap-3 cursor-pointer" onclick="AppUI.navigate('home')">
          <div class="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary border border-primary/20">
            <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">spa</span>
          </div>
          <div>
            <span class="font-display-lg-mobile text-[22px] font-bold text-primary tracking-tight">SkillSetu</span>
            <span class="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-primary-container/10 border border-primary/20 text-primary font-label-sm text-[10px]">Ministry of Ayush</span>
          </div>
        </div>

        ${!isFocused ? `
          <!-- Center Nav Links -->
          <nav class="hidden lg:flex items-center gap-6 font-label-md text-label-md">
            <a href="javascript:void(0)" onclick="AppUI.navigate('home')" class="${state.currentView === 'home' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary transition-colors'}">Home</a>
            <a href="javascript:void(0)" onclick="AppUI.navigate('student-dashboard')" class="${state.currentView === 'student-dashboard' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary transition-colors'}">Student</a>
            <a href="javascript:void(0)" onclick="AppUI.navigate('industry-dashboard')" class="${state.currentView === 'industry-dashboard' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary transition-colors'}">Industry</a>
            <a href="javascript:void(0)" onclick="AppUI.navigate('college-dashboard')" class="${state.currentView === 'college-dashboard' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary transition-colors'}">College</a>
            <a href="javascript:void(0)" onclick="AppUI.navigate('ministry-dashboard')" class="${state.currentView === 'ministry-dashboard' ? 'text-primary font-bold border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary transition-colors'}">Ministry Admin</a>
          </nav>

          <!-- Right Action Controls -->
          <div class="flex items-center gap-3">
            <!-- Portal Quick Switcher Dropdown -->
            <div class="relative">
              <select id="role-quick-select" onchange="AppUI.handleRoleSwitch(this.value)" class="bg-surface-container-lowest border border-outline-variant/60 text-on-surface rounded-xl px-3 py-1.5 font-label-sm text-[13px] font-semibold text-primary focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-sm">
                <option value="student" ${state.currentRole === 'student' && state.currentView === 'student-dashboard' ? 'selected' : ''}>🎓 Student View</option>
                <option value="industry" ${state.currentRole === 'industry' && state.currentView === 'industry-dashboard' ? 'selected' : ''}>🏭 Industry Portal</option>
                <option value="college" ${state.currentRole === 'college' && state.currentView === 'college-dashboard' ? 'selected' : ''}>🏛️ College Portal</option>
                <option value="ministry" ${state.currentRole === 'ministry' && state.currentView === 'ministry-dashboard' ? 'selected' : ''}>🇮🇳 Ministry Admin</option>
              </select>
            </div>

            <!-- Notifications -->
            <button onclick="AppUI.showToast('You have 2 new opportunity matches based on your latest GMP benchmark!', 'info')" class="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-variant/50 relative">
              <span class="material-symbols-outlined text-[22px]">notifications</span>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full animate-ping"></span>
              <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full"></span>
            </button>

            <!-- User Avatar & Mini Profile -->
            <div class="flex items-center gap-2 pl-2 border-l border-outline-variant/40 cursor-pointer" onclick="AppUI.navigate('roles')">
              <img src="${state.student.avatar}" alt="${state.student.name}" class="w-9 h-9 rounded-full object-cover border border-primary/30 shadow-sm" />
              <div class="hidden sm:block text-left">
                <div class="font-label-sm text-[13px] font-bold text-on-surface leading-tight">${state.student.name.split(' ')[0]}</div>
                <div class="text-[11px] text-on-surface-variant leading-none">${state.currentRole.toUpperCase()}</div>
              </div>
            </div>
          </div>
        ` : `
          <!-- Assessment focused header -->
          <div class="flex items-center gap-4">
            <span class="text-on-surface-variant font-label-md text-sm">Ayush Skill Benchmark Assessment</span>
            <button onclick="AppUI.navigate('student-dashboard')" class="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        `}
      </div>
    `;
  },

  handleRoleSwitch(role) {
    window.appState.setRole(role);
    this.showToast(`Switched to ${role.toUpperCase()} portal`, 'info');
  },

  // 1. Landing Page HTML
  getLandingHTML(state) {
    const stats = window.SKILLSETU_DATA.stats;
    return `
      <main class="pt-28 pb-20 px-4 md:px-margin-desktop max-w-container-max mx-auto">
        <!-- Hero Section -->
        <section class="flex flex-col items-center text-center mt-6 md:mt-16 mb-20 fade-in-up">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/10 border border-primary/20 text-primary font-label-sm text-label-sm mb-6 shadow-sm">
            <span class="material-symbols-outlined text-[16px]">verified</span>
            Ministry of Ayush Initiative • Smart India Hackathon 2026 (SIH26044)
          </div>
          <h1 class="font-display-lg text-3xl md:text-5xl lg:text-6xl text-on-surface max-w-4xl mb-6 tracking-tight font-extrabold leading-tight">
            Bridging Ayush Education with <span class="text-primary underline decoration-primary-container/40">Industry-Ready Skills</span>
          </h1>
          <p class="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-10 leading-relaxed">
            Empowering the next generation of Ayurveda, Yoga, Unani, Siddha, and Homeopathy professionals through AI-guided skill mapping, diagnostic assessments, bridge learning, and verified placements.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button onclick="AppUI.navigate('student-dashboard')" class="px-8 py-3.5 bg-primary text-white rounded-xl font-label-md text-label-md hover:bg-primary/90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">school</span>
              Explore Student Portal
            </button>
            <button onclick="AppUI.startDemoTour()" class="px-8 py-3.5 glass-panel text-primary rounded-xl font-label-md text-label-md hover:bg-surface-variant/50 transition-all flex items-center justify-center gap-2 border border-primary/20">
              <span class="material-symbols-outlined text-[18px]">play_circle</span>
              Interactive Demo Flow
            </button>
          </div>
        </section>

        <!-- Stats Section -->
        <section class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20 fade-in-up">
          <div class="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center ambient-glow">
            <span class="font-headline-md text-3xl lg:text-4xl text-primary font-bold mb-1">${stats.registeredStudents}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Registered Students</span>
          </div>
          <div class="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center ambient-glow">
            <span class="font-headline-md text-3xl lg:text-4xl text-primary font-bold mb-1">${stats.industryPartners}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Industry Partners</span>
          </div>
          <div class="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center ambient-glow">
            <span class="font-headline-md text-3xl lg:text-4xl text-primary font-bold mb-1">${stats.avgSkillMatch}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Average Skill Match</span>
          </div>
          <div class="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center text-center ambient-glow">
            <span class="font-headline-md text-3xl lg:text-4xl text-primary font-bold mb-1">${stats.skillGapsResolved}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">Skill Gaps Resolved</span>
          </div>
        </section>

        <!-- Ecosystem Flow Infographic -->
        <section class="glass-panel-heavy rounded-2xl p-8 mb-20">
          <div class="text-center mb-8">
            <h2 class="font-headline-sm text-2xl font-bold text-on-surface mb-2">The SkillSetu Collaborative Engine</h2>
            <p class="font-body-md text-on-surface-variant text-sm">How Academia, Industry, and Governance unite to bridge competencies.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            <div class="bg-surface-container-lowest p-5 rounded-xl border border-primary/15 text-center flex flex-col items-center">
              <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 font-bold">1</div>
              <h4 class="font-label-md font-bold text-on-surface mb-1">Academic Intake</h4>
              <p class="text-[12px] text-on-surface-variant">BAMS, MD, BUMS & BHMS student profiling</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl border border-primary/15 text-center flex flex-col items-center">
              <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3 font-bold">2</div>
              <h4 class="font-label-md font-bold text-on-surface mb-1">Skill Assessment</h4>
              <p class="text-[12px] text-on-surface-variant">5-domain clinical & diagnostic evaluation</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl border border-primary/15 text-center flex flex-col items-center">
              <div class="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center mb-3 font-bold">3</div>
              <h4 class="font-label-md font-bold text-on-surface mb-1">Skill-Gap Engine</h4>
              <p class="text-[12px] text-on-surface-variant">Automated gap detection against industry standards</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl border border-primary/15 text-center flex flex-col items-center">
              <div class="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mb-3 font-bold">4</div>
              <h4 class="font-label-md font-bold text-on-surface mb-1">Bridge Learning</h4>
              <p class="text-[12px] text-on-surface-variant">Targeted modular courses (e.g. GMP Schedule T)</p>
            </div>
            <div class="bg-surface-container-lowest p-5 rounded-xl border border-primary/15 text-center flex flex-col items-center">
              <div class="w-12 h-12 rounded-full bg-primary-container/20 text-primary-container flex items-center justify-center mb-3 font-bold">5</div>
              <h4 class="font-label-md font-bold text-on-surface mb-1">Industry Matching</h4>
              <p class="text-[12px] text-on-surface-variant">95%+ matched internship & placement pipelines</p>
            </div>
          </div>
        </section>

        <!-- Portals Bento Grid -->
        <section class="mb-12">
          <div class="text-center mb-12">
            <h2 class="font-headline-md text-3xl font-bold text-on-surface mb-3">Choose Your Portal</h2>
            <p class="font-body-md text-on-surface-variant">Access specialized dashboards and tools designed for your Ayush stakeholder role.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Student Card -->
            <div onclick="AppUI.navigate('student-dashboard')" class="glass-panel p-8 rounded-2xl ambient-glow group hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer border border-primary/15 hover:border-primary/40">
              <div class="w-14 h-14 rounded-xl bg-primary-container/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-3xl">school</span>
              </div>
              <h3 class="font-headline-sm text-xl font-bold text-on-surface mb-2">Student Portal</h3>
              <p class="font-body-md text-sm text-on-surface-variant mb-6 flex-grow">Assess your skills, resolve GMP gaps with bridge courses, and apply to top industry roles.</p>
              <div class="inline-flex items-center gap-2 text-primary font-label-md font-semibold group-hover:gap-3 transition-all">
                Enter Student Portal <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </div>
            </div>

            <!-- Industry Card -->
            <div onclick="AppUI.navigate('industry-dashboard')" class="glass-panel p-8 rounded-2xl ambient-glow group hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer border border-primary/15 hover:border-primary/40">
              <div class="w-14 h-14 rounded-xl bg-primary-container/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-3xl">domain</span>
              </div>
              <h3 class="font-headline-sm text-xl font-bold text-on-surface mb-2">Industry Portal</h3>
              <p class="font-body-md text-sm text-on-surface-variant mb-6 flex-grow">Discover skill-verified Ayush candidates, shortlist talent, and publish internship openings.</p>
              <div class="inline-flex items-center gap-2 text-primary font-label-md font-semibold group-hover:gap-3 transition-all">
                Enter Industry Portal <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </div>
            </div>

            <!-- College Card -->
            <div onclick="AppUI.navigate('college-dashboard')" class="glass-panel p-8 rounded-2xl ambient-glow group hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer border border-primary/15 hover:border-primary/40">
              <div class="w-14 h-14 rounded-xl bg-primary-container/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-3xl">account_balance</span>
              </div>
              <h3 class="font-headline-sm text-xl font-bold text-on-surface mb-2">College & Faculty</h3>
              <p class="font-body-md text-sm text-on-surface-variant mb-6 flex-grow">Analyze student cohort readiness, identify curriculum deficits, and publish bridge courses.</p>
              <div class="inline-flex items-center gap-2 text-primary font-label-md font-semibold group-hover:gap-3 transition-all">
                Enter College Portal <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </div>
            </div>

            <!-- Ministry Card -->
            <div onclick="AppUI.navigate('ministry-dashboard')" class="glass-panel p-8 rounded-2xl ambient-glow group hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer border border-primary/15 hover:border-primary/40">
              <div class="w-14 h-14 rounded-xl bg-primary-container/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                <span class="material-symbols-outlined text-3xl">admin_panel_settings</span>
              </div>
              <h3 class="font-headline-sm text-xl font-bold text-on-surface mb-2">Ministry Admin</h3>
              <p class="font-body-md text-sm text-on-surface-variant mb-6 flex-grow">Monitor nationwide skill heatmaps, track YoY placement rates, and shape national policy.</p>
              <div class="inline-flex items-center gap-2 text-primary font-label-md font-semibold group-hover:gap-3 transition-all">
                Enter Ministry Portal <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
  },

  // 2. Role Selector HTML
  getRolesHTML(state) {
    return `
      <main class="pt-28 pb-20 px-4 md:px-margin-desktop max-w-container-max mx-auto">
        <div class="text-center mb-12 max-w-2xl mx-auto space-y-4">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 text-primary font-label-sm text-xs border border-primary/20">
            Authentication & Role Selection
          </div>
          <h1 class="font-display-lg text-3xl md:text-4xl font-bold text-on-surface">Select Your SkillSetu Portal</h1>
          <p class="font-body-lg text-on-surface-variant text-sm md:text-base">Choose your stakeholder role to access customized dashboards within the Ayush governance ecosystem.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto mb-12">
          <!-- Student -->
          <div onclick="window.appState.setRole('student'); AppUI.navigate('student-dashboard');" class="glass-card rounded-2xl p-8 flex flex-col h-full group cursor-pointer border border-primary/20">
            <div class="w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-3xl">school</span>
            </div>
            <h2 class="font-headline-sm text-xl font-bold text-on-surface mb-2">Student</h2>
            <p class="font-body-md text-xs text-on-surface-variant mb-6 flex-1">Take skill assessments, bridge knowledge gaps, and apply to top industry opportunities.</p>
            <button class="w-full py-2.5 px-4 rounded-xl bg-surface-container-highest text-primary font-label-md text-sm font-semibold group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2">
              Login as Student <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <!-- Industry -->
          <div onclick="window.appState.setRole('industry'); AppUI.navigate('industry-dashboard');" class="glass-card rounded-2xl p-8 flex flex-col h-full group cursor-pointer border border-primary/20">
            <div class="w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-3xl">domain</span>
            </div>
            <h2 class="font-headline-sm text-xl font-bold text-on-surface mb-2">Industry</h2>
            <p class="font-body-md text-xs text-on-surface-variant mb-6 flex-1">Find verified Ayush talent, shortlist candidates, and post internship & job openings.</p>
            <button class="w-full py-2.5 px-4 rounded-xl bg-surface-container-highest text-primary font-label-md text-sm font-semibold group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2">
              Login as Industry <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <!-- College -->
          <div onclick="window.appState.setRole('college'); AppUI.navigate('college-dashboard');" class="glass-card rounded-2xl p-8 flex flex-col h-full group cursor-pointer border border-primary/20">
            <div class="w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-3xl">account_balance</span>
            </div>
            <h2 class="font-headline-sm text-xl font-bold text-on-surface mb-2">College & Faculty</h2>
            <p class="font-body-md text-xs text-on-surface-variant mb-6 flex-1">Track student cohort competencies, analyze deficits, and publish bridge courses.</p>
            <button class="w-full py-2.5 px-4 rounded-xl bg-surface-container-highest text-primary font-label-md text-sm font-semibold group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2">
              Login as Faculty <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <!-- Ministry -->
          <div onclick="window.appState.setRole('ministry'); AppUI.navigate('ministry-dashboard');" class="glass-card rounded-2xl p-8 flex flex-col h-full group cursor-pointer border border-primary/20">
            <div class="w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
              <span class="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>
            <h2 class="font-headline-sm text-xl font-bold text-on-surface mb-2">Ministry Admin</h2>
            <p class="font-body-md text-xs text-on-surface-variant mb-6 flex-1">Access national impact analytics, regional skill-gap heatmaps, and placement trends.</p>
            <button class="w-full py-2.5 px-4 rounded-xl bg-surface-container-highest text-primary font-label-md text-sm font-semibold group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2">
              Login as Admin <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    `;
  },

  // 3. Login / Auth HTML
  getLoginHTML(state) {
    return `
      <main class="pt-24 pb-20 px-4 min-h-screen flex items-center justify-center">
        <div class="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 glass-panel-heavy ambient-glow rounded-2xl overflow-hidden shadow-xl border border-primary/20">
          <!-- Left Panel -->
          <div class="hidden md:flex flex-col justify-between p-10 bg-surface-container-low/60 border-r border-primary/15">
            <div>
              <div class="flex items-center gap-3 mb-6">
                <span class="material-symbols-outlined text-primary text-3xl" style="font-variation-settings: 'FILL' 1;">spa</span>
                <h1 class="font-headline-sm text-2xl font-bold text-primary">SkillSetu</h1>
              </div>
              <h2 class="font-headline-md text-2xl font-bold text-on-surface mb-3">Empowering Ayush Excellence</h2>
              <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">
                Connect your academic training with national industry standards, verified certifications, and career opportunities.
              </p>
            </div>
            <div class="p-4 rounded-xl bg-white/70 border border-primary/15">
              <div class="text-xs font-bold text-primary uppercase tracking-wider mb-1">Demo Quick Roles</div>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <button onclick="window.appState.setRole('student'); AppUI.navigate('student-dashboard');" class="p-2 rounded bg-surface text-left font-medium hover:bg-primary/10 hover:text-primary">🎓 Shubham Rawal (Student)</button>
                <button onclick="window.appState.setRole('industry'); AppUI.navigate('industry-dashboard');" class="p-2 rounded bg-surface text-left font-medium hover:bg-primary/10 hover:text-primary">🏭 Dabur / Patanjali (Industry)</button>
                <button onclick="window.appState.setRole('college'); AppUI.navigate('college-dashboard');" class="p-2 rounded bg-surface text-left font-medium hover:bg-primary/10 hover:text-primary">🏛️ NIA Jaipur (Faculty)</button>
                <button onclick="window.appState.setRole('ministry'); AppUI.navigate('ministry-dashboard');" class="p-2 rounded bg-surface text-left font-medium hover:bg-primary/10 hover:text-primary">🇮🇳 Ayush Admin (Ministry)</button>
              </div>
            </div>
          </div>

          <!-- Right Form Panel -->
          <div class="p-8 md:p-10 flex flex-col justify-center bg-surface-container-lowest">
            <div class="mb-6">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 text-primary mb-3 border border-primary/20 text-xs font-semibold">
                <span class="material-symbols-outlined text-sm">person</span> Ayush Single Sign-On
              </div>
              <h3 class="font-headline-sm text-2xl font-bold text-on-surface">Welcome Back</h3>
              <p class="font-body-md text-xs text-on-surface-variant">Sign in to access your customized dashboard.</p>
            </div>

            <form onsubmit="event.preventDefault(); window.appState.setRole('student'); AppUI.navigate('student-dashboard');" class="space-y-4">
              <div>
                <label class="block font-label-md text-xs text-on-surface mb-1 font-semibold">Email or Ayush ID</label>
                <input type="text" value="shubham.rawal@nia.edu.in" class="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="block font-label-md text-xs text-on-surface font-semibold">Password</label>
                  <a href="javascript:void(0)" class="text-xs text-primary hover:underline">Forgot?</a>
                </div>
                <input type="password" value="••••••••••••" class="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <button type="submit" class="w-full py-3 bg-primary text-white rounded-xl font-label-md text-sm font-semibold hover:bg-primary/90 transition-all shadow-md mt-2">
                Sign In to Dashboard
              </button>
            </form>
          </div>
        </div>
      </main>
    `;
  },

  // 4. Student Dashboard HTML
  getStudentDashboardHTML(state) {
    const student = state.student;
    const radar = window.appState.getRadarCoordinates(student.skills, 100);
    const gmpSkill = student.skills["GMP"];
    const isGmpDeficit = gmpSkill.current < gmpSkill.expected;

    return `
      <main class="pt-28 pb-24 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-8">
        <!-- Welcome Header -->
        <section class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-panel p-6 rounded-2xl">
          <div class="flex items-center gap-4">
            <img src="${student.avatar}" alt="${student.name}" class="w-16 h-16 rounded-full object-cover border-2 border-primary/30 shadow-md" />
            <div>
              <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary-container/10 text-primary text-[11px] font-bold border border-primary/20 mb-1">
                Verified Ayush Student
              </div>
              <h1 class="font-headline-md text-2xl md:text-3xl font-bold text-on-surface">Welcome back, ${student.name}</h1>
              <p class="font-body-md text-sm text-on-surface-variant">${student.program} • ${student.institution}</p>
            </div>
          </div>
          <div class="flex gap-3 self-stretch md:self-auto">
            <div class="bg-surface-container-lowest border border-primary/20 rounded-xl p-3.5 shadow-sm flex-1 md:min-w-[120px] text-center">
              <p class="font-label-sm text-xs text-on-surface-variant font-medium mb-0.5">Overall Match</p>
              <p class="font-headline-sm text-2xl font-bold text-primary">${student.overallMatch}%</p>
            </div>
            <div class="bg-surface-container-lowest border border-primary/20 rounded-xl p-3.5 shadow-sm flex-1 md:min-w-[120px] text-center">
              <p class="font-label-sm text-xs text-on-surface-variant font-medium mb-0.5">Certifications</p>
              <p class="font-headline-sm text-2xl font-bold text-secondary">${student.certificationsCount}</p>
            </div>
          </div>
        </section>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <!-- Skill Radar Chart (Bento Cell) -->
          <div class="xl:col-span-2 glass-panel rounded-2xl p-6 md:p-8 shadow-sm flex flex-col">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 class="font-headline-sm text-xl font-bold text-on-surface">Interactive Skill Assessment Radar</h2>
                <p class="font-body-md text-xs text-on-surface-variant">Real-time competency mapping vs. Ayush Industry baselines</p>
              </div>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-primary-container"></span>
                  <span class="font-label-sm text-xs">Current Skill</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-outline-variant"></span>
                  <span class="font-label-sm text-xs">Industry Baseline</span>
                </div>
                <button onclick="AppUI.navigate('assessment')" class="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1 shadow-sm">
                  <span class="material-symbols-outlined text-sm">quiz</span> Take Assessment
                </button>
              </div>
            </div>

            <!-- Radar SVG Container -->
            <div class="flex-1 min-h-[360px] relative rounded-xl border border-primary/10 bg-background/60 flex items-center justify-center p-4">
              <svg class="w-full h-full max-w-[440px] max-h-[440px]" viewBox="0 0 100 100">
                <!-- Concentric Web Polygons (20%, 40%, 60%, 80%, 100%) -->
                <polygon fill="none" points="50,10 84.6,30 84.6,70 50,90 15.4,70 15.4,30" stroke="#bbcabf" stroke-width="0.3" stroke-dasharray="1,1"></polygon>
                <polygon fill="none" points="50,18 77.7,34 77.7,66 50,82 22.3,66 22.3,34" stroke="#bbcabf" stroke-width="0.3"></polygon>
                <polygon fill="none" points="50,26 70.8,38 70.8,62 50,74 29.2,62 29.2,38" stroke="#bbcabf" stroke-width="0.3"></polygon>
                <polygon fill="none" points="50,34 63.9,42 63.9,58 50,66 36.1,58 36.1,42" stroke="#bbcabf" stroke-width="0.3"></polygon>
                <polygon fill="none" points="50,42 56.9,46 56.9,54 50,58 43.1,54 43.1,46" stroke="#bbcabf" stroke-width="0.3"></polygon>

                <!-- Axis Lines -->
                <line x1="50" y1="50" x2="50" y2="10" stroke="#bbcabf" stroke-width="0.4"></line>
                <line x1="50" y1="50" x2="84.6" y2="30" stroke="#bbcabf" stroke-width="0.4"></line>
                <line x1="50" y1="50" x2="84.6" y2="70" stroke="#bbcabf" stroke-width="0.4"></line>
                <line x1="50" y1="50" x2="50" y2="90" stroke="#bbcabf" stroke-width="0.4"></line>
                <line x1="50" y1="50" x2="15.4" y2="70" stroke="#bbcabf" stroke-width="0.4"></line>
                <line x1="50" y1="50" x2="15.4" y2="30" stroke="#bbcabf" stroke-width="0.4"></line>

                <!-- Industry Expected Polygon (Dashed Grey) -->
                <polygon points="${radar.expectedPolygon}" fill="none" stroke="#6c7a71" stroke-width="1.2" stroke-dasharray="2,1.5"></polygon>

                <!-- Current Skill Polygon (Emerald Gradient Fill) -->
                <polygon class="radar-polygon" points="${radar.currentPolygon}" fill="rgba(16, 185, 129, 0.28)" stroke="#006c49" stroke-width="1.8"></polygon>

                <!-- Axis Labels with Score Badges -->
                <text x="50" y="6" text-anchor="middle" font-family="Inter" font-size="3.2" font-weight="600" fill="#161d19">Panchakarma (${student.skills.Panchakarma.current}%)</text>
                <text x="88" y="29" text-anchor="start" font-family="Inter" font-size="3.2" font-weight="600" fill="#161d19">Herbology (${student.skills.Herbology.current}%)</text>
                <text x="88" y="73" text-anchor="start" font-family="Inter" font-size="3.2" font-weight="600" fill="#161d19">Patient Care (${student.skills.PatientCare.current}%)</text>
                <text x="50" y="97" text-anchor="middle" font-family="Inter" font-size="3.2" font-weight="600" fill="#161d19">Diagnostics (${student.skills.Diagnostics.current}%)</text>
                <text x="12" y="73" text-anchor="end" font-family="Inter" font-size="3.2" font-weight="600" fill="${isGmpDeficit ? '#ba1a1a' : '#006c49'}">GMP (${student.skills.GMP.current}%) ${isGmpDeficit ? '⚠️' : '✓'}</text>
                <text x="12" y="29" text-anchor="end" font-family="Inter" font-size="3.2" font-weight="600" fill="#161d19">Research (${student.skills.Research.current}%)</text>
              </svg>
            </div>
          </div>

          <!-- Right Column: Skill Gap Alert & Quick Stats -->
          <div class="flex flex-col gap-6">
            <!-- Skill Gap Card -->
            <div class="glass-panel-heavy rounded-2xl p-6 relative overflow-hidden ${isGmpDeficit ? 'border-tertiary-container/50 ambient-glow-error' : 'border-primary/30'}">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full ${isGmpDeficit ? 'bg-error-container text-error' : 'bg-primary-container/20 text-primary'} flex items-center justify-center font-bold">
                  <span class="material-symbols-outlined text-xl">${isGmpDeficit ? 'warning' : 'verified'}</span>
                </div>
                <div>
                  <h3 class="font-headline-sm text-lg font-bold text-on-surface">${isGmpDeficit ? 'Skill Gap Detected' : 'All Baselines Satisfied'}</h3>
                  <span class="text-[11px] text-on-surface-variant">${isGmpDeficit ? 'Requires Bridge Certification' : 'Ready for Formulation Placements'}</span>
                </div>
              </div>
              
              <p class="font-body-md text-xs text-on-surface-variant mb-4 leading-relaxed">
                ${isGmpDeficit 
                  ? `Your proficiency in <strong>GMP Compliance & Schedule T</strong> is currently at <strong>${gmpSkill.current}%</strong> (Industry requirement is <strong>${gmpSkill.expected}%</strong>). This restricts direct placement into commercial Ayurvedic manufacturing roles.`
                  : `Your <strong>GMP Compliance (Schedule T)</strong> is verified at <strong>${gmpSkill.current}%</strong>. Your profile is ranked in the top 5% of candidate matches for manufacturing partners.`
                }
              </p>

              <div class="bg-surface/70 rounded-xl p-3.5 mb-5 border border-outline-variant/40">
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-on-surface-variant">GMP Readiness</span>
                  <span class="${isGmpDeficit ? 'text-error' : 'text-primary'}">${gmpSkill.current}% / ${gmpSkill.expected}%</span>
                </div>
                <div class="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                  <div class="${isGmpDeficit ? 'bg-error' : 'bg-primary-container'} h-2 rounded-full transition-all duration-500" style="width: ${gmpSkill.current}%"></div>
                </div>
              </div>

              ${isGmpDeficit ? `
                <button onclick="AppUI.openBridgeCourseModal('BC-GMP-101')" class="w-full py-3 bg-primary text-white rounded-xl font-label-md text-xs font-semibold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-sm">auto_stories</span>
                  Explore Bridge Course (GMP Compliance)
                </button>
              ` : `
                <div class="p-3 rounded-xl bg-primary-container/10 border border-primary-container/30 text-primary text-xs font-semibold flex items-center gap-2">
                  <span class="material-symbols-outlined text-base">check_circle</span> Bridge Course Completed • Verified
                </div>
              `}
            </div>

            <!-- Verified Badges -->
            <div class="glass-panel rounded-2xl p-6">
              <h3 class="font-headline-sm text-base font-bold text-on-surface mb-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-lg">verified</span> Verified Competency Badges
              </h3>
              <div class="flex flex-col gap-2">
                ${student.verifiedBadges.map(b => `
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-lowest border border-primary/15">
                    <div>
                      <div class="font-label-md text-xs font-bold text-on-surface">${b.name}</div>
                      <div class="text-[10px] text-on-surface-variant">${b.issuer} • ${b.date}</div>
                    </div>
                    <span class="material-symbols-outlined text-primary text-base">shield_with_heart</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Opportunity Matching Section -->
        <section class="mt-4">
          <div class="flex justify-between items-end mb-6">
            <div>
              <div class="inline-flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <span class="material-symbols-outlined text-sm">target</span> AI Skill-Match Engine
              </div>
              <h2 class="font-headline-md text-2xl font-bold text-on-surface">Industry Opportunities</h2>
              <p class="font-body-md text-xs text-on-surface-variant">Top positions ranked by your verified skill compatibility</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${state.opportunities.map(opp => {
              const appInfo = state.applications[opp.id] || { applied: false, status: "Not Applied" };
              const currentMatch = gmpSkill.current >= 78 ? opp.boostedMatch : opp.initialMatch;
              return `
                <div class="glass-card rounded-2xl p-6 flex flex-col justify-between h-full border border-primary/15 hover:border-primary/40 relative">
                  <div>
                    <div class="flex justify-between items-start mb-4">
                      <div class="w-12 h-12 rounded-xl bg-white border border-outline-variant/40 flex items-center justify-center p-2 shadow-sm">
                        ${opp.logo ? `<img src="${opp.logo}" alt="${opp.company}" class="w-full h-full object-contain" />` : `<span class="font-bold text-primary text-sm">${opp.company.slice(0, 2).toUpperCase()}</span>`}
                      </div>
                      <div class="px-3 py-1 ${currentMatch >= 90 ? 'bg-primary-container/20 text-primary border-primary/30' : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'} rounded-full font-label-sm text-xs font-bold flex items-center gap-1 border">
                        <span class="material-symbols-outlined text-sm">verified</span> ${currentMatch}% Match
                      </div>
                    </div>
                    
                    <h3 class="font-headline-sm text-lg font-bold text-on-surface mb-1">${opp.role}</h3>
                    <p class="font-body-md text-xs text-on-surface-variant mb-3">${opp.company} • ${opp.location}</p>
                    <p class="font-body-md text-xs text-on-surface-variant/80 mb-4 line-clamp-2">${opp.description}</p>
                    
                    <div class="flex flex-wrap gap-1.5 mb-6">
                      ${opp.requiredSkills.map(s => {
                        const isSatisfied = (s === 'GMP Compliance' || s === 'GMP') ? gmpSkill.current >= 78 : true;
                        return `
                          <span class="px-2.5 py-1 rounded-lg text-[11px] font-semibold ${isSatisfied ? 'bg-primary-container/10 text-primary border border-primary/20' : 'bg-error-container/20 text-error border border-error/20'}">
                            ${s} ${isSatisfied ? '✓' : '⚠️'}
                          </span>
                        `;
                      }).join('')}
                    </div>
                  </div>

                  <div class="pt-4 border-t border-outline-variant/30 flex items-center justify-between">
                    <div>
                      <div class="text-[10px] text-on-surface-variant">Compensation</div>
                      <div class="text-xs font-bold text-on-surface">${opp.stipend}</div>
                    </div>
                    ${appInfo.applied ? `
                      <span class="px-4 py-2 rounded-xl bg-primary-container/20 text-primary font-label-md text-xs font-bold flex items-center gap-1 border border-primary/30">
                        <span class="material-symbols-outlined text-sm">check_circle</span> Applied
                      </span>
                    ` : `
                      <button onclick="AppUI.handleApplyOpportunity('${opp.id}')" class="px-5 py-2 rounded-xl bg-primary text-white font-label-md text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1">
                        Apply Now <span class="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>
      </main>
    `;
  },

  // 5. Skill Assessment HTML
  getAssessmentHTML(state) {
    const questions = window.SKILLSETU_DATA.assessmentQuestions;
    const currentQ = questions[this.currentQuestionIndex] || questions[0];
    const totalQ = questions.length;
    const selected = this.assessmentAnswers[currentQ.id];
    const isCompleted = state.assessment.completed;

    if (isCompleted) {
      return `
        <main class="pt-28 pb-20 px-4 max-w-2xl mx-auto flex flex-col items-center text-center">
          <div class="glass-panel-heavy rounded-2xl p-8 md:p-12 w-full ambient-glow border border-primary/30">
            <div class="w-20 h-20 mx-auto mb-6 bg-primary-container/20 rounded-full flex items-center justify-center text-primary-container">
              <span class="material-symbols-outlined text-5xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
            </div>
            <h2 class="font-display-lg text-3xl font-bold text-on-surface mb-2">Assessment Complete!</h2>
            <p class="font-body-lg text-sm text-on-surface-variant mb-6">Your responses have been benchmarked against the Ayush National Skill Registry.</p>
            
            <div class="glass-panel rounded-2xl p-6 mb-8 inline-block border border-primary/20 w-full max-w-sm">
              <div class="text-5xl font-extrabold text-primary mb-1">${state.assessment.percentage}%</div>
              <div class="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Diagnostic Score (${state.assessment.score} / ${state.assessment.total} Correct)</div>
            </div>

            <div class="p-4 rounded-xl bg-surface-container-lowest border border-primary/15 text-left mb-8 text-xs space-y-2">
              <div class="font-bold text-primary flex items-center gap-1">
                <span class="material-symbols-outlined text-base">insights</span> Competency Feedback:
              </div>
              <p class="text-on-surface-variant">✓ Strong conceptual mastery in <strong>Tridosha Diagnostics & Dravyaguna Herbology</strong>.</p>
              <p class="${state.student.skills.GMP.current < 78 ? 'text-error font-medium' : 'text-primary font-medium'}">
                ${state.student.skills.GMP.current < 78 
                  ? '⚠️ <strong>GMP Compliance (Schedule T)</strong> requires bridge upskilling before industrial formulation clearance.'
                  : '✓ <strong>GMP Schedule T Compliance</strong> validated for pharmaceutical manufacturing.'
                }
              </p>
            </div>

            <div class="flex flex-col sm:flex-row justify-center gap-4">
              <button onclick="AppUI.currentQuestionIndex = 0; AppUI.assessmentAnswers = {}; window.appState.state.assessment.completed = false; AppUI.renderCurrentView();" class="px-6 py-3 border border-outline-variant text-on-surface font-label-md text-xs font-semibold rounded-xl hover:bg-surface-variant transition-colors">
                Retake Assessment
              </button>
              <button onclick="AppUI.navigate('student-dashboard')" class="px-8 py-3 bg-primary text-white font-label-md text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md">
                Return to Dashboard
              </button>
            </div>
          </div>
        </main>
      `;
    }

    const progressPct = ((this.currentQuestionIndex + 1) / totalQ) * 100;

    return `
      <main class="pt-28 pb-20 px-4 max-w-3xl mx-auto flex flex-col items-center">
        <div class="glass-panel-heavy rounded-2xl shadow-xl w-full p-6 md:p-10 relative overflow-hidden border border-primary/20">
          <!-- Progress Header -->
          <div class="mb-8">
            <div class="flex justify-between items-center mb-3">
              <span class="font-label-md text-xs font-bold text-primary uppercase tracking-wider">${currentQ.domain}</span>
              <span class="font-label-md text-xs text-on-surface-variant font-semibold">Question ${this.currentQuestionIndex + 1} of ${totalQ}</span>
            </div>
            <div class="h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div class="h-full bg-primary-container rounded-full transition-all duration-300" style="width: ${progressPct}%"></div>
            </div>
          </div>

          <!-- Question Content -->
          <h2 class="font-headline-sm text-lg md:text-xl font-bold text-on-surface mb-6 leading-relaxed">
            ${currentQ.question}
          </h2>

          <!-- Options -->
          <div class="flex flex-col gap-3 mb-8">
            ${currentQ.options.map((opt, idx) => {
              const isSelected = selected === idx;
              return `
                <button onclick="AppUI.selectAssessmentOption(${currentQ.id}, ${idx})" class="assessment-option text-left p-4 md:p-5 rounded-xl border ${isSelected ? 'selected' : 'border-outline-variant/60 bg-surface-container-lowest hover:border-primary/40'} transition-all flex items-center justify-between group">
                  <span class="font-body-md text-xs md:text-sm text-on-surface leading-normal flex-1 pr-4">${opt.text}</span>
                  <div class="w-5 h-5 rounded-full border-2 ${isSelected ? 'border-primary-container bg-primary-container' : 'border-outline-variant group-hover:border-primary'} flex items-center justify-center shrink-0">
                    ${isSelected ? `<span class="material-symbols-outlined text-white text-xs">check</span>` : ''}
                  </div>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Navigation Controls -->
          <div class="flex justify-between items-center pt-4 border-t border-outline-variant/30">
            <button onclick="AppUI.prevQuestion()" ${this.currentQuestionIndex === 0 ? 'disabled class="opacity-40 cursor-not-allowed"' : ''} class="px-5 py-2.5 border border-outline-variant text-on-surface font-label-md text-xs font-semibold rounded-xl hover:bg-surface-variant transition-colors flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">arrow_back</span> Previous
            </button>

            ${this.currentQuestionIndex === totalQ - 1 ? `
              <button onclick="AppUI.submitAssessmentQuiz()" ${selected === undefined ? 'disabled class="opacity-50 cursor-not-allowed px-7 py-2.5 bg-primary text-white rounded-xl font-label-md text-xs font-semibold"' : 'class="px-7 py-2.5 bg-primary text-white rounded-xl font-label-md text-xs font-semibold hover:bg-primary/90 shadow-md transition-all flex items-center gap-1"'} >
                Submit Assessment <span class="material-symbols-outlined text-sm">check</span>
              </button>
            ` : `
              <button onclick="AppUI.nextQuestion()" ${selected === undefined ? 'disabled class="opacity-50 cursor-not-allowed px-7 py-2.5 bg-primary text-white rounded-xl font-label-md text-xs font-semibold"' : 'class="px-7 py-2.5 bg-primary text-white rounded-xl font-label-md text-xs font-semibold hover:bg-primary/90 shadow-md transition-all flex items-center gap-1"'} >
                Next Question <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            `}
          </div>
        </div>
      </main>
    `;
  },

  selectAssessmentOption(qId, optionIndex) {
    this.assessmentAnswers[qId] = optionIndex;
    this.renderCurrentView();
  },

  nextQuestion() {
    const questions = window.SKILLSETU_DATA.assessmentQuestions;
    if (this.currentQuestionIndex < questions.length - 1) {
      this.currentQuestionIndex++;
      this.renderCurrentView();
    }
  },

  prevQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.renderCurrentView();
    }
  },

  submitAssessmentQuiz() {
    const scorePct = window.appState.submitAssessment(this.assessmentAnswers);
    this.showToast(`Assessment submitted! Score: ${scorePct}%`, 'success');
  },

  // 6. Bridge Course Interactive Modal
  openBridgeCourseModal(courseId = "BC-GMP-101") {
    const course = window.appState.state.bridgeCourses.find(c => c.id === courseId) || window.SKILLSETU_DATA.bridgeCourses[0];
    const isAlreadyCompleted = window.appState.state.bridgeCourseCompleted;

    const modalHTML = `
      <div id="bridge-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm fade-in">
        <div class="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-primary/30 flex flex-col max-h-[90vh]">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">auto_stories</span>
              <h2 class="font-headline-sm text-lg font-bold text-on-surface">${course.title}</h2>
            </div>
            <button onclick="document.getElementById('bridge-modal').remove()" class="text-outline hover:text-on-surface p-1">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto space-y-5 text-xs text-on-surface-variant">
            <div class="flex flex-wrap gap-4 p-3.5 bg-primary-container/10 border border-primary/20 rounded-xl text-on-surface">
              <div><strong>Category:</strong> ${course.category}</div>
              <div><strong>Duration:</strong> ${course.duration}</div>
              <div><strong>Instructor:</strong> ${course.instructor}</div>
            </div>

            <div>
              <h4 class="font-label-md text-sm font-bold text-on-surface mb-1">Course Overview & Objective</h4>
              <p class="leading-relaxed">${course.description}</p>
            </div>

            <!-- Syllabus / Modules Checklist -->
            <div>
              <h4 class="font-label-md text-sm font-bold text-on-surface mb-2">Curriculum Modules</h4>
              <div class="space-y-2">
                ${course.modules.map((m, idx) => `
                  <div class="flex items-center justify-between p-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
                    <div class="flex items-center gap-2.5">
                      <span class="material-symbols-outlined ${isAlreadyCompleted || idx === 0 ? 'text-primary' : 'text-outline'} text-base">
                        ${isAlreadyCompleted || idx === 0 ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span class="font-medium text-on-surface">${m.title}</span>
                    </div>
                    <span class="text-[11px] text-outline">${m.duration}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Simulated Learning Progress Bar -->
            <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
              <div class="flex justify-between font-bold mb-1 text-on-surface">
                <span>Simulation Completion Status</span>
                <span id="course-progress-text" class="text-primary">${isAlreadyCompleted ? '100% Completed' : '0% In Progress'}</span>
              </div>
              <div class="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                <div id="course-progress-bar" class="bg-primary-container h-2 rounded-full transition-all duration-700" style="width: ${isAlreadyCompleted ? '100%' : '0%'}"></div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-4 border-t border-outline-variant/40 flex justify-end gap-3 bg-surface-container-low">
            <button onclick="document.getElementById('bridge-modal').remove()" class="px-4 py-2 border border-outline-variant rounded-xl font-label-md text-xs font-semibold hover:bg-surface-variant transition-colors">
              Close
            </button>
            ${isAlreadyCompleted ? `
              <button disabled class="px-6 py-2 bg-primary-container/30 text-primary font-label-md text-xs font-bold rounded-xl flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">verified</span> Certificate Issued
              </button>
            ` : `
              <button id="btn-complete-course" onclick="AppUI.simulateCourseCompletion('${course.id}')" class="px-6 py-2 bg-primary text-white font-label-md text-xs font-semibold rounded-xl hover:bg-primary/90 shadow-md transition-all flex items-center gap-1">
                <span class="material-symbols-outlined text-sm">school</span> Start & Complete Module
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  simulateCourseCompletion(courseId) {
    const btn = document.getElementById('btn-complete-course');
    const pBar = document.getElementById('course-progress-bar');
    const pText = document.getElementById('course-progress-text');

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">sync</span> Validating Module...`;
    }

    if (pBar) pBar.style.width = '60%';
    if (pText) pText.textContent = '60% Processing Schedule T Audit...';

    setTimeout(() => {
      if (pBar) pBar.style.width = '100%';
      if (pText) pText.textContent = '100% Certified!';

      setTimeout(() => {
        window.appState.completeBridgeCourse(courseId);
        const modal = document.getElementById('bridge-modal');
        if (modal) modal.remove();
        AppUI.showToast("🎉 Bridge Course Completed! GMP Skill boosted from 42% to 85%. Dabur match upgraded to 95%!", "success");
      }, 700);
    }, 900);
  },

  // 7. Industry Dashboard HTML
  getIndustryDashboardHTML(state) {
    const candidates = state.candidates.filter(c => {
      const matchesDiscipline = !this.activeFilterDiscipline || c.discipline === this.activeFilterDiscipline;
      const matchesDegree = !this.activeFilterDegree || c.degree === this.activeFilterDegree;
      const matchesSearch = !this.searchQuery || c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || c.verifiedSkills.some(s => s.toLowerCase().includes(this.searchQuery.toLowerCase()));
      return matchesDiscipline && matchesDegree && matchesSearch;
    });

    return `
      <main class="pt-28 pb-20 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container/20 text-on-secondary-container rounded-md font-label-sm text-xs border border-secondary-container/30 mb-2">
              <span class="material-symbols-outlined text-sm text-primary">domain</span> Industry Talent Discovery
            </div>
            <h1 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">Find Skill-Ready Ayush Talent</h1>
            <p class="font-body-lg text-xs md:text-sm text-on-surface-variant">Direct pipeline to certified practitioners, clinical trial investigators, and quality controllers.</p>
          </div>
          <button onclick="AppUI.openPostOpportunityModal()" class="px-5 py-2.5 bg-primary text-white font-label-md text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md flex items-center gap-1.5 shrink-0">
            <span class="material-symbols-outlined text-sm">add_circle</span> Post New Opportunity
          </button>
        </div>

        <!-- Search & Filters -->
        <div class="glass-panel rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <div class="relative w-full md:flex-1">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
            <input type="text" value="${this.searchQuery}" oninput="AppUI.searchQuery = this.value; AppUI.renderCurrentView();" placeholder="Search by name, skill (e.g. Herbology, GMP, Panchakarma)..." class="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs focus:ring-2 focus:ring-primary/20 text-on-surface" />
          </div>
          <div class="flex gap-3 w-full md:w-auto">
            <select onchange="AppUI.activeFilterDiscipline = this.value; AppUI.renderCurrentView();" class="bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface font-medium cursor-pointer">
              <option value="">All Disciplines</option>
              <option value="ayurveda" ${this.activeFilterDiscipline === 'ayurveda' ? 'selected' : ''}>Ayurveda</option>
              <option value="yoga" ${this.activeFilterDiscipline === 'yoga' ? 'selected' : ''}>Yoga</option>
              <option value="unani" ${this.activeFilterDiscipline === 'unani' ? 'selected' : ''}>Unani</option>
            </select>
            <select onchange="AppUI.activeFilterDegree = this.value; AppUI.renderCurrentView();" class="bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-3 py-2 text-xs text-on-surface font-medium cursor-pointer">
              <option value="">All Degrees</option>
              <option value="bams" ${this.activeFilterDegree === 'bams' ? 'selected' : ''}>BAMS</option>
              <option value="mday" ${this.activeFilterDegree === 'mday' ? 'selected' : ''}>MD (Ayurveda)</option>
              <option value="bums" ${this.activeFilterDegree === 'bums' ? 'selected' : ''}>BUMS</option>
            </select>
          </div>
        </div>

        <!-- Candidate Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${candidates.map(c => `
            <div class="glass-card rounded-2xl p-6 flex flex-col justify-between h-full border border-primary/15 hover:border-primary/40 relative">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-container to-secondary-container rounded-t-2xl"></div>
              
              <div>
                <div class="flex justify-between items-start mb-4">
                  <div class="flex items-center gap-3">
                    ${c.avatar ? `
                      <img src="${c.avatar}" alt="${c.name}" class="w-12 h-12 rounded-full object-cover border border-primary/20 shadow-sm" />
                    ` : `
                      <div class="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-outline">
                        <span class="material-symbols-outlined text-2xl">person</span>
                      </div>
                    `}
                    <div>
                      <h3 class="font-headline-sm text-base font-bold text-on-surface">${c.name}</h3>
                      <p class="text-xs text-on-surface-variant">${c.education}</p>
                    </div>
                  </div>
                  <div class="flex flex-col items-end">
                    <span class="px-2.5 py-0.5 rounded-full bg-primary-container/10 border border-primary-container/30 text-primary font-bold text-xs">${c.match}%</span>
                    <span class="text-[10px] text-outline mt-0.5 font-medium">Match</span>
                  </div>
                </div>

                <div class="text-[11px] text-on-surface-variant mb-3 flex items-center gap-1">
                  <span class="material-symbols-outlined text-xs">school</span> ${c.institution}
                </div>

                <div class="mb-4">
                  <div class="text-[10px] uppercase font-bold text-on-surface-variant mb-1.5">Verified Skill Badges</div>
                  <div class="flex flex-wrap gap-1.5">
                    ${c.verifiedSkills.map(s => `
                      <span class="px-2 py-0.5 rounded-md bg-surface-container border border-outline-variant/40 text-[11px] font-medium text-on-surface flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px] text-primary">verified</span> ${s}
                      </span>
                    `).join('')}
                  </div>
                </div>
              </div>

              <div class="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full ${c.status.includes('Applied') ? 'bg-primary-container animate-pulse' : 'bg-primary'}"></span>
                  <span class="text-[11px] font-semibold text-on-surface">${c.status}</span>
                </div>
                <div class="flex items-center gap-2">
                  <button onclick="AppUI.toggleCandidateShortlist('${c.id}')" class="px-3 py-1 rounded-lg text-xs font-semibold ${c.shortlisted ? 'bg-secondary text-white' : 'border border-outline-variant text-on-surface hover:bg-surface-variant'} transition-colors">
                    ${c.shortlisted ? '★ Shortlisted' : '☆ Shortlist'}
                  </button>
                  <button onclick="AppUI.openCandidateProfileModal('${c.id}')" class="text-primary font-semibold text-xs hover:underline flex items-center gap-0.5">
                    Profile <span class="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </main>
    `;
  },

  toggleCandidateShortlist(candId) {
    const isShortlisted = window.appState.toggleShortlistCandidate(candId);
    this.showToast(isShortlisted ? "Candidate shortlisted for interview." : "Removed from shortlist.", "info");
  },

  openCandidateProfileModal(candId) {
    const cand = window.appState.state.candidates.find(c => c.id === candId);
    if (!cand) return;

    const modalHTML = `
      <div id="cand-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm fade-in">
        <div class="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-primary/30 flex flex-col">
          <div class="px-6 py-4 border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low">
            <h2 class="font-headline-sm text-base font-bold text-on-surface">Verified Candidate Dossier</h2>
            <button onclick="document.getElementById('cand-modal').remove()" class="text-outline hover:text-on-surface p-1">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-6 space-y-4 text-xs">
            <div class="flex items-center gap-4">
              ${cand.avatar ? `<img src="${cand.avatar}" class="w-16 h-16 rounded-full object-cover border border-primary/30" />` : `<div class="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center"><span class="material-symbols-outlined text-3xl text-outline">person</span></div>`}
              <div>
                <h3 class="font-headline-sm text-lg font-bold text-on-surface">${cand.name}</h3>
                <p class="text-on-surface-variant font-medium">${cand.education} • ${cand.institution}</p>
                <div class="text-primary font-bold mt-0.5">Skill Match: ${cand.match}% • GPA: ${cand.gpa}</div>
              </div>
            </div>
            <div class="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-1">
              <div><strong>Clinical Experience:</strong> ${cand.experience}</div>
              <div><strong>Email:</strong> ${cand.email}</div>
              <div><strong>Contact:</strong> ${cand.phone}</div>
            </div>
            <div>
              <div class="font-bold text-on-surface mb-1.5 uppercase text-[10px]">Verified Technical Competencies</div>
              <div class="flex flex-wrap gap-1.5">
                ${cand.verifiedSkills.map(s => `
                  <span class="px-2.5 py-1 bg-primary-container/10 text-primary border border-primary/20 rounded-lg text-xs font-semibold">✓ ${s}</span>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-outline-variant/40 flex justify-end gap-2 bg-surface-container-low">
            <button onclick="document.getElementById('cand-modal').remove()" class="px-4 py-2 border border-outline-variant rounded-xl font-label-md text-xs font-semibold">Close</button>
            <button onclick="document.getElementById('cand-modal').remove(); AppUI.showToast('Interview invitation dispatched to candidate!', 'success');" class="px-5 py-2 bg-primary text-white rounded-xl font-label-md text-xs font-semibold hover:bg-primary/90">
              Invite to Interview
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  openPostOpportunityModal() {
    const modalHTML = `
      <div id="post-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm fade-in">
        <div class="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-primary/30 flex flex-col">
          <div class="px-6 py-4 border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low">
            <h2 class="font-headline-sm text-base font-bold text-on-surface">Post New Industry Opportunity</h2>
            <button onclick="document.getElementById('post-modal').remove()" class="text-outline hover:text-on-surface p-1">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <form onsubmit="event.preventDefault(); AppUI.handlePostOpportunitySubmit(this);" class="p-6 space-y-3.5 text-xs">
            <div>
              <label class="block font-semibold text-on-surface mb-1">Company / Organization</label>
              <input name="company" required value="Dabur India Ltd" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs" />
            </div>
            <div>
              <label class="block font-semibold text-on-surface mb-1">Role Title</label>
              <input name="role" required placeholder="e.g. Senior Formulation Scientist" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-on-surface mb-1">Location</label>
                <input name="location" value="Noida / Delhi NCR" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs" />
              </div>
              <div>
                <label class="block font-semibold text-on-surface mb-1">Stipend / CTC</label>
                <input name="stipend" value="₹35,000 / month" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs" />
              </div>
            </div>
            <div>
              <label class="block font-semibold text-on-surface mb-1">Required Skills (Comma separated)</label>
              <input name="skills" value="GMP Compliance, Herbology, Quality Control" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs" />
            </div>
            <div>
              <label class="block font-semibold text-on-surface mb-1">Description</label>
              <textarea name="description" rows="2" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs" placeholder="Role expectations and qualifications..."></textarea>
            </div>
            <div class="pt-3 border-t border-outline-variant/40 flex justify-end gap-2">
              <button type="button" onclick="document.getElementById('post-modal').remove()" class="px-4 py-2 border border-outline-variant rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90">Publish Opportunity</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  handlePostOpportunitySubmit(form) {
    const company = form.company.value;
    const role = form.role.value;
    const location = form.location.value;
    const stipend = form.stipend.value;
    const skills = form.skills.value.split(',').map(s => s.trim());
    const description = form.description.value;

    window.appState.addOpportunity({
      company, role, location, stipend, requiredSkills: skills, description
    });

    const modal = document.getElementById('post-modal');
    if (modal) modal.remove();

    this.showToast(`Opportunity "${role}" published successfully!`, "success");
  },

  // 8. College & Faculty Portal HTML
  getCollegeDashboardHTML(state) {
    const col = window.SKILLSETU_DATA.collegeMetrics;
    return `
      <main class="pt-28 pb-20 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full">
        <header class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-container/10 text-primary rounded-md font-label-sm text-xs border border-primary/20 mb-2">
              <span class="material-symbols-outlined text-sm">account_balance</span> Institutional Intelligence
            </div>
            <h1 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">College & Faculty Portal</h1>
            <p class="font-body-lg text-xs md:text-sm text-on-surface-variant">${col.institutionName} • ${col.location}</p>
          </div>
          <button onclick="AppUI.openCreateBridgeCourseModal()" class="px-5 py-2.5 bg-primary text-white font-label-md text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-md flex items-center gap-1.5 shrink-0">
            <span class="material-symbols-outlined text-sm">add</span> Create Bridge Course
          </button>
        </header>

        <!-- Metric Cards -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">Avg. Student Readiness</p>
                <h2 class="font-headline-md text-3xl font-bold text-primary">${col.avgStudentReadiness}%</h2>
              </div>
              <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span class="material-symbols-outlined">trending_up</span>
              </div>
            </div>
            <div class="w-full bg-surface-variant rounded-full h-2 mt-4">
              <div class="bg-primary h-2 rounded-full" style="width: ${col.avgStudentReadiness}%"></div>
            </div>
          </div>

          <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">Industry Demand Match</p>
                <h2 class="font-headline-md text-3xl font-bold text-secondary">${col.industryDemandMatch}%</h2>
              </div>
              <div class="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <span class="material-symbols-outlined">work</span>
              </div>
            </div>
            <p class="font-label-sm text-xs text-error mt-2 flex items-center gap-1 font-semibold">
              <span class="material-symbols-outlined text-[16px]">warning</span> Needs GMP Bridge Module
            </p>
          </div>

          <div class="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider mb-1 font-semibold">Active Students</p>
                <h2 class="font-headline-md text-3xl font-bold text-on-surface">${col.activeStudents.toLocaleString()}</h2>
              </div>
              <div class="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant">
                <span class="material-symbols-outlined">group</span>
              </div>
            </div>
            <p class="font-label-sm text-xs text-primary mt-2 flex items-center gap-1 font-semibold">
              <span class="material-symbols-outlined text-[16px]">arrow_upward</span> ${col.semesterGrowth} this semester
            </p>
          </div>
        </section>

        <!-- Detailed Analysis -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Skill Gaps Panel -->
          <section class="glass-panel rounded-2xl p-6 md:p-8">
            <h3 class="font-headline-sm text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">analytics</span> Top Curriculum Skill Gaps
            </h3>
            <div class="space-y-5">
              ${col.topSkillGaps.map(g => `
                <div>
                  <div class="flex justify-between font-label-md text-xs mb-1.5">
                    <span class="text-on-surface font-semibold">${g.skill}</span>
                    <span class="text-error font-bold">${g.deficit}% Deficit</span>
                  </div>
                  <div class="w-full bg-surface-variant rounded-full h-2 flex overflow-hidden">
                    <div class="bg-primary h-2" style="width: ${g.readiness}%"></div>
                    <div class="bg-error/40 h-2" style="width: ${g.deficit}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </section>

          <!-- Recommended Actions -->
          <section class="glass-panel rounded-2xl p-6 md:p-8 flex flex-col">
            <h3 class="font-headline-sm text-lg font-bold text-on-surface mb-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">lightbulb</span> Faculty Action Directives
            </h3>
            <p class="font-body-md text-xs text-on-surface-variant mb-4">Recommended bridge courses to maximize placement clearance for current batch.</p>
            <div class="space-y-3 flex-1">
              ${col.recommendedActions.map(act => `
                <div class="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 flex items-start justify-between gap-3">
                  <div>
                    <h4 class="font-label-md text-xs font-bold text-on-surface mb-0.5">${act.title}</h4>
                    <p class="text-[11px] text-on-surface-variant">${act.reason}</p>
                  </div>
                  <button onclick="AppUI.openCreateBridgeCourseModal('${act.title}')" class="px-3 py-1 rounded-lg border border-primary/30 text-primary text-xs font-semibold hover:bg-primary/5 whitespace-nowrap">
                    Draft
                  </button>
                </div>
              `).join('')}
            </div>
          </section>
        </div>
      </main>
    `;
  },

  openCreateBridgeCourseModal(prefillTitle = '') {
    const modalHTML = `
      <div id="course-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm fade-in">
        <div class="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-primary/30 flex flex-col">
          <div class="px-6 py-4 border-b border-outline-variant/40 flex justify-between items-center bg-surface-container-low">
            <h2 class="font-headline-sm text-base font-bold text-on-surface">Publish New Bridge Course</h2>
            <button onclick="document.getElementById('course-modal').remove()" class="text-outline hover:text-on-surface p-1">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <form onsubmit="event.preventDefault(); AppUI.handleCreateCourseSubmit(this);" class="p-6 space-y-3.5 text-xs">
            <div>
              <label class="block font-semibold text-on-surface mb-1">Course Title</label>
              <input name="title" required value="${prefillTitle || 'Advanced Schedule T Quality Control'}" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-on-surface mb-1">Target Skill Gap</label>
                <select name="skill" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs">
                  <option>GMP Compliance</option>
                  <option>Quality Control Analytics</option>
                  <option>Regulatory Affairs</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-on-surface mb-1">Duration</label>
                <input name="duration" value="4 Weeks (32 Hours)" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs" />
              </div>
            </div>
            <div>
              <label class="block font-semibold text-on-surface mb-1">Faculty Lead</label>
              <input name="faculty" value="Prof. Meenakshi Sundaram (Dept of Dravyaguna)" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs" />
            </div>
            <div>
              <label class="block font-semibold text-on-surface mb-1">Course Synopsis</label>
              <textarea name="description" rows="2" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-xs">Comprehensive practical training on phytopharmaceutical quality verification and pharmacopoeial assays.</textarea>
            </div>
            <div class="pt-3 border-t border-outline-variant/40 flex justify-end gap-2">
              <button type="button" onclick="document.getElementById('course-modal').remove()" class="px-4 py-2 border border-outline-variant rounded-xl">Cancel</button>
              <button type="submit" class="px-5 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90">Publish to Students</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  handleCreateCourseSubmit(form) {
    const title = form.title.value;
    const skill = form.skill.value;
    const duration = form.duration.value;
    const faculty = form.faculty.value;
    const description = form.description.value;

    window.appState.addBridgeCourse({ title, skill, duration, faculty, description });
    const modal = document.getElementById('course-modal');
    if (modal) modal.remove();

    this.showToast(`Bridge Course "${title}" published to student registry!`, "success");
  },

  // 9. Ministry Admin & National Analytics HTML
  getMinistryDashboardHTML(state) {
    const min = window.SKILLSETU_DATA.ministryAnalytics;
    const stats = window.SKILLSETU_DATA.stats;
    const activeState = this.selectedStateDetail || min.states[0];

    return `
      <main class="pt-28 pb-20 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div class="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-1">
              <span class="material-symbols-outlined text-sm">public</span> Ministry of Ayush • National Intelligence
            </div>
            <h1 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">National Skill Impact Analytics</h1>
            <p class="font-body-md text-xs md:text-sm text-on-surface-variant">Real-time overview of workforce readiness, state-level deficits, and industry alignment.</p>
          </div>
          <button onclick="AppUI.exportNationalReport()" class="px-4 py-2 bg-primary text-white font-label-md text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm">
            <span class="material-symbols-outlined text-sm">download</span> Export National Summary
          </button>
        </div>

        <!-- Metrics Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <div class="text-xs text-on-surface-variant font-medium">Total Registered Students</div>
              <div class="text-3xl font-bold text-on-surface mt-1">${stats.totalEnrolledNational}</div>
              <div class="text-primary text-[11px] font-bold mt-1">↑ +12.5% YoY Growth</div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">school</span>
            </div>
          </div>

          <div class="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <div class="text-xs text-on-surface-variant font-medium">Industry Partners Active</div>
              <div class="text-3xl font-bold text-on-surface mt-1">${stats.industryPartners}</div>
              <div class="text-primary text-[11px] font-bold mt-1">↑ +4.2% Placement Clearance</div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">handshake</span>
            </div>
          </div>

          <div class="glass-panel p-6 rounded-2xl flex items-center justify-between">
            <div>
              <div class="text-xs text-on-surface-variant font-medium">Avg. National Placement Rate</div>
              <div class="text-3xl font-bold text-primary mt-1">${stats.placementRate}</div>
              <div class="text-primary text-[11px] font-bold mt-1">Target: 75% for 2026</div>
            </div>
            <div class="w-12 h-12 rounded-xl bg-primary-container/20 text-primary-container flex items-center justify-center">
              <span class="material-symbols-outlined text-2xl">trending_up</span>
            </div>
          </div>
        </div>

        <!-- Heatmap & State Intelligence -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <!-- State Heatmap Cards -->
          <div class="lg:col-span-8 glass-panel rounded-2xl p-6 md:p-8 flex flex-col">
            <div class="flex justify-between items-center mb-4">
              <div>
                <h3 class="font-headline-sm text-lg font-bold text-on-surface">Regional Skill-Gap Analysis</h3>
                <p class="text-xs text-on-surface-variant">Click any state card to inspect state-level deficit details</p>
              </div>
            </div>

            <!-- State Grid Selector -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              ${min.states.map(st => `
                <div onclick="AppUI.selectedStateDetail = ${JSON.stringify(st).replace(/"/g, '&quot;')}; AppUI.renderCurrentView();" class="p-3.5 rounded-xl border cursor-pointer transition-all ${activeState.name === st.name ? 'bg-primary/10 border-primary shadow-sm' : 'bg-surface-container-lowest border-outline-variant/50 hover:border-primary/40'}">
                  <div class="flex justify-between items-start">
                    <div class="font-bold text-xs text-on-surface">${st.name}</div>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${st.gapSeverity === 'High' ? 'bg-error-container text-error' : st.gapSeverity === 'Medium' ? 'bg-secondary-container text-secondary' : 'bg-primary-container/20 text-primary'}">
                      ${st.gapSeverity}
                    </span>
                  </div>
                  <div class="text-[11px] text-on-surface-variant mt-1">Deficit: <strong class="text-on-surface">${st.deficit}</strong></div>
                  <div class="text-[10px] text-outline mt-0.5">${st.students} Students</div>
                </div>
              `).join('')}
            </div>

            <!-- Active State Details Drawer -->
            <div class="p-4 rounded-xl bg-surface-container-low border border-primary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div class="font-bold text-sm text-primary flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-base">pin_drop</span> ${activeState.name} State Directive
                </div>
                <div class="text-xs text-on-surface-variant mt-0.5">Top Demanded Competency: <strong>${activeState.topDemand}</strong> • Colleges: <strong>${activeState.colleges} Institutions</strong></div>
              </div>
              <button onclick="AppUI.showToast('State bridge training allocation dispatched for ${activeState.name}', 'success')" class="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 shrink-0">
                Deploy State Bridge Module
              </button>
            </div>
          </div>

          <!-- Top Demand Skills -->
          <div class="lg:col-span-4 glass-panel rounded-2xl p-6 flex flex-col">
            <h3 class="font-headline-sm text-lg font-bold text-on-surface mb-1">Top Demanded Skills</h3>
            <p class="text-xs text-on-surface-variant mb-4">Ranked by national Ayush industry job postings</p>
            
            <div class="space-y-3.5 flex-1">
              ${min.topDemandSkills.map(sk => `
                <div class="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
                  <div class="flex justify-between items-center text-xs font-semibold mb-1">
                    <span class="text-on-surface flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-primary text-sm">${sk.icon}</span> ${sk.name}
                    </span>
                    <span class="text-primary font-bold">${sk.demand}%</span>
                  </div>
                  <div class="w-full bg-surface-variant rounded-full h-1.5 overflow-hidden">
                    <div class="bg-primary h-1.5 rounded-full" style="width: ${sk.demand}%"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Placement Trends Bar Chart -->
        <section class="glass-panel rounded-2xl p-6 md:p-8">
          <h3 class="font-headline-sm text-lg font-bold text-on-surface mb-1">Quarterly Placement Trajectory</h3>
          <p class="text-xs text-on-surface-variant mb-6">Aggregate placement clearance through SkillSetu verified pipelines</p>
          
          <div class="h-44 flex items-end justify-between gap-4 px-4 pb-4 border-b border-outline-variant/40">
            ${min.placementTrends.map(tr => `
              <div class="flex-1 flex flex-col items-center gap-2 group">
                <div class="w-full max-w-[60px] ${tr.highlight ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-primary/30'} rounded-t-lg transition-all duration-300 group-hover:bg-primary" style="height: ${tr.height}%"></div>
                <span class="font-label-sm text-xs font-semibold text-on-surface">${tr.quarter} (${tr.value})</span>
              </div>
            `).join('')}
          </div>
        </section>
      </main>
    `;
  },

  exportNationalReport() {
    this.showToast("National Impact CSV summary report generated and downloaded.", "success");
  },

  // 10. Judge Demo Tour & Quick Bar
  renderJudgeController(state) {
    let barEl = document.getElementById('demo-controller-bar');
    if (!barEl) {
      barEl = document.createElement('div');
      barEl.id = 'demo-controller-bar';
      barEl.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 demo-bar px-4 py-2.5 rounded-full flex items-center gap-2 md:gap-3 text-white text-xs shadow-2xl';
      document.body.appendChild(barEl);
    }

    barEl.innerHTML = `
      <span class="hidden sm:inline-block font-bold text-primary-fixed uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-primary-fixed/20">SIH Demo</span>
      <button onclick="AppUI.navigate('student-dashboard')" class="px-2.5 py-1 rounded-full ${state.currentView === 'student-dashboard' ? 'bg-primary-container text-on-primary-container font-bold' : 'hover:bg-white/10 text-white/80'} transition-all">1. Student</button>
      <button onclick="AppUI.navigate('assessment')" class="px-2.5 py-1 rounded-full ${state.currentView === 'assessment' ? 'bg-primary-container text-on-primary-container font-bold' : 'hover:bg-white/10 text-white/80'} transition-all">2. Assessment</button>
      <button onclick="AppUI.openBridgeCourseModal('BC-GMP-101')" class="px-2.5 py-1 rounded-full hover:bg-white/10 text-white/80 transition-all">3. Bridge Course</button>
      <button onclick="AppUI.navigate('industry-dashboard')" class="px-2.5 py-1 rounded-full ${state.currentView === 'industry-dashboard' ? 'bg-primary-container text-on-primary-container font-bold' : 'hover:bg-white/10 text-white/80'} transition-all">4. Industry</button>
      <button onclick="AppUI.navigate('college-dashboard')" class="px-2.5 py-1 rounded-full ${state.currentView === 'college-dashboard' ? 'bg-primary-container text-on-primary-container font-bold' : 'hover:bg-white/10 text-white/80'} transition-all">5. College</button>
      <button onclick="AppUI.navigate('ministry-dashboard')" class="px-2.5 py-1 rounded-full ${state.currentView === 'ministry-dashboard' ? 'bg-primary-container text-on-primary-container font-bold' : 'hover:bg-white/10 text-white/80'} transition-all">6. Ministry</button>
      <button onclick="window.appState.resetDemo(); AppUI.renderCurrentView();" class="px-2.5 py-1 rounded-full bg-error/30 text-error-container hover:bg-error/50 font-bold transition-all ml-1" title="Reset Demo Data">↺ Reset</button>
    `;
  },

  startDemoTour() {
    this.navigate('student-dashboard');
    this.showToast("Starting SIH 2026 Judge Walkthrough: Welcome to the Student Competency Dashboard!", "info");
  },

  handleApplyOpportunity(oppId) {
    window.appState.applyOpportunity(oppId);
    this.showToast("Application submitted successfully! Reflected in Industry portal.", "success");
  },

  attachEventListeners() {
    // Any extra DOM attachments
  }
};

// Initialize once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.AppUI.init();
});
