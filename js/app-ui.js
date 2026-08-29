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
  mobileMenuOpen: false,

  init() {
    if (window.AppData && typeof window.AppData.init === 'function') {
      window.AppData.init().catch(err => console.warn('[AppUI] AppData init notice:', err));
    }

    // Setup state subscription
    window.appState.subscribe((state) => {
      this.renderCurrentView();
    });

    // Accessible Global Keyboard Listener: Instant Dismiss on Escape Key
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.keyCode === 27) {
          this.closeAllModals();
        }
      });
    }

    // Handle hash changes for browser history
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (['home', 'roles', 'login', 'feed', 'profile', 'student-dashboard', 'assessment', 'industry-dashboard', 'college-dashboard', 'ministry-dashboard', 'colleges', 'ministry-insights', 'notifications'].includes(hash)) {
        window.appState.setView(hash);
      }
    });

    // On page load/refresh: start at landing page if no hash
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && ['home', 'roles', 'login', 'feed', 'profile', 'student-dashboard', 'assessment', 'industry-dashboard', 'college-dashboard', 'ministry-dashboard', 'colleges', 'ministry-insights', 'notifications'].includes(initialHash)) {
      window.appState.setView(initialHash);
    } else {
      // Default to landing page on fresh load or refresh
      window.appState.setView('home');
      window.location.hash = 'home';
    }
  },

  navigate(viewName) {
    this.closeMobileMenu();
    window.location.hash = viewName;
    window.appState.setView(viewName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    const headerEl = document.getElementById('global-header');
    if (headerEl) {
      headerEl.innerHTML = this.getNavbarHTML(window.appState.state);
    }
  },

  closeMobileMenu() {
    if (this.mobileMenuOpen) {
      this.mobileMenuOpen = false;
      const headerEl = document.getElementById('global-header');
      if (headerEl) {
        headerEl.innerHTML = this.getNavbarHTML(window.appState.state);
      }
    }
  },

  selectRoleAndLogin(role) {
    this.closeMobileMenu();
    window.appState.selectRoleForAuth(role);
    this.navigate('login');
    this.showToast(`Selected ${role.toUpperCase()} portal. Please sign in to continue.`, 'info');
  },

  handleLoginSubmit() {
    this.closeMobileMenu();
    const role = window.appState.state.currentRole || 'student';
    window.appState.setRole(role, false);
    const roleNames = {
      student: 'Student Portal',
      industry: 'Industry Portal',
      college: 'College & Faculty Portal',
      ministry: 'Ministry Admin Portal'
    };
    this.showToast(`Authenticated successfully! Welcome to the ${roleNames[role]}.`, 'success');
    window.appState.setView('feed');
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

  // Accessible Global Modal Close Handler
  closeAllModals() {
    const modalIds = [
      'profile-modal-container',
      'bridge-modal',
      'internship-modal',
      'profile-detail-modal',
      'cand-modal',
      'post-modal',
      'course-modal',
      'state-modal'
    ];
    modalIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
    this.closeMobileMenu();
    this.closeProfileDropdown();
  },

  // Temporary Sleek Role Transition Banner (1.5 Seconds)
  showRoleBanner(message) {
    if (typeof document === 'undefined') return;
    let banner = document.getElementById('role-transition-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'role-transition-banner';
      banner.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-[150] px-5 py-2.5 bg-slate-900/90 text-white rounded-full shadow-2xl backdrop-blur-md border border-emerald-500/40 text-xs font-bold flex items-center gap-2 role-transition-banner pointer-events-none';
      document.body.appendChild(banner);
    }
    banner.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      <span class="material-symbols-outlined text-emerald-400 text-base">swap_horiz</span>
      <span>${message}</span>
    `;
    banner.style.display = 'flex';
    banner.style.opacity = '1';

    if (this._roleBannerTimeout) clearTimeout(this._roleBannerTimeout);
    this._roleBannerTimeout = setTimeout(() => {
      banner.style.opacity = '0';
      banner.style.transition = 'opacity 0.3s ease';
      setTimeout(() => { banner.style.display = 'none'; }, 300);
    }, 1500);
  },


  profileDropdownOpen: false,
  tempUploadedAvatar: null,

  toggleProfileDropdown() {
    this.profileDropdownOpen = !this.profileDropdownOpen;
    const menuEl = document.getElementById('profile-dropdown-menu');
    if (menuEl) {
      if (this.profileDropdownOpen) {
        menuEl.classList.remove('hidden');
      } else {
        menuEl.classList.add('hidden');
      }
    }
  },

  closeProfileDropdown() {
    this.profileDropdownOpen = false;
    const menuEl = document.getElementById('profile-dropdown-menu');
    if (menuEl) menuEl.classList.add('hidden');
  },

  openEditProfileModal() {
    this.closeProfileDropdown();
    this.tempUploadedAvatar = null;
    let modalContainer = document.getElementById('profile-modal-container');
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'profile-modal-container';
      document.body.appendChild(modalContainer);
    }
    const role = window.appState.state.currentRole || 'student';
    const profile = window.appState.getProfileForRole(role);

    modalContainer.innerHTML = `
      <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onclick="if(event.target===this)AppUI.closeEditProfileModal();">
        <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-lg">edit</span>
              </div>
              <div>
                <h2 class="font-bold text-slate-900 text-base sm:text-lg">Edit Profile & Photo</h2>
                <p class="text-[11px] text-slate-500">${role === 'student' ? 'Student & Clinical Scholar' : role === 'industry' ? 'Corporate Recruiter' : role === 'college' ? 'Academic Faculty' : 'Ministry Administrator'}</p>
              </div>
            </div>
            <button onclick="AppUI.closeEditProfileModal()" class="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <span class="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <!-- Modal Body Form -->
          <div class="p-6 space-y-5 overflow-y-auto flex-1">
            <!-- Avatar Upload from Gallery / Disk -->
            <div class="flex flex-col sm:flex-row items-center gap-5 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <div class="relative group cursor-pointer" onclick="document.getElementById('avatar-gallery-input').click()" title="Click to upload new photo from gallery">
                <img id="edit-profile-avatar-preview" src="${profile.avatar}" alt="${profile.name}" class="w-20 h-20 rounded-full object-cover border-3 border-white shadow-md group-hover:opacity-85 transition-opacity" />
                <div class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                  <span class="material-symbols-outlined text-xl">photo_camera</span>
                </div>
                <div class="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border border-white shadow-sm flex items-center justify-center">
                  <span class="material-symbols-outlined text-xs">add_a_photo</span>
                </div>
              </div>

              <div class="space-y-1.5 text-center sm:text-left flex-1">
                <div class="text-xs font-bold text-slate-900">Profile Photo</div>
                <p class="text-[11px] text-slate-500">Upload your picture directly from your device gallery (JPG, PNG, WebP supported)</p>
                <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <button type="button" onclick="document.getElementById('avatar-gallery-input').click()" class="px-3 py-1.5 bg-primary hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">upload_file</span> Upload from Gallery
                  </button>
                  <input type="file" id="avatar-gallery-input" accept="image/*" class="hidden" onchange="AppUI.handleAvatarFileUpload(event)" />
                  <button type="button" onclick="AppUI.resetToDefaultAvatar()" class="px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-[11px] font-semibold">
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <!-- Form Inputs -->
            <div class="space-y-3.5">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Full Name / Organization Name</label>
                <input type="text" id="edit-profile-name" value="${profile.name}" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Enter full name..." />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Headline / Academic Degree / Title</label>
                <input type="text" id="edit-profile-role" value="${profile.role}" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. BAMS Final Year (Ayurveda) or Lead QC Recruiter" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">College / Enterprise / Affiliation</label>
                <input type="text" id="edit-profile-institution" value="${profile.institution}" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g. National Institute of Ayurveda (NIA Jaipur)" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">About / Bio / Summary</label>
                <textarea id="edit-profile-bio" rows="3" class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed" placeholder="Write a short summary about your clinical interests, research, or career focus...">${profile.bio || ''}</textarea>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2.5">
            <button type="button" onclick="AppUI.closeEditProfileModal()" class="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors">
              Cancel
            </button>
            <button type="button" onclick="AppUI.saveProfileModalChanges()" class="px-5 py-2 bg-primary hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">save</span> Save Changes
            </button>
          </div>
        </div>
      </div>
    `;
  },

  copyPassportCredential(credentialId = 'AYU-SHA256-88491A-2026') {
    const passportUrl = `https://skillsetu.ayush.gov.in/verify/${credentialId}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(`SkillSetu Authenticated Ayush Credential Passport\nCredential ID: ${credentialId}\nVerification Node: GOV-IN-AYUSH-NODE-01\nVerification URL: ${passportUrl}`);
    }
    this.showToast(`Verifiable Passport ID (${credentialId}) & Hash copied to clipboard!`, 'success');
  },

  closeEditProfileModal() {
    const container = document.getElementById('profile-modal-container');
    if (container) container.innerHTML = '';
  },

  handleAvatarFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.showToast('Image size exceeds 5MB limit. Please choose a smaller image.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this.tempUploadedAvatar = dataUrl;
      const preview = document.getElementById('edit-profile-avatar-preview');
      if (preview) preview.src = dataUrl;
      this.showToast('Photo selected from gallery! Click "Save Changes" to apply.', 'info');
    };
    reader.readAsDataURL(file);
  },

  resetToDefaultAvatar() {
    const defaultAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbPrD05LHLmlcpCryv0Da3BrdItjvbOr8qBAASeP1rhz9381htAj0oR72GTCo0XdGK-qr32ZRiODbxozXMjxKAV5BcPe7beGr7CUHRJgJPfGzL2XvG1vO1Mek5Ns9IeR9Y4QVMoe1w2ZeXcxJRq03Ls9Kj5hB_RiQUP6WTQdGN46N-1xrLBKu39cfvDAnQUDtBvKYCL-B4ECgrX3wXWBJPa4sK5nzWNhXMicC0MxtbO-kXR1IHunvT';
    this.tempUploadedAvatar = defaultAvatar;
    const preview = document.getElementById('edit-profile-avatar-preview');
    if (preview) preview.src = defaultAvatar;
  },

  saveProfileModalChanges() {
    const nameInput = document.getElementById('edit-profile-name');
    const roleInput = document.getElementById('edit-profile-role');
    const instInput = document.getElementById('edit-profile-institution');
    const bioInput = document.getElementById('edit-profile-bio');

    const updatedData = {
      name: nameInput ? nameInput.value.trim() : '',
      role: roleInput ? roleInput.value.trim() : '',
      program: roleInput ? roleInput.value.trim() : '',
      institution: instInput ? instInput.value.trim() : '',
      bio: bioInput ? bioInput.value.trim() : ''
    };

    if (this.tempUploadedAvatar) {
      updatedData.avatar = this.tempUploadedAvatar;
    }

    if (!updatedData.name) {
      this.showToast('Please enter a valid name', 'error');
      return;
    }

    window.appState.updateProfile(updatedData);
    this.closeEditProfileModal();
    this.showToast('Profile and photo successfully updated across SkillSetu!', 'success');
    this.renderCurrentView();
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
      case 'feed':
        contentHTML = this.getFeedHTML(state);
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
      case 'colleges':
        contentHTML = this.getCollegesHTML(state);
        break;
      case 'ministry-insights':
        contentHTML = this.getMinistryInsightsHTML(state);
        break;
      case 'notifications':
        contentHTML = this.getNotificationsHTML(state);
        break;
      case 'profile':
        contentHTML = this.getProfileHTML(state);
        break;
      default:
        contentHTML = this.getLandingHTML(state);
    }

    appEl.innerHTML = contentHTML;

    // Remove any legacy demo bar element if present
    const legacyBar = document.getElementById('demo-controller-bar');
    if (legacyBar) legacyBar.remove();

    // Reattach dynamic event listeners
    this.attachEventListeners();
  },

  getNavbarHTML(state) {
    const isPublic = state.currentView === 'home' || state.currentView === 'roles' || state.currentView === 'login';
    const isAssessment = state.currentView === 'assessment';

    // 1. PUBLIC INSTITUTIONAL LANDING HEADER
    if (isPublic) {
      return `
        <div class="px-4 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto w-full">
          <div class="flex justify-between items-center h-16 md:h-20">
            <!-- Brand Logo -->
            <div class="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0" onclick="AppUI.navigate('home')">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">spa</span>
              </div>
              <div class="text-left">
                <span class="font-display-lg-mobile text-lg sm:text-[22px] font-bold text-primary tracking-tight block leading-tight">SkillSetu</span>
                <span class="text-primary font-label-sm text-[10px] font-bold block leading-none">Ministry of Ayush</span>
              </div>
            </div>

            <!-- Public Center Links (Properly Centered & Aligned) -->
            <nav class="hidden md:flex items-center gap-8 font-label-md text-sm text-slate-700 font-semibold mx-auto">
              <a href="#ecosystem" class="hover:text-primary transition-colors py-1">Ecosystem</a>
              <a href="#capabilities" class="hover:text-primary transition-colors py-1">Platform Capabilities</a>
              <a href="#disciplines" class="hover:text-primary transition-colors py-1">Disciplines</a>
              <a href="#faq" class="hover:text-primary transition-colors py-1">FAQ</a>
            </nav>

            <!-- Public Right Action: Launch Platform Button -->
            <div class="flex items-center gap-3 shrink-0">
              <button onclick="AppUI.navigate('roles')" class="px-5 py-2.5 bg-primary hover:bg-emerald-800 text-white rounded-xl font-label-md text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 transform hover:-translate-y-0.5 group">
                <span class="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">rocket_launch</span>
                <span>Launch Platform</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // 2. ASSESSMENT FOCUSED HEADER
    if (isAssessment) {
      return `
        <div class="px-4 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto w-full">
          <div class="flex justify-between items-center h-14 md:h-16">
            <div class="flex items-center gap-3 cursor-pointer" onclick="AppUI.navigate('home')" title="Return to SkillSetu Home">
              <div class="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold shadow-sm">
                <span class="material-symbols-outlined text-lg" style="font-variation-settings: 'FILL' 1;">spa</span>
              </div>
              <span class="text-sm font-bold text-slate-900">National Ayush Skill Diagnostic</span>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-slate-600 font-label-md text-xs sm:text-sm font-semibold">Ayush Skill Benchmark Assessment</span>
              <button onclick="AppUI.navigate('feed')" class="p-2 text-slate-500 hover:text-primary transition-colors" title="Exit to Feed">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    // 3. AUTHENTICATED IN-APP LINKEDIN HEADER (Role-Aware for Student, Industry, College, Ministry)
    const role = state.currentRole || 'student';
    const profile = window.appState.getProfileForRole(role);
    
    // User profile metadata according to role
    const profileAvatar = profile.avatar;
    const profileName = profile.name;
    const profileRoleLabel = profile.role || (role === 'student' ? 'Student (BAMS)' : role === 'industry' ? 'Enterprise Recruiter' : role === 'college' ? 'Faculty • NIA Jaipur' : 'Ministry of Ayush');
    const meDashboardView = role === 'student' ? 'student-dashboard' : role === 'industry' ? 'industry-dashboard' : role === 'college' ? 'college-dashboard' : 'ministry-dashboard';

    return `
      <div class="px-3 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto w-full relative">
        <div class="flex justify-between items-center h-14 md:h-16">
          <!-- Left Logo & Search Bar -->
          <div class="flex items-center gap-2.5">
            <!-- Brand Logo (Redirects to Home) -->
            <div class="flex items-center gap-2 cursor-pointer" onclick="AppUI.navigate('home')" title="Go to SkillSetu Home">
              <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-primary flex items-center justify-center text-white font-extrabold shadow-sm shrink-0">
                <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">spa</span>
              </div>
              <div class="hidden sm:block text-left">
                <span class="text-base font-extrabold text-slate-900 tracking-tight block leading-tight">SkillSetu</span>
                <span class="text-[9px] text-primary font-bold uppercase tracking-wider block leading-none">Ministry of Ayush</span>
              </div>
            </div>

            <!-- LinkedIn Pill Search Input -->
            <div class="relative hidden md:flex items-center ml-1 lg:ml-2">
              <span class="material-symbols-outlined absolute left-2.5 text-slate-500 text-[18px]">search</span>
              <input type="text" placeholder="${role === 'industry' ? 'Search candidates, skills, batch...' : 'Search skills, jobs, colleges...'}" onkeydown="if(event.key==='Enter'){AppUI.showToast('Searching for: ' + this.value, 'info');}" class="pl-8 pr-3 py-1.5 bg-[#edf3f8] hover:bg-[#e4ecf3] focus:bg-white text-slate-800 text-xs rounded-md border border-transparent focus:border-slate-300 focus:ring-1 focus:ring-primary w-44 lg:w-56 xl:w-64 transition-all" />
            </div>
          </div>

          <!-- Right Navigation Tabs (LinkedIn Style Role-Aware) -->
          <nav class="hidden lg:flex items-center gap-0.5 xl:gap-1.5 h-full relative">
            <!-- 1. Home / Feed -->
            <a href="javascript:void(0)" onclick="AppUI.navigate('feed')" class="linkedin-nav-item ${state.currentView === 'feed' ? 'active' : ''}" title="Home Feed">
              <span class="material-symbols-outlined ${state.currentView === 'feed' ? 'fill-icon' : ''}">home</span>
              <span class="badge-dot"></span>
              <span>Home</span>
            </a>

            <!-- 2. Primary Role Action (Jobs / Candidate Pool / Cohort Analytics / Governance Hub) -->
            ${role === 'student' ? `
              <a href="javascript:void(0)" onclick="AppUI.navigate('student-dashboard')" class="linkedin-nav-item ${state.currentView === 'student-dashboard' ? 'active' : ''}" title="Verified Industry Jobs & Radar">
                <span class="material-symbols-outlined ${state.currentView === 'student-dashboard' ? 'fill-icon' : ''}">work</span>
                <span>Jobs</span>
              </a>
              <a href="javascript:void(0)" onclick="AppUI.navigate('assessment')" class="linkedin-nav-item ${state.currentView === 'assessment' ? 'active' : ''}" title="Clinical Diagnostic Assignment">
                <span class="material-symbols-outlined ${state.currentView === 'assessment' ? 'fill-icon' : ''}">assignment</span>
                <span>Assignment</span>
              </a>
            ` : role === 'industry' ? `
              <a href="javascript:void(0)" onclick="AppUI.navigate('industry-dashboard')" class="linkedin-nav-item ${state.currentView === 'industry-dashboard' ? 'active' : ''}" title="Verified Ayush Candidate Pool">
                <span class="material-symbols-outlined ${state.currentView === 'industry-dashboard' ? 'fill-icon' : ''}">person_search</span>
                <span>Candidates</span>
              </a>
            ` : role === 'college' ? `
              <a href="javascript:void(0)" onclick="AppUI.navigate('college-dashboard')" class="linkedin-nav-item ${state.currentView === 'college-dashboard' ? 'active' : ''}" title="Faculty Cohort Readiness Dashboard">
                <span class="material-symbols-outlined ${state.currentView === 'college-dashboard' ? 'fill-icon' : ''}">analytics</span>
                <span>Readiness</span>
              </a>
            ` : `
              <a href="javascript:void(0)" onclick="AppUI.navigate('ministry-dashboard')" class="linkedin-nav-item ${state.currentView === 'ministry-dashboard' ? 'active' : ''}" title="National Governance Impact Dashboard">
                <span class="material-symbols-outlined ${state.currentView === 'ministry-dashboard' ? 'fill-icon' : ''}">admin_panel_settings</span>
                <span>Governance</span>
              </a>
            `}

            <!-- 3. Colleges Directory (For Student = Colleges Directory, For Industry = Partner Institutions) -->
            <a href="javascript:void(0)" onclick="AppUI.navigate('colleges')" class="linkedin-nav-item ${state.currentView === 'colleges' ? 'active' : ''}" title="${role === 'industry' ? 'Partner Colleges & MoUs' : 'Accredited Ayush Colleges'}">
              <span class="material-symbols-outlined ${state.currentView === 'colleges' ? 'fill-icon' : ''}">account_balance</span>
              <span>${role === 'industry' ? 'Partner Colleges' : 'Colleges'}</span>
            </a>

            <!-- 4. Ministry / National Insights -->
            <a href="javascript:void(0)" onclick="AppUI.navigate('ministry-insights')" class="linkedin-nav-item ${state.currentView === 'ministry-insights' ? 'active' : ''}" title="${role === 'industry' ? 'Industry Standards & Grants' : 'National Ayush Career Intelligence'}">
              <span class="material-symbols-outlined ${state.currentView === 'ministry-insights' ? 'fill-icon' : ''}">query_stats</span>
              <span>${role === 'industry' ? 'Standards' : 'Insights'}</span>
            </a>

            <!-- 5. Notifications -->
            <a href="javascript:void(0)" onclick="AppUI.navigate('notifications')" class="linkedin-nav-item ${state.currentView === 'notifications' ? 'active' : ''}" title="View all notifications & alerts">
              <span class="material-symbols-outlined ${state.currentView === 'notifications' ? 'fill-icon' : ''}">notifications</span>
              ${window.appState.getUnreadNotificationsCount(role) > 0 ? `<span class="badge-count">${window.appState.getUnreadNotificationsCount(role)}</span>` : ''}
              <span>Notifications</span>
            </a>

            <!-- 6. Me (Role-Aware Profile Dropdown) -->
            <div class="relative">
              <div class="linkedin-nav-item cursor-pointer" onclick="AppUI.toggleProfileDropdown()" title="Click to view profile & edit settings">
                <img src="${profileAvatar}" alt="${profileName}" class="w-5 h-5 rounded-full object-cover border border-slate-300" />
                <span class="flex items-center gap-0.5 mt-0.5">
                  Me <span class="material-symbols-outlined text-[12px] leading-none">arrow_drop_down</span>
                </span>
              </div>

              <!-- Profile Dropdown Menu Card -->
              <div id="profile-dropdown-menu" class="hidden absolute top-14 right-0 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-72 space-y-3 animate-fade-in text-left">
                <div class="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div class="relative group cursor-pointer" onclick="AppUI.openEditProfileModal()" title="Upload new photo">
                    <img src="${profileAvatar}" alt="${profileName}" class="w-12 h-12 rounded-full object-cover border-2 border-primary/30 shadow-sm" />
                    <div class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                      <span class="material-symbols-outlined text-sm">photo_camera</span>
                    </div>
                  </div>
                  <div class="overflow-hidden flex-1">
                    <h4 class="font-bold text-slate-900 text-sm truncate">${profileName}</h4>
                    <p class="text-[11px] text-slate-500 truncate">${profileRoleLabel}</p>
                    <span class="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">Verified Stakeholder</span>
                  </div>
                </div>

                <div class="space-y-1.5 text-xs">
                  <button onclick="AppUI.openEditProfileModal()" class="w-full text-left px-3 py-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 font-bold flex items-center justify-between transition-colors">
                    <span class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary">edit</span> Edit Profile & Photo</span>
                    <span class="material-symbols-outlined text-xs">chevron_right</span>
                  </button>
                  <button onclick="AppUI.navigate('${meDashboardView}'); AppUI.closeProfileDropdown();" class="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined text-[18px] text-slate-500">dashboard</span> View Role Dashboard
                  </button>
                  <button onclick="AppUI.navigate('roles'); AppUI.closeProfileDropdown();" class="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-2 transition-colors">
                    <span class="material-symbols-outlined text-[18px] text-slate-500">swap_horiz</span> Switch Portals
                  </button>
                </div>
              </div>
            </div>

            <!-- Divider Line -->
            <div class="h-7 w-[1px] bg-slate-200 mx-1 hidden xl:block"></div>

            <!-- 7. For Portals / Switch Stakeholder -->
            <div class="linkedin-nav-item cursor-pointer hidden xl:flex" onclick="AppUI.navigate('roles')" title="Explore Other Stakeholder Portals">
              <span class="material-symbols-outlined text-slate-600">apps</span>
              <span class="flex items-center gap-0.5">
                Portals <span class="material-symbols-outlined text-[12px] leading-none">arrow_drop_down</span>
              </span>
            </div>
          </nav>

          <!-- Mobile Hamburger & Actions -->
          <div class="flex lg:hidden items-center gap-2">
            <button onclick="AppUI.navigate('notifications')" class="p-1.5 text-slate-600 hover:text-primary transition-colors rounded-full relative" title="Notifications">
              <span class="material-symbols-outlined text-2xl">notifications</span>
              ${window.appState.getUnreadNotificationsCount(role) > 0 ? `<span class="badge-count">${window.appState.getUnreadNotificationsCount(role)}</span>` : ''}
            </button>
            <button onclick="AppUI.openEditProfileModal()" class="p-1 text-slate-600 hover:text-primary transition-colors" title="Edit Profile">
              <img src="${profileAvatar}" alt="${profileName}" class="w-7 h-7 rounded-full object-cover border border-primary/40 shadow-sm" />
            </button>
            <button onclick="AppUI.toggleMobileMenu()" class="p-2 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center justify-center transition-colors">
              <span class="material-symbols-outlined text-2xl">${this.mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation Drawer -->
        <div id="mobile-nav-drawer" class="mobile-nav-enter ${this.mobileMenuOpen ? 'active' : ''} lg:hidden border-t border-outline-variant/30 py-4 px-2">
          <!-- Mobile Profile Banner -->
          <div class="p-3 mb-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <img src="${profileAvatar}" alt="${profileName}" class="w-10 h-10 rounded-full object-cover border border-emerald-300" />
              <div>
                <div class="font-bold text-xs text-slate-900">${profileName}</div>
                <div class="text-[10px] text-slate-500">${profileRoleLabel}</div>
              </div>
            </div>
            <button onclick="AppUI.openEditProfileModal(); AppUI.closeMobileMenu();" class="px-2.5 py-1 bg-primary text-white rounded-lg text-[10px] font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">edit</span> Edit
            </button>
          </div>

          <div class="flex flex-col gap-1 mb-4">
            <a href="javascript:void(0)" onclick="AppUI.navigate('feed')" class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-sm ${state.currentView === 'feed' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-high'} transition-colors">
              <span class="material-symbols-outlined text-lg text-primary">feed</span> Home Feed
            </a>
            <a href="javascript:void(0)" onclick="AppUI.navigate('notifications')" class="flex items-center justify-between px-3 py-2.5 rounded-xl font-label-md text-sm ${state.currentView === 'notifications' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-high'} transition-colors">
              <span class="flex items-center gap-3">
                <span class="material-symbols-outlined text-lg text-primary">notifications</span> Notifications
              </span>
              ${window.appState.getUnreadNotificationsCount(role) > 0 ? `<span class="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">${window.appState.getUnreadNotificationsCount(role)} new</span>` : ''}
            </a>
            ${role === 'student' ? `
              <a href="javascript:void(0)" onclick="AppUI.navigate('student-dashboard')" class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-sm ${state.currentView === 'student-dashboard' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-high'} transition-colors">
                <span class="material-symbols-outlined text-lg text-primary">school</span> Student Hub & Radar
              </a>
              <a href="javascript:void(0)" onclick="AppUI.navigate('assessment')" class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-sm ${state.currentView === 'assessment' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-high'} transition-colors">
                <span class="material-symbols-outlined text-lg text-primary">assignment</span> Skill Assignment
              </a>
            ` : role === 'industry' ? `
              <a href="javascript:void(0)" onclick="AppUI.navigate('industry-dashboard')" class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-sm ${state.currentView === 'industry-dashboard' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-high'} transition-colors">
                <span class="material-symbols-outlined text-lg text-primary">person_search</span> Candidate Pool
              </a>
            ` : role === 'college' ? `
              <a href="javascript:void(0)" onclick="AppUI.navigate('college-dashboard')" class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-sm ${state.currentView === 'college-dashboard' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-high'} transition-colors">
                <span class="material-symbols-outlined text-lg text-primary">analytics</span> Cohort Readiness
              </a>
            ` : `
              <a href="javascript:void(0)" onclick="AppUI.navigate('ministry-dashboard')" class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-sm ${state.currentView === 'ministry-dashboard' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-high'} transition-colors">
                <span class="material-symbols-outlined text-lg text-primary">admin_panel_settings</span> Governance Hub
              </a>
            `}
            <a href="javascript:void(0)" onclick="AppUI.navigate('colleges')" class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-sm ${state.currentView === 'colleges' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-high'} transition-colors">
              <span class="material-symbols-outlined text-lg text-primary">account_balance</span> ${role === 'industry' ? 'Partner Colleges' : 'Colleges Directory'}
            </a>
            <a href="javascript:void(0)" onclick="AppUI.navigate('ministry-insights')" class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-sm ${state.currentView === 'ministry-insights' ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface hover:bg-surface-container-high'} transition-colors">
              <span class="material-symbols-outlined text-lg text-primary">query_stats</span> ${role === 'industry' ? 'Industry Standards' : 'National Insights'}
            </a>
            <a href="javascript:void(0)" onclick="AppUI.navigate('home')" class="flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-sm text-error hover:bg-error/10 transition-colors">
              <span class="material-symbols-outlined text-lg">logout</span> Exit / Landing
            </a>
          </div>

          <!-- Mobile Quick Role Switcher -->
          <div class="pt-3 border-t border-outline-variant/30">
            <div class="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Switch Active Role</div>
            <div class="grid grid-cols-2 gap-2">
              <button onclick="AppUI.handleRoleSwitch('student'); AppUI.closeMobileMenu();" class="p-2 rounded-lg bg-surface-container-low text-xs font-semibold text-left flex items-center gap-1.5 hover:bg-primary/10 ${state.currentRole === 'student' ? 'border border-primary text-primary bg-primary/10' : 'text-on-surface'}">
                <span class="material-symbols-outlined text-sm">school</span> Student
              </button>
              <button onclick="AppUI.handleRoleSwitch('industry'); AppUI.closeMobileMenu();" class="p-2 rounded-lg bg-surface-container-low text-xs font-semibold text-left flex items-center gap-1.5 hover:bg-primary/10 ${state.currentRole === 'industry' ? 'border border-primary text-primary bg-primary/10' : 'text-on-surface'}">
                <span class="material-symbols-outlined text-sm">domain</span> Industry
              </button>
              <button onclick="AppUI.handleRoleSwitch('college'); AppUI.closeMobileMenu();" class="p-2 rounded-lg bg-surface-container-low text-xs font-semibold text-left flex items-center gap-1.5 hover:bg-primary/10 ${state.currentRole === 'college' ? 'border border-primary text-primary bg-primary/10' : 'text-on-surface'}">
                <span class="material-symbols-outlined text-sm">account_balance</span> College
              </button>
              <button onclick="AppUI.handleRoleSwitch('ministry'); AppUI.closeMobileMenu();" class="p-2 rounded-lg bg-surface-container-low text-xs font-semibold text-left flex items-center gap-1.5 hover:bg-primary/10 ${state.currentRole === 'ministry' ? 'border border-primary text-primary bg-primary/10' : 'text-on-surface'}">
                <span class="material-symbols-outlined text-sm">admin_panel_settings</span> Ministry
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  handleRoleSwitch(role) {
    this.closeMobileMenu();
    window.appState.setRole(role);
    this.showToast(`Switched to ${role.toUpperCase()} portal`, 'info');
  },

  // Social Feed Actions (LinkedIn style)
  togglePostLike(postId) {
    window.appState.togglePostLike(postId);
    this.renderCurrentView();
  },

  publishPost() {
    const input = document.getElementById('feed-post-input');
    if (!input || !input.value.trim()) {
      this.showToast('Please type a skill update or milestone first!', 'error');
      return;
    }
    window.appState.createPost(input.value.trim());
    input.value = '';
    this.showToast('Your skill update was posted to the Ayush Network feed!', 'success');
    this.renderCurrentView();
  },

  applyFromFeed(oppId, companyName) {
    this.openInternshipDetailModal(oppId);
  },

  // 0. LinkedIn Main Home Feed HTML
  getFeedHTML(state) {
    const role = state.currentRole || 'student';
    const student = state.student || {};
    const posts = state.feedPosts || [];
    const trending = window.SKILLSETU_DATA.trendingNews || [];
    const opps = state.opportunities || [];
    const daburOpp = opps.find(o => o.id === 'OPP-DABUR-01') || opps[0];
    const isDaburApplied = state.applications[daburOpp.id]?.applied;

    // Role-Aware Left Profile Summary Card
    const currentProfile = window.appState.getProfileForRole(role);
    let profileAvatar = currentProfile.avatar;
    let profileName = currentProfile.name;
    let profileProgram = currentProfile.role || (role === 'student' ? 'BAMS Final Year (Ayurveda)' : 'Verified Stakeholder');
    let profileInstitution = currentProfile.institution || (role === 'student' ? 'National Institute of Ayurveda (NIA), Jaipur' : 'SkillSetu Network');
    let profileTargetView = 'student-dashboard';
    let statLabel1 = 'Profile viewers', statVal1 = '142';
    let statLabel2 = 'Post impressions', statVal2 = '1,820';
    let statLabel3 = 'Verified Match', statVal3 = `${student.overallMatch || 92}%`;
    let badgeTitle = `Schedule T GMP: ${student.skills?.["GMP"]?.current || 42}%`;
    let badgeDesc = (student.skills?.["GMP"]?.current >= 75) ? 'Ready for manufacturing placement' : 'Bridge module available to reach 85%';

    if (role === 'industry') {
      profileTargetView = 'industry-dashboard';
      statLabel1 = 'Candidate views'; statVal1 = '84';
      statLabel2 = 'Talent shortlisted'; statVal2 = '12';
      statLabel3 = 'Active openings'; statVal3 = '15 Roles';
      badgeTitle = 'Schedule T Verified Recruiter';
      badgeDesc = 'Direct campus recruitment enabled';
    } else if (role === 'college') {
      profileTargetView = 'college-dashboard';
      statLabel1 = 'Batch cohort size'; statVal1 = '120';
      statLabel2 = 'Placements this Q'; statVal2 = '48';
      statLabel3 = 'Readiness score'; statVal3 = '84%';
      badgeTitle = 'Accredited Faculty Reviewer';
      badgeDesc = 'Curriculum bridge module author';
    } else if (role === 'ministry') {
      profileTargetView = 'ministry-dashboard';
      statLabel1 = 'Affiliated colleges'; statVal1 = '352';
      statLabel2 = 'Active students'; statVal2 = '42,850+';
      statLabel3 = 'National placement'; statVal3 = '88.4%';
      badgeTitle = 'Official Governance Administrator';
      badgeDesc = 'National workforce analytics active';
    }

    return `
      <main class="pt-20 pb-20 px-3 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto w-full">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          <!-- LEFT COLUMN: Profile Summary & Shortcuts (3 cols) -->
          <div class="lg:col-span-3 space-y-4">
            <!-- Profile Card -->
            <div class="linkedin-card overflow-hidden text-center">
              <!-- Banner -->
              <div class="h-16 bg-gradient-to-r from-emerald-800 to-teal-700 w-full relative">
                <button onclick="AppUI.openEditProfileModal()" class="absolute top-2 right-2 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full text-[11px] backdrop-blur-xs transition-colors" title="Edit Profile & Photo">
                  <span class="material-symbols-outlined text-[14px]">edit</span>
                </button>
              </div>
              <!-- Avatar -->
              <div class="px-4 pb-4 -mt-8 relative">
                <div class="relative inline-block group cursor-pointer" onclick="AppUI.openFullProfileModal('me')" title="Click to view full LinkedIn profile">
                  <img src="${profileAvatar}" alt="${profileName}" class="w-16 h-16 rounded-full mx-auto object-cover border-2 border-white shadow-md group-hover:opacity-85 transition-opacity" />
                  <div class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                    <span class="material-symbols-outlined text-sm">visibility</span>
                  </div>
                </div>
                <h2 class="font-bold text-slate-900 text-sm mt-2 cursor-pointer hover:text-primary hover:underline" onclick="AppUI.openFullProfileModal('me')">${profileName}</h2>
                <p class="text-[11px] text-slate-500 leading-tight mt-0.5">${profileProgram}</p>
                <p class="text-[10px] text-slate-400 mt-0.5">${profileInstitution}</p>

                <!-- Profile Action Buttons -->
                <div class="mt-2.5 flex items-center gap-1.5">
                  <button onclick="AppUI.openFullProfileModal('me')" class="flex-1 py-1.5 px-2 bg-primary hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1">
                    <span class="material-symbols-outlined text-[13px]">person</span> View Profile
                  </button>
                  <button onclick="AppUI.openEditProfileModal()" class="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all border border-slate-200 flex items-center justify-center" title="Edit Profile">
                    <span class="material-symbols-outlined text-[13px]">edit</span>
                  </button>
                </div>

                <!-- Profile Analytics Quick Stats -->
                <div class="border-t border-slate-100 mt-3 pt-3 space-y-2 text-left">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-500 font-medium">${statLabel1}</span>
                    <span class="font-bold text-primary">${statVal1}</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-500 font-medium">${statLabel2}</span>
                    <span class="font-bold text-primary">${statVal2}</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-500 font-medium">${statLabel3}</span>
                    <span class="font-bold text-emerald-600">${statVal3}</span>
                  </div>
                </div>

                <!-- Verified Badge Chip -->
                <div class="mt-3.5 pt-3 border-t border-slate-100 bg-emerald-50/60 rounded-lg p-2 text-left cursor-pointer" onclick="AppUI.navigate('${profileTargetView}')">
                  <div class="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold">
                    <span class="material-symbols-outlined text-[14px]">verified</span>
                    <span>${badgeTitle}</span>
                  </div>
                  <p class="text-[10px] text-slate-500 mt-0.5">${badgeDesc}</p>
                </div>
              </div>
            </div>

            <!-- Quick Navigation Shortcuts -->
            <div class="linkedin-card p-3 space-y-1 text-xs">
              ${role === 'student' ? `
                <a href="javascript:void(0)" onclick="AppUI.navigate('student-dashboard')" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                  <span class="material-symbols-outlined text-primary text-[18px]">radar</span>
                  <span>Interactive Skill Radar</span>
                </a>
                <a href="javascript:void(0)" onclick="AppUI.navigate('assessment')" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                  <span class="material-symbols-outlined text-emerald-600 text-[18px]">assignment</span>
                  <span>Take Skill Diagnostic</span>
                </a>
                <a href="javascript:void(0)" onclick="AppUI.navigate('colleges')" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                  <span class="material-symbols-outlined text-blue-600 text-[18px]">account_balance</span>
                  <span>Accredited Colleges Directory</span>
                </a>
                <a href="javascript:void(0)" onclick="AppUI.navigate('ministry-insights')" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                  <span class="material-symbols-outlined text-purple-600 text-[18px]">query_stats</span>
                  <span>National Career Insights</span>
                </a>
              ` : role === 'industry' ? `
                <a href="javascript:void(0)" onclick="AppUI.navigate('industry-dashboard')" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                  <span class="material-symbols-outlined text-primary text-[18px]">person_search</span>
                  <span>Search Verified Talent Pool</span>
                </a>
                <a href="javascript:void(0)" onclick="AppUI.navigate('colleges')" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                  <span class="material-symbols-outlined text-emerald-600 text-[18px]">account_balance</span>
                  <span>Partner Colleges & MoUs</span>
                </a>
                <a href="javascript:void(0)" onclick="AppUI.navigate('ministry-insights')" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                  <span class="material-symbols-outlined text-blue-600 text-[18px]">gavel</span>
                  <span>Schedule T Guidelines</span>
                </a>
              ` : role === 'college' ? `
                <a href="javascript:void(0)" onclick="AppUI.navigate('college-dashboard')" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                  <span class="material-symbols-outlined text-primary text-[18px]">analytics</span>
                  <span>Cohort Readiness Dashboard</span>
                </a>
                <a href="javascript:void(0)" onclick="AppUI.navigate('colleges')" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                  <span class="material-symbols-outlined text-emerald-600 text-[18px]">account_balance</span>
                  <span>Peer Colleges Directory</span>
                </a>
                <a href="javascript:void(0)" onclick="AppUI.navigate('ministry-insights')" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                  <span class="material-symbols-outlined text-blue-600 text-[18px]">query_stats</span>
                  <span>Curriculum Policies</span>
                </a>
              ` : `
                <a href="javascript:void(0)" onclick="AppUI.navigate('ministry-dashboard')" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                  <span class="material-symbols-outlined text-primary text-[18px]">admin_panel_settings</span>
                  <span>Governance Impact Analytics</span>
                </a>
                <a href="javascript:void(0)" onclick="AppUI.navigate('colleges')" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                  <span class="material-symbols-outlined text-emerald-600 text-[18px]">account_balance</span>
                  <span>Accredited Institutes Directory</span>
                </a>
                <a href="javascript:void(0)" onclick="AppUI.navigate('ministry-insights')" class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                  <span class="material-symbols-outlined text-blue-600 text-[18px]">query_stats</span>
                  <span>National Workforce Insights</span>
                </a>
              `}
              <a href="javascript:void(0)" onclick="AppUI.navigate('notifications')" class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors border-t border-slate-100 pt-2.5 mt-1">
                <span class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-amber-600 text-[18px]">notifications</span>
                  <span>Alerts & Notifications</span>
                </span>
                ${window.appState.getUnreadNotificationsCount(role) > 0 ? `<span class="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">${window.appState.getUnreadNotificationsCount(role)} new</span>` : ''}
              </a>
            </div>
          </div>

          <!-- MIDDLE COLUMN: Main LinkedIn Feed (6 cols) -->
          <div class="lg:col-span-6 space-y-4">
            
            <!-- "Start a Post" Card -->
            <div class="linkedin-card p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
              <div class="flex items-center gap-2 sm:gap-3">
                <img src="${student.avatar}" alt="${student.name}" class="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-slate-200 shrink-0" />
                <input id="feed-post-input" type="text" placeholder="Start a post, share a skill milestone..." class="flex-1 min-w-0 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-slate-800 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-full border border-transparent focus:border-slate-300 focus:ring-1 focus:ring-primary transition-all outline-none" onkeydown="if(event.key==='Enter'){AppUI.publishPost();}" />
                <button onclick="AppUI.publishPost()" class="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-primary text-white text-xs font-bold rounded-full hover:bg-primary/90 transition-all shrink-0 shadow-xs">Post</button>
              </div>

              <!-- Quick Attachment Action Buttons -->
              <div class="grid grid-cols-4 gap-1 pt-2 border-t border-slate-100 text-[11px] sm:text-xs font-semibold text-center">
                <button onclick="AppUI.showToast('Upload feature ready for clinical case photos and charts!', 'info')" class="flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 rounded-lg hover:bg-slate-50 text-blue-600 transition-colors whitespace-nowrap">
                  <span class="material-symbols-outlined text-[16px] sm:text-[18px]">photo_camera</span>
                  <span>Photo</span>
                </button>
                <button onclick="AppUI.navigate('assessment')" class="flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 rounded-lg hover:bg-slate-50 text-emerald-600 transition-colors whitespace-nowrap">
                  <span class="material-symbols-outlined text-[16px] sm:text-[18px]">verified</span>
                  <span>Badge</span>
                </button>
                <button onclick="AppUI.navigate('industry-dashboard')" class="flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 rounded-lg hover:bg-slate-50 text-purple-600 transition-colors whitespace-nowrap">
                  <span class="material-symbols-outlined text-[16px] sm:text-[18px]">work</span>
                  <span>Job</span>
                </button>
                <button onclick="AppUI.showToast('Article draft opened for Ayush research review.', 'info')" class="flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 px-1 rounded-lg hover:bg-slate-50 text-amber-600 transition-colors whitespace-nowrap">
                  <span class="material-symbols-outlined text-[16px] sm:text-[18px]">article</span>
                  <span>Article</span>
                </button>
              </div>
            </div>

            <!-- Feed Sort / Filter Bar -->
            <div class="flex items-center justify-between text-xs text-slate-500 px-1">
              <div class="h-[1px] bg-slate-200 flex-1 mr-3"></div>
              <span class="font-medium">Sort by: <strong class="text-slate-800 cursor-pointer inline-flex items-center">Top Ayush Opportunities <span class="material-symbols-outlined text-sm align-middle ml-0.5">expand_more</span></strong></span>
            </div>

            <!-- Posts List -->
            <div class="space-y-4">
              ${posts.filter(p => !this.hiddenPostIds.has(p.id)).map(post => {
                const isMyPost = post.authorName === student.name || post.authorType === 'student';
                const cleanTime = (post.timeAgo || 'Just now').replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'Just now';
                const isMenuOpen = this.openPostMenuId === post.id;
                const isCommentsOpen = this.expandedCommentPostIds.has(post.id);
                const isEditing = this.editingPostId === post.id;
                const comments = post.commentsList || [
                  {
                    id: `c-init-${post.id}`,
                    authorName: 'Dr. Anand Verma',
                    authorRole: 'Ayush Practitioner @ Ministry of Ayush',
                    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                    timeAgo: '1h',
                    content: 'Excellent milestone and contribution to the Ayush ecosystem!'
                  }
                ];

                return `
                <div class="linkedin-card p-4 sm:p-5 space-y-3.5 relative" id="${post.id}">
                  <!-- Author Header & Three-Dots Post Settings Menu -->
                  <div class="flex items-start justify-between relative">
                    <div class="flex items-center gap-3 cursor-pointer group" onclick="AppUI.openFullProfileModal('${post.authorName}')" title="Click to view full LinkedIn profile">
                      <img src="${post.authorAvatar}" alt="${post.authorName}" class="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-primary/40 transition-all" />
                      <div>
                        <div class="flex items-center gap-1.5">
                          <h3 class="font-bold text-slate-900 text-sm group-hover:text-primary group-hover:underline">${post.authorName}</h3>
                          <span class="material-symbols-outlined text-primary text-[15px]" style="font-variation-settings: 'FILL' 1;">verified</span>
                        </div>
                        <p class="text-[11px] text-slate-500 leading-tight">${post.authorRole}</p>
                        <p class="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <span>${cleanTime}</span>
                          <span>•</span>
                          <span class="material-symbols-outlined text-[12px]">public</span>
                          ${post.isEdited ? '<span class="text-slate-400 italic">(edited)</span>' : ''}
                        </p>
                      </div>
                    </div>

                    <!-- Post Setting Three Dots Menu Button & Dropdown -->
                    <div class="relative">
                      <button onclick="AppUI.togglePostMenu('${post.id}')" class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors" title="Post options">
                        <span class="material-symbols-outlined text-lg">more_horiz</span>
                      </button>

                      <!-- Floating Post Settings Dropdown Menu -->
                      ${isMenuOpen ? `
                        <div class="absolute right-0 top-9 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 text-xs font-semibold">
                          <button onclick="AppUI.handleToggleSave('${post.id}')" class="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700">
                            <span class="material-symbols-outlined text-base ${post.saved ? 'text-primary' : 'text-slate-500'}">${post.saved ? 'bookmark_added' : 'bookmark_border'}</span>
                            <span>${post.saved ? 'Saved in Bookmarks ✓' : 'Save Post'}</span>
                          </button>
                          <button onclick="AppUI.handleCopyPostLink('${post.id}')" class="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700">
                            <span class="material-symbols-outlined text-base text-slate-500">link</span>
                            <span>Copy link to post</span>
                          </button>
                          ${isMyPost ? `
                            <button onclick="AppUI.handleStartEditPost('${post.id}')" class="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700">
                              <span class="material-symbols-outlined text-base text-primary">edit</span>
                              <span>Edit post text</span>
                            </button>
                            <button onclick="AppUI.handleDeletePost('${post.id}')" class="w-full text-left px-3.5 py-2 hover:bg-red-50 flex items-center gap-2.5 text-red-600">
                              <span class="material-symbols-outlined text-base text-red-500">delete</span>
                              <span>Delete post</span>
                            </button>
                          ` : `
                            <button onclick="AppUI.handleHidePost('${post.id}')" class="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700">
                              <span class="material-symbols-outlined text-base text-slate-500">visibility_off</span>
                              <span>I don't want to see this</span>
                            </button>
                            <button onclick="AppUI.handleReportPost('${post.id}')" class="w-full text-left px-3.5 py-2 hover:bg-red-50 flex items-center gap-2.5 text-red-600">
                              <span class="material-symbols-outlined text-base text-red-500">flag</span>
                              <span>Report post</span>
                            </button>
                          `}
                        </div>
                      ` : ''}
                    </div>
                  </div>

                  <!-- Post Text Content (or Edit View) -->
                  ${isEditing ? `
                    <div class="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <textarea id="edit-post-input-${post.id}" class="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent resize-none" rows="3">${post.content}</textarea>
                      <div class="flex justify-end gap-2">
                        <button onclick="AppUI.handleCancelEditPost()" class="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100">Cancel</button>
                        <button onclick="AppUI.handleSaveEditPost('${post.id}')" class="px-3 py-1.5 rounded-lg bg-primary text-white font-bold text-xs hover:bg-emerald-800">Save Changes</button>
                      </div>
                    </div>
                  ` : `
                    <div class="text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2">
                      ${post.content.split('\n\n').map(p => `<p>${p}</p>`).join('')}
                    </div>
                  `}

                  <!-- Opportunity Card Preview (if Company Job Post) -->
                  ${post.hasOpportunity ? `
                    <div class="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                      <div class="flex justify-between items-start">
                        <div>
                          <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Official Internship Opening</span>
                          <h4 class="font-bold text-slate-900 text-sm sm:text-base mt-1">${post.opportunityData.title}</h4>
                          <p class="text-xs text-slate-600">${post.opportunityData.company} • ${post.opportunityData.location}</p>
                        </div>
                        <span class="px-2.5 py-1 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-emerald-700 shadow-sm">${post.opportunityData.stipend}</span>
                      </div>

                      <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-100 text-xs">
                        <div class="flex items-center gap-1.5 text-slate-600">
                          <span class="material-symbols-outlined text-primary text-sm">schedule</span>
                          <span>${post.opportunityData.duration}</span>
                          <span class="mx-1">•</span>
                          <span class="font-semibold text-emerald-800">${post.opportunityData.matchRequired}</span>
                        </div>

                        ${isDaburApplied && post.opportunityData.id === 'OPP-DABUR-01' ? `
                          <button class="px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg font-bold text-xs flex items-center gap-1" disabled>
                            <span class="material-symbols-outlined text-sm">check_circle</span> Applied
                          </button>
                        ` : `
                          <button onclick="AppUI.applyFromFeed('${post.opportunityData.id}', '${post.opportunityData.company}')" class="px-4 py-1.5 bg-primary text-white rounded-lg font-bold text-xs hover:bg-primary/90 transition-all shadow flex items-center gap-1">
                            <span>1-Click Apply</span>
                            <span class="material-symbols-outlined text-sm">arrow_forward</span>
                          </button>
                        `}
                      </div>
                    </div>
                  ` : ''}

                  <!-- Credential Badge Card Preview (if Student Milestone Post) -->
                  ${post.hasBadge ? `
                    <div class="rounded-xl border border-blue-200 bg-blue-50/40 p-4 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                          <span class="material-symbols-outlined text-2xl">workspace_premium</span>
                        </div>
                        <div>
                          <h4 class="font-bold text-slate-900 text-xs sm:text-sm">${post.badgeData.title}</h4>
                          <p class="text-[11px] text-blue-800 font-semibold">${post.badgeData.score}</p>
                          <p class="text-[10px] text-slate-500">${post.badgeData.issuer}</p>
                        </div>
                      </div>
                      <button onclick="AppUI.navigate('assessment')" class="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-lg font-bold text-xs hover:bg-blue-50">
                        View Test
                      </button>
                    </div>
                  ` : ''}

                  <!-- Institutional Metrics Preview (if College Post) -->
                  ${post.hasMetrics ? `
                    <div class="rounded-xl border border-purple-200 bg-purple-50/40 p-3.5 grid grid-cols-3 gap-2 text-center text-xs">
                      <div class="p-2 bg-white rounded-lg border border-purple-100">
                        <div class="font-bold text-purple-800">${post.metricsData.placed}</div>
                        <div class="text-[10px] text-slate-500 mt-0.5">Cohort Placed</div>
                      </div>
                      <div class="p-2 bg-white rounded-lg border border-purple-100">
                        <div class="font-bold text-slate-900">${post.metricsData.avgPackage}</div>
                        <div class="text-[10px] text-slate-500 mt-0.5">Avg Package</div>
                      </div>
                      <div class="p-2 bg-white rounded-lg border border-purple-100">
                        <div class="font-bold text-emerald-700">${post.metricsData.topRecruiters}</div>
                        <div class="text-[10px] text-slate-500 mt-0.5">Recruiters</div>
                      </div>
                    </div>
                  ` : ''}

                  <!-- Reaction Counts & Metrics -->
                  <div class="flex justify-between items-center pt-2 text-[11px] text-slate-500 border-b border-slate-100 pb-2">
                    <div class="flex items-center gap-1">
                      <span class="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-xs">
                        <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>
                      </span>
                      <span class="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                        <svg class="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
                      </span>
                      <span class="ml-1 font-semibold">${post.likes} reactions</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="cursor-pointer hover:underline" onclick="AppUI.togglePostComments('${post.id}')">${post.comments || 0} comments</span> • <span class="cursor-pointer hover:underline" onclick="AppUI.handleRepost('${post.id}')">${post.reposts || 0} reposts</span>
                    </div>
                  </div>

                  <!-- Post Action Buttons (Like, Comment, Repost, Send) -->
                  <div class="flex justify-between items-center pt-1">
                    <button onclick="AppUI.togglePostLike('${post.id}')" class="post-action-btn ${post.liked ? 'liked' : ''}">
                      <span class="material-symbols-outlined text-[18px]">thumb_up</span>
                      <span>${post.liked ? 'Liked' : 'Like'}</span>
                    </button>
                    <button onclick="AppUI.togglePostComments('${post.id}')" class="post-action-btn ${isCommentsOpen ? 'text-primary font-bold bg-emerald-50/70' : ''}">
                      <span class="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                      <span>Comment</span>
                    </button>
                    <button onclick="AppUI.handleRepost('${post.id}')" class="post-action-btn ${post.reposted ? 'text-primary font-bold' : ''}">
                      <span class="material-symbols-outlined text-[18px]">repeat</span>
                      <span>${post.reposted ? 'Reposted' : 'Repost'}</span>
                    </button>
                    <button onclick="AppUI.handleSendPost('${post.id}')" class="post-action-btn">
                      <span class="material-symbols-outlined text-[18px]">send</span>
                      <span>Send</span>
                    </button>
                  </div>

                  <!-- Inline Expandable Comment Section -->
                  ${isCommentsOpen ? `
                    <div class="pt-3 border-t border-slate-100 space-y-3">
                      <!-- Add New Comment Input Box -->
                      <div class="flex items-start gap-2.5">
                        <img src="${student.avatar}" alt="${student.name}" class="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5" />
                        <div class="flex-1 flex gap-2">
                          <input 
                            id="comment-input-${post.id}"
                            type="text" 
                            placeholder="Add a comment on this Ayush opportunity..." 
                            class="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                            onkeydown="if(event.key === 'Enter') AppUI.handlePostComment('${post.id}')"
                          />
                          <button onclick="AppUI.handlePostComment('${post.id}')" class="px-3.5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors shrink-0">
                            Post
                          </button>
                        </div>
                      </div>

                      <!-- Comments List Stream -->
                      <div class="space-y-2.5 pt-1">
                        ${comments.map(c => `
                          <div class="flex items-start gap-2.5 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100/90 transition-colors group" onclick="AppUI.openFullProfileModal('${c.authorName}')" title="Click to view full LinkedIn profile">
                            <img src="${c.authorAvatar}" alt="${c.authorName}" class="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5 group-hover:ring-1 group-hover:ring-primary/40" />
                            <div class="flex-1 text-xs">
                              <div class="flex justify-between items-start">
                                <div>
                                  <span class="font-bold text-slate-900 group-hover:text-primary group-hover:underline">${c.authorName}</span>
                                  <p class="text-[10px] text-slate-400">${c.authorRole}</p>
                                </div>
                                <span class="text-[10px] text-slate-400">${c.timeAgo}</span>
                              </div>
                              <p class="text-slate-700 mt-1 leading-snug">${c.content}</p>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- RIGHT COLUMN: Trending Ayush News & Recommended Jobs (3 cols) -->
          <div class="lg:col-span-3 space-y-4">
            
            <!-- Trending Ayush News Widget -->
            <div class="linkedin-card p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-slate-900 text-sm">SkillSetu News</h3>
                <span class="material-symbols-outlined text-slate-400 text-sm">info</span>
              </div>
              <p class="text-[11px] text-slate-500 font-medium">Top Ayush & Healthcare Stories</p>

              <div class="space-y-3 pt-1">
                ${trending.map(news => `
                  <div class="space-y-0.5 cursor-pointer group" onclick="AppUI.showToast('${news.title}', 'info')">
                    <h4 class="text-xs font-bold text-slate-800 group-hover:text-primary group-hover:underline leading-snug">
                      • ${news.title}
                    </h4>
                    <p class="text-[10px] text-slate-400 pl-2">${news.readers}</p>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Recommended Job Matches Widget -->
            <div class="linkedin-card p-4 space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-slate-900 text-sm">Recommended Jobs</h3>
                <a href="javascript:void(0)" onclick="AppUI.navigate('industry-dashboard')" class="text-xs text-primary font-bold hover:underline">View all</a>
              </div>

              <div class="space-y-3 pt-1">
                <!-- Job 1 -->
                <div class="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div class="flex items-center gap-2">
                    <img src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=60&auto=format&fit=crop&q=80" alt="Dabur" class="w-7 h-7 rounded-lg object-cover" />
                    <div>
                      <h4 class="font-bold text-slate-900 text-xs">Ayurvedic Formulation QC</h4>
                      <p class="text-[10px] text-slate-500">Dabur India Ltd • Sahibabad</p>
                    </div>
                  </div>
                  <div class="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200/60">
                    <span class="font-bold text-emerald-700">₹28k/mo • 95% Match</span>
                    <button onclick="AppUI.openInternshipDetailModal('OPP-DABUR-01')" class="px-2.5 py-1 bg-primary text-white rounded-md text-[10px] font-bold hover:bg-emerald-800 transition-colors">Apply</button>
                  </div>
                </div>

                <!-- Job 2 -->
                <div class="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div class="flex items-center gap-2">
                    <img src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=60&auto=format&fit=crop&q=80" alt="Patanjali" class="w-7 h-7 rounded-lg object-cover" />
                    <div>
                      <h4 class="font-bold text-slate-900 text-xs">Clinical Herbology Fellow</h4>
                      <p class="text-[10px] text-slate-500">Patanjali Research • Haridwar</p>
                    </div>
                  </div>
                  <div class="flex justify-between items-center text-[11px] pt-1 border-t border-slate-200/60">
                    <span class="font-bold text-blue-700">₹35k/mo • 90% Match</span>
                    <button onclick="AppUI.openInternshipDetailModal('OPP-PATANJALI-02')" class="px-2.5 py-1 bg-primary text-white rounded-md text-[10px] font-bold hover:bg-emerald-800 transition-colors">Apply</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Links -->
            <div class="text-center text-[10px] text-slate-400 space-y-1 pt-2">
              <div class="flex flex-wrap justify-center gap-x-2 gap-y-1">
                <a href="#faq" class="hover:underline">About</a>
                <a href="#faq" class="hover:underline">Accessibility</a>
                <a href="#faq" class="hover:underline">Help Center</a>
                <a href="#faq" class="hover:underline">Privacy & Terms</a>
              </div>
              <p>SkillSetu Corporation © 2026 • Ministry of Ayush</p>
            </div>

          </div>

        </div>
      </main>
    `;
  },

  // Filter Colleges by keyword
  filterColleges(keyword) {
    const grid = document.getElementById('colleges-grid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.linkedin-card');
    const term = (keyword || '').toLowerCase().trim();
    cards.forEach(card => {
      const name = card.getAttribute('data-name') || '';
      const state = (card.getAttribute('data-state') || '').toLowerCase();
      if (!term || name.includes(term) || state.includes(term)) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  },

  // Filter Colleges by State dropdown
  filterCollegesByState(stateName) {
    const grid = document.getElementById('colleges-grid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.linkedin-card');
    cards.forEach(card => {
      const cardState = card.getAttribute('data-state') || '';
      if (stateName === 'all' || cardState === stateName) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  },

  // Colleges & Institutions Directory View (Role-Differentiated)
  getCollegesHTML(state) {
    const role = state.currentRole || 'student';
    const colleges = window.SKILLSETU_DATA.collegesDirectory || [];

    const isStudent = role === 'student';
    const isIndustry = role === 'industry';
    const isCollege = role === 'college';

    const pageTitle = isIndustry 
      ? 'Partner Institutions for Campus Hiring & Research' 
      : isCollege
      ? 'Accredited Ayush Colleges & Peer Benchmarks'
      : 'Accredited Ayush Colleges & Universities Directory';

    const pageSubtitle = isIndustry
      ? 'Partner with top Ayush medical colleges for on-campus talent recruitment drives, Schedule T certified batches, and joint research MoUs.'
      : isCollege
      ? 'Explore peer institutions, national curriculum benchmarks, and collaborative research initiatives across India.'
      : 'Explore 350+ recognized Ayush medical colleges, clinical teaching hospitals, NAAC rankings, and verified placement records.';

    return `
      <main class="pt-24 pb-20 px-3 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto w-full">
        <!-- Breadcrumb & Role Badge Header -->
        <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-label-sm text-xs font-semibold mb-2">
              <span class="material-symbols-outlined text-[16px] text-primary">account_balance</span>
              ${isIndustry ? 'Enterprise Academic Network' : isCollege ? 'Faculty Peer Network' : 'National Ayush Institutional Registry'}
            </div>
            <h1 class="font-display-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">${pageTitle}</h1>
            <p class="font-body-md text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">${pageSubtitle}</p>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="AppUI.navigate('feed')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-label-md text-xs font-bold transition-all flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">arrow_back</span> Back to Feed
            </button>
            ${isIndustry ? `
              <button onclick="AppUI.showToast('Select an accredited college below to schedule a campus drive', 'info')" class="px-4 py-2 bg-primary hover:bg-emerald-800 text-white rounded-xl font-label-md text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                <span class="material-symbols-outlined text-base">event</span> Schedule Campus Drive
              </button>
            ` : isStudent ? `
              <button onclick="AppUI.navigate('assessment')" class="px-4 py-2 bg-primary hover:bg-emerald-800 text-white rounded-xl font-label-md text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                <span class="material-symbols-outlined text-base">assignment</span> Take Diagnostic Quiz
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="linkedin-card p-4 mb-8 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div class="md:col-span-6 relative">
            <span class="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
            <input type="text" id="college-search-input" placeholder="Search by college name, city, state, or course..." onkeyup="AppUI.filterColleges(this.value)" class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary" />
          </div>
          <div class="md:col-span-3">
            <select onchange="AppUI.filterCollegesByState(this.value)" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-semibold focus:border-primary">
              <option value="all">All States / UTs (352+ Colleges)</option>
              <option value="Rajasthan">Rajasthan (NIA & Affiliates)</option>
              <option value="Delhi">Delhi NCR (AIIA New Delhi)</option>
              <option value="Gujarat">Gujarat (ITRA Jamnagar)</option>
              <option value="Uttar Pradesh">Uttar Pradesh (BHU & SAC)</option>
              <option value="Kerala">Kerala (Govt Ayurveda & Amrita)</option>
              <option value="Karnataka">Karnataka (NIUM Bengaluru)</option>
              <option value="Maharashtra">Maharashtra (Podar & Tilak)</option>
              <option value="Uttarakhand">Uttarakhand (Rishikul Haridwar)</option>
              <option value="West Bengal">West Bengal (J.B. Roy Kolkata)</option>
            </select>
          </div>
          <div class="md:col-span-3 text-right">
            <span class="text-xs font-bold text-slate-500">Showing <strong>${colleges.length} Apex & Premier Institutions</strong></span>
          </div>
        </div>

        <!-- Colleges Grid -->
        <div id="colleges-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${colleges.map(col => `
            <div class="linkedin-card overflow-hidden flex flex-col h-full group hover:shadow-lg transition-all border border-slate-200" data-name="${col.name.toLowerCase()}" data-state="${col.state}">
              <!-- Image Banner -->
              <div class="relative h-44 overflow-hidden bg-slate-100">
                <img src="${col.image}" alt="${col.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-emerald-900 font-extrabold text-[11px] border border-emerald-200 shadow-sm flex items-center gap-1">
                  <span class="material-symbols-outlined text-[13px] text-primary">verified</span> ${col.accreditation.split('•')[0].trim()}
                </div>
                <div class="absolute bottom-3 left-3 right-3 text-white">
                  <div class="text-[11px] text-emerald-300 font-bold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">location_on</span> ${col.location}
                  </div>
                  <h3 class="font-bold text-sm leading-tight text-white drop-shadow-sm mt-0.5">${col.name}</h3>
                </div>
              </div>

              <!-- Body Details -->
              <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div class="space-y-3">
                  <div class="text-[11px] text-slate-500 font-medium">
                    <span class="font-bold text-slate-700">Dean / Director:</span> ${col.dean} • <span class="font-bold text-slate-700">Est:</span> ${col.founded}
                  </div>

                  <!-- Metrics strip -->
                  <div class="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Campus Placements</div>
                      <div class="font-extrabold text-emerald-700 text-sm mt-0.5">${col.placementRate}</div>
                    </div>
                    <div>
                      <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Schedule T Adoption</div>
                      <div class="font-extrabold text-blue-700 text-sm mt-0.5">${col.bridgeAdoption}</div>
                    </div>
                  </div>

                  <!-- Disciplines -->
                  <div class="space-y-1">
                    <div class="text-[11px] font-bold text-slate-700">Programs Offered:</div>
                    <div class="flex flex-wrap gap-1">
                      ${col.disciplines.map(d => `
                        <span class="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md text-[10px] font-semibold border border-emerald-200/60">${d}</span>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Research Highlights -->
                  <div class="space-y-1 text-xs">
                    <div class="text-[11px] font-bold text-slate-700">Key Facilities & MoUs:</div>
                    <ul class="text-[11px] text-slate-600 space-y-0.5 pl-1">
                      ${col.highlights.map(h => `<li class="flex items-center gap-1.5"><span class="material-symbols-outlined text-primary text-[13px]">check</span> ${h}</li>`).join('')}
                    </ul>
                  </div>
                </div>

                <!-- Role Actions -->
                <div class="pt-3 border-t border-slate-100 flex items-center gap-2">
                  ${isIndustry ? `
                    <button onclick="AppUI.showToast('Campus recruitment request sent to ${col.name}! Placement officer will contact you.', 'success')" class="flex-1 py-2 bg-primary hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1">
                      <span class="material-symbols-outlined text-[15px]">event</span> Campus Drive
                    </button>
                    <button onclick="AppUI.showToast('Research MoU proposal initiated with ${col.name} under Ministry of Ayush grant scheme.', 'info')" class="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center" title="Initiate Research MoU">
                      <span class="material-symbols-outlined text-[15px]">handshake</span>
                    </button>
                  ` : isStudent ? `
                    <button onclick="AppUI.showToast('Official Contact & Admissions: ${col.contact}', 'info')" class="flex-1 py-2 bg-primary hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1">
                      <span class="material-symbols-outlined text-[15px]">school</span> Admissions & Info
                    </button>
                    <button onclick="AppUI.showToast('Opening virtual campus tour for ${col.name}', 'info')" class="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center" title="Virtual Tour">
                      <span class="material-symbols-outlined text-[15px]">visibility</span>
                    </button>
                  ` : `
                    <button onclick="AppUI.showToast('Benchmarking data for ${col.name} loaded into institutional review panel.', 'info')" class="flex-1 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1">
                      <span class="material-symbols-outlined text-[15px]">analytics</span> View Benchmarks
                    </button>
                  `}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </main>
    `;
  },

  // Ministry & National Intelligence View (Role-Differentiated)
  getMinistryInsightsHTML(state) {
    const role = state.currentRole || 'student';
    const insights = window.SKILLSETU_DATA.ministryInsights || {};
    const summary = insights.nationalSummary || {};
    const isIndustry = role === 'industry';
    const isMinistry = role === 'ministry';

    return `
      <main class="pt-24 pb-20 px-3 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto w-full">
        <!-- Header -->
        <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-label-sm text-xs font-semibold mb-2">
              <span class="material-symbols-outlined text-[16px] text-primary">policy</span>
              Ministry of Ayush • National Intelligence Portal
            </div>
            <h1 class="font-display-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ${isIndustry ? 'Ayush Regulatory Standards & Modernization Subsidies' : 'National Ayush Career Intelligence & Research Grants'}
            </h1>
            <p class="font-body-md text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              ${isIndustry 
                ? 'Official compliance guidelines for Schedule T of Drugs & Cosmetics Act, Ayush Premium Mark certification, and industrial modernization grants under National Ayush Mission.' 
                : 'Real-time industry hiring trends, highest paying clinical specializations, and Central Government scholarship grants co-funded under National Ayush Mission (NAM).'}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="AppUI.navigate('feed')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-label-md text-xs font-bold transition-all flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">arrow_back</span> Back to Feed
            </button>
            ${isMinistry ? `
              <button onclick="AppUI.navigate('ministry-dashboard')" class="px-4 py-2 bg-primary hover:bg-emerald-800 text-white rounded-xl font-label-md text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                <span class="material-symbols-outlined text-base">admin_panel_settings</span> Open Governance Admin Hub
              </button>
            ` : ''}
          </div>
        </div>

        <!-- National Stats Summary Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="linkedin-card p-5 text-center">
            <div class="text-2xl sm:text-3xl font-extrabold text-primary">${summary.activeInstitutes || 352}</div>
            <div class="text-xs text-slate-500 font-semibold mt-1">Affiliated Colleges & Universities</div>
          </div>
          <div class="linkedin-card p-5 text-center">
            <div class="text-2xl sm:text-3xl font-extrabold text-primary">${summary.registeredStudents || '42,850+'}</div>
            <div class="text-xs text-slate-500 font-semibold mt-1">Registered Scholars & Doctors</div>
          </div>
          <div class="linkedin-card p-5 text-center">
            <div class="text-2xl sm:text-3xl font-extrabold text-emerald-700">${summary.averageStipend || '₹3.8 - ₹6.5 LPA'}</div>
            <div class="text-xs text-slate-500 font-semibold mt-1">Average Starting CTC / Stipend</div>
          </div>
          <div class="linkedin-card p-5 text-center">
            <div class="text-2xl sm:text-3xl font-extrabold text-blue-700">${summary.gmpComplianceSurge || '+42% YoY'}</div>
            <div class="text-xs text-slate-500 font-semibold mt-1">Surge in Schedule T GMP Hiring</div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Left Column: High Growth Skills & Demand Index (6 cols) -->
          <div class="lg:col-span-6 space-y-6">
            <div class="linkedin-card p-4 sm:p-6 space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 class="font-bold text-slate-900 text-base">Top High-Growth Ayush Competencies</h2>
                  <p class="text-xs text-slate-500">Ranked by verified recruiter hiring demand across 1,240+ enterprises</p>
                </div>
                <span class="material-symbols-outlined text-primary text-2xl">trending_up</span>
              </div>

              <div class="space-y-3 pt-1">
                ${(insights.topHighGrowthSkills || []).map(s => `
                  <div class="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div class="flex items-center justify-between gap-2">
                      <h3 class="font-bold text-slate-900 text-xs sm:text-sm leading-snug flex-1 pr-1">${s.skill}</h3>
                      <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold shrink-0 whitespace-nowrap">${s.growth} YoY</span>
                    </div>
                    <div class="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                      <span class="font-semibold text-primary flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">local_fire_department</span> ${s.demand}
                      </span>
                      <span class="font-bold text-slate-800 text-xs sm:text-sm shrink-0">${s.avgSalary}</span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Regulatory Guidelines Highlight Card -->
            <div class="linkedin-card p-4 sm:p-6 space-y-3 border-l-4 border-l-primary">
              <div class="flex items-center gap-2 text-primary font-bold text-sm">
                <span class="material-symbols-outlined">gavel</span>
                <span>Schedule T Compliance Mandate (Drugs & Cosmetics Act)</span>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed">
                All Ayush manufacturing units must maintain sterile processing zones and standard batch records. Students completing the <strong>Schedule T GMP Bridge Course</strong> receive certified preference in all pharma recruitment pipelines.
              </p>
              <button onclick="AppUI.navigate('assessment')" class="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1">
                Take Diagnostic for Schedule T readiness <span class="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          </div>

          <!-- Right Column: Government Scholarships & Research Grants (6 cols) -->
          <div class="lg:col-span-6 space-y-6">
            <div class="linkedin-card p-6 space-y-4">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 class="font-bold text-slate-900 text-base">Ministry Scholarships & Research Grants</h2>
                  <p class="text-xs text-slate-500">Government schemes funded under National Ayush Mission (NAM)</p>
                </div>
                <span class="material-symbols-outlined text-emerald-600 text-2xl">card_membership</span>
              </div>

              <div class="space-y-3 pt-1">
                ${(insights.governmentScholarships || []).map(g => `
                  <div class="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200/80 space-y-2">
                    <div class="flex flex-wrap sm:flex-nowrap justify-between items-start sm:items-center gap-2">
                      <h3 class="font-bold text-slate-900 text-xs sm:text-sm leading-snug">${g.title}</h3>
                      <span class="px-2.5 py-0.5 bg-emerald-700 text-white rounded-md text-[11px] font-extrabold shrink-0 shadow-xs">${g.grantAmount}</span>
                    </div>
                    <p class="text-[11px] text-slate-600"><span class="font-semibold text-slate-700">Eligibility:</span> ${g.eligibility}</p>
                    <div class="flex justify-between items-center text-[11px] text-slate-500 pt-1.5 border-t border-emerald-200/40">
                      <span><strong>Deadline:</strong> ${g.deadline}</span>
                      <button onclick="AppUI.showToast('Application registered for ${g.title}!', 'success')" class="px-3 py-1 bg-primary text-white rounded-lg font-bold text-[11px] hover:bg-emerald-800 transition-colors shadow-xs">
                        Check & Apply
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </main>
    `;
  },

  activeNotificationFilter: 'all',
  studentChartTab: 'radar',

  setStudentChartTab(tab) {
    this.studentChartTab = tab;
    this.renderCurrentView();
  },

  setNotificationFilter(filter) {
    this.activeNotificationFilter = filter;
    this.renderCurrentView();
  },

  handleNotificationClick(notifId, actionView) {
    window.appState.markNotificationRead(notifId);
    if (actionView) {
      this.navigate(actionView);
    } else {
      this.renderCurrentView();
    }
  },

  handleMarkAllNotificationsRead() {
    const role = window.appState.state.currentRole || 'student';
    window.appState.markAllNotificationsRead(role);
    this.showToast('All notifications marked as read!', 'success');
    this.renderCurrentView();
  },

  openPostMenuId: null,
  expandedCommentPostIds: new Set(),
  editingPostId: null,
  hiddenPostIds: new Set(),

  togglePostMenu(postId) {
    this.openPostMenuId = this.openPostMenuId === postId ? null : postId;
    this.renderCurrentView();
  },

  handleToggleSave(postId) {
    const isSaved = window.appState.toggleSavePost(postId);
    this.openPostMenuId = null;
    this.showToast(isSaved ? 'Bookmark added! Post saved to your repository.' : 'Post removed from saved items.', isSaved ? 'success' : 'info');
    this.renderCurrentView();
  },

  handleCopyPostLink(postId) {
    this.openPostMenuId = null;
    const url = `${window.location.origin}${window.location.pathname}#feed?post=${postId}`;
    navigator.clipboard?.writeText?.(url);
    this.showToast('Post link copied to clipboard!', 'success');
  },

  handleStartEditPost(postId) {
    this.openPostMenuId = null;
    this.editingPostId = postId;
    this.renderCurrentView();
  },

  handleCancelEditPost() {
    this.editingPostId = null;
    this.renderCurrentView();
  },

  handleSaveEditPost(postId) {
    const textarea = document.getElementById(`edit-post-input-${postId}`);
    if (textarea && textarea.value.trim()) {
      window.appState.editPost(postId, textarea.value.trim());
      this.editingPostId = null;
      this.showToast('Post updated successfully!', 'success');
      this.renderCurrentView();
    }
  },

  handleDeletePost(postId) {
    this.openPostMenuId = null;
    window.appState.deletePost(postId);
    this.showToast('Post deleted successfully.', 'info');
    this.renderCurrentView();
  },

  handleHidePost(postId) {
    this.openPostMenuId = null;
    this.hiddenPostIds.add(postId);
    this.showToast('Post hidden from your feed.', 'info');
    this.renderCurrentView();
  },

  handleReportPost(postId) {
    this.openPostMenuId = null;
    this.showToast('Report submitted for Ayush Community Review. Thank you.', 'info');
    this.renderCurrentView();
  },

  togglePostComments(postId) {
    if (this.expandedCommentPostIds.has(postId)) {
      this.expandedCommentPostIds.delete(postId);
    } else {
      this.expandedCommentPostIds.add(postId);
    }
    this.renderCurrentView();
  },

  handlePostComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    if (input && input.value.trim()) {
      window.appState.addPostComment(postId, input.value.trim());
      input.value = '';
      this.showToast('Comment published!', 'success');
      this.renderCurrentView();
    }
  },

  handleRepost(postId) {
    const isReposted = window.appState.repostPost(postId);
    this.showToast(isReposted ? 'Reposted to your Ayush professional network!' : 'Repost removed.', isReposted ? 'success' : 'info');
    this.renderCurrentView();
  },

  handleSendPost(postId) {
    this.showToast('Direct message sharing link copied to clipboard.', 'info');
  },

  // Dedicated Notifications View (Accessible in every section)
  getNotificationsHTML(state) {
    const role = state.currentRole || 'student';
    const profile = window.appState.getProfileForRole(role);
    const allNotifs = window.appState.getNotifications(role);
    const unreadCount = window.appState.getUnreadNotificationsCount(role);

    // Apply active filter
    const filter = this.activeNotificationFilter || 'all';
    let filteredNotifs = allNotifs;
    if (filter === 'unread') {
      filteredNotifs = allNotifs.filter(n => !n.read);
    } else if (filter === 'job') {
      filteredNotifs = allNotifs.filter(n => n.type === 'job' || n.type === 'candidate');
    } else if (filter === 'grant') {
      filteredNotifs = allNotifs.filter(n => n.type === 'grant' || n.type === 'system');
    }

    return `
      <main class="pt-24 pb-20 px-3 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto w-full">
        <!-- Header & Breadcrumb -->
        <div class="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-label-sm text-xs font-semibold mb-2">
              <span class="material-symbols-outlined text-[16px] text-primary">notifications_active</span>
              Real-Time Alert Center • ${role === 'student' ? 'Student Scholar' : role === 'industry' ? 'Enterprise Recruiter' : role === 'college' ? 'Faculty Portal' : 'Ministry Admin'}
            </div>
            <h1 class="font-display-lg text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Notifications & System Alerts</h1>
            <p class="font-body-md text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Stay updated on recruiter profile viewings, competency benchmarks, Ministry research fellowships, and campus placement drives.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="AppUI.handleMarkAllNotificationsRead()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-label-md text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs">
              <span class="material-symbols-outlined text-base text-primary">done_all</span> Mark All as Read
            </button>
            <button onclick="AppUI.navigate('feed')" class="px-4 py-2 bg-primary hover:bg-emerald-800 text-white rounded-xl font-label-md text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
              <span class="material-symbols-outlined text-base">arrow_back</span> Back to Feed
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- LEFT COLUMN: Notification Filter Tabs & Preferences (4 cols) -->
          <div class="lg:col-span-4 space-y-4">
            <!-- Filter Pills Card -->
            <div class="linkedin-card p-4 space-y-2">
              <h3 class="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500 mb-2">Filter Notifications</h3>
              
              <button onclick="AppUI.setNotificationFilter('all')" class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${filter === 'all' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'}">
                <span class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">list_alt</span> All Notifications
                </span>
                <span class="px-2 py-0.5 rounded-full ${filter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'} text-[11px] font-extrabold">${allNotifs.length}</span>
              </button>

              <button onclick="AppUI.setNotificationFilter('unread')" class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${filter === 'unread' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'}">
                <span class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">mark_email_unread</span> Unread Alerts
                </span>
                <span class="px-2 py-0.5 rounded-full ${filter === 'unread' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'} text-[11px] font-extrabold">${unreadCount}</span>
              </button>

              <button onclick="AppUI.setNotificationFilter('job')" class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${filter === 'job' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'}">
                <span class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">work</span> ${role === 'industry' ? 'Candidate Applications' : 'Jobs & Placements'}
                </span>
                <span class="material-symbols-outlined text-xs opacity-60">chevron_right</span>
              </button>

              <button onclick="AppUI.setNotificationFilter('grant')" class="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${filter === 'grant' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-50 text-slate-700'}">
                <span class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px]">policy</span> Grants & Governance
                </span>
                <span class="material-symbols-outlined text-xs opacity-60">chevron_right</span>
              </button>
            </div>

            <!-- Notification Settings / Preferences Card -->
            <div class="linkedin-card p-5 space-y-3.5">
              <h3 class="font-bold text-slate-900 text-sm">Alert Preferences</h3>
              <div class="space-y-3 text-xs text-slate-600">
                <label class="flex items-center justify-between cursor-pointer">
                  <span>Email summary for new job matches</span>
                  <input type="checkbox" checked onchange="AppUI.showToast('Notification preference updated', 'info')" class="rounded text-primary focus:ring-primary h-4 w-4" />
                </label>
                <label class="flex items-center justify-between cursor-pointer">
                  <span>SMS alert for campus placement drives</span>
                  <input type="checkbox" checked onchange="AppUI.showToast('Notification preference updated', 'info')" class="rounded text-primary focus:ring-primary h-4 w-4" />
                </label>
                <label class="flex items-center justify-between cursor-pointer">
                  <span>Central Ministry grant announcements</span>
                  <input type="checkbox" checked onchange="AppUI.showToast('Notification preference updated', 'info')" class="rounded text-primary focus:ring-primary h-4 w-4" />
                </label>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: Notification Items Stream (8 cols) -->
          <div class="lg:col-span-8 space-y-3.5">
            ${filteredNotifs.length === 0 ? `
              <div class="linkedin-card p-12 text-center space-y-3">
                <div class="w-16 h-16 rounded-full bg-emerald-50 text-primary flex items-center justify-center mx-auto">
                  <span class="material-symbols-outlined text-3xl">notifications_off</span>
                </div>
                <h3 class="font-bold text-slate-900 text-base">No notifications found</h3>
                <p class="text-xs text-slate-500 max-w-sm mx-auto">You're all caught up! When recruiters, peers, or the Ministry take actions, they'll appear right here.</p>
                <button onclick="AppUI.setNotificationFilter('all')" class="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold">Show All Notifications</button>
              </div>
            ` : filteredNotifs.map(n => `
              <div class="linkedin-card p-4 sm:p-5 transition-all hover:shadow-md ${!n.read ? 'bg-emerald-50/30 border-l-4 border-l-primary' : 'bg-white border-l-4 border-l-transparent'} space-y-3">
                <!-- Top Header: Avatar, Author, Type Badge & Time -->
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <div class="relative shrink-0">
                      <img src="${n.avatar}" alt="${n.author}" class="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-200 shadow-xs" />
                      <div class="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full ${n.type === 'job' || n.type === 'candidate' ? 'bg-blue-600' : n.type === 'grant' ? 'bg-purple-600' : n.type === 'assessment' ? 'bg-emerald-600' : 'bg-slate-700'} text-white flex items-center justify-center text-[10px] sm:text-[11px] shadow-xs">
                        <span class="material-symbols-outlined text-[11px] sm:text-[13px]">
                          ${n.type === 'job' ? 'work' : n.type === 'candidate' ? 'person' : n.type === 'grant' ? 'card_membership' : n.type === 'assessment' ? 'assignment' : 'policy'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs font-bold text-slate-900">${n.author}</span>
                        <span class="text-slate-300">•</span>
                        <span class="text-[10px] text-slate-400 capitalize">${n.type} alert</span>
                      </div>
                      <span class="text-[10px] text-slate-400 font-medium">${n.timeAgo}</span>
                    </div>
                  </div>

                  <!-- Unread status badge -->
                  <div>
                    ${!n.read ? `
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> New
                      </span>
                    ` : `
                      <span class="text-[10px] text-slate-400 font-medium">Seen</span>
                    `}
                  </div>
                </div>

                <!-- Main Content: Title & Full-Width Message (No Empty Space) -->
                <div class="space-y-1.5 cursor-pointer" onclick="AppUI.handleNotificationClick('${n.id}', '${n.actionView}')">
                  <h4 class="font-bold text-slate-900 text-xs sm:text-sm leading-snug">${n.title}</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">${n.message}</p>
                </div>

                <!-- Bottom Actions Row -->
                <div class="flex items-center justify-between pt-2 border-t border-slate-100/80">
                  <div>
                    ${!n.read ? `
                      <button onclick="AppUI.handleNotificationClick('${n.id}', null)" class="text-[11px] text-slate-500 hover:text-slate-800 font-semibold hover:underline flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">done</span> Mark as read
                      </button>
                    ` : `
                      <span class="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">done_all</span> Read
                      </span>
                    `}
                  </div>

                  <button onclick="AppUI.handleNotificationClick('${n.id}', '${n.actionView}')" class="px-4 py-1.5 bg-primary hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5">
                    <span>${n.actionLabel || 'View Details'}</span>
                    <span class="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </main>
    `;
  },

  activeLandingTab: 'student',

  setLandingTab(tab) {
    this.activeLandingTab = tab;
    const tabData = {
      student: {
        title: "For Ayush Scholars & Doctors",
        desc: "Diagnose clinical competencies, bridge Schedule T GMP deficits with 1-click micro-modules, and apply directly to verified pharmaceutical and hospital openings.",
        cards: [
          { icon: "quiz", title: "10-Min Diagnostic", desc: "Scenario-based clinical & formulation assessment." },
          { icon: "radar", title: "6-Axis Skill Radar", desc: "Instant visual of strengths & industry gap analysis." },
          { icon: "work", title: "1-Click Direct Placements", desc: "Unlock 95%+ match ratings at Dabur, Patanjali & more." }
        ],
        btnText: "Launch Student Portal",
        role: "student"
      },
      industry: {
        title: "For Pharmaceutical & Hospital Recruiters",
        desc: "Discover pre-assessed, GMP-certified Ayush talent with verified clinical benchmarks. Shortlist candidates and post direct internship openings.",
        cards: [
          { icon: "verified_user", title: "Pre-Verified Talent", desc: "Access candidate profiles with validated Schedule T GMP scores." },
          { icon: "filter_alt", title: "Smart Candidate Filter", desc: "Filter by discipline, graduation year, and match percentage." },
          { icon: "post_add", title: "Instant Job Publishing", desc: "Post clinical & formulation internships in 60 seconds." }
        ],
        btnText: "Launch Recruiter Portal",
        role: "industry"
      },
      college: {
        title: "For Ayush Colleges & Faculty",
        desc: "Monitor student cohort readiness, track regional curriculum deficits, and publish targeted bridge courses to boost institutional placement rates.",
        cards: [
          { icon: "analytics", title: "Cohort Readiness", desc: "Real-time analytics on student clinical strengths." },
          { icon: "auto_fix_high", title: "Curriculum Gap Alerts", desc: "Automated alerts on formulation & regulatory deficits." },
          { icon: "school", title: "Bridge Course Creator", desc: "Publish institutional micro-learning modules." }
        ],
        btnText: "Launch Faculty Portal",
        role: "college"
      },
      ministry: {
        title: "For Ministry of Ayush & Regulators",
        desc: "Real-time national workforce intelligence, regional skill-gap heatmaps, and evidence-based curriculum reform data under the National Ayush Mission.",
        cards: [
          { icon: "public", title: "National Skill Heatmap", desc: "State-wise demand and talent density mapping." },
          { icon: "policy", title: "Schedule T Compliance", desc: "Track manufacturing readiness across 350+ institutions." },
          { icon: "trending_up", title: "Placement Analytics", desc: "Measure Ayush healthcare employment outcomes." }
        ],
        btnText: "Launch Ministry Admin Portal",
        role: "ministry"
      }
    };
    
    const container = document.getElementById('landing-tab-content');
    if (container) {
      const d = tabData[tab] || tabData.student;
      container.innerHTML = `
        <div class="fade-in-up bg-emerald-50/60 p-6 sm:p-8 rounded-2xl border border-emerald-200/80 shadow-xs space-y-6">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 class="font-headline-sm text-xl font-bold text-slate-900 mb-1">${d.title}</h3>
              <p class="text-xs sm:text-sm text-slate-600 max-w-2xl">${d.desc}</p>
            </div>
            <button onclick="AppUI.selectRoleAndLogin('${d.role}')" class="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-800 transition-all shadow-md shrink-0 flex items-center gap-2">
              <span>${d.btnText}</span>
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${d.cards.map(c => `
              <div class="p-4 bg-white/95 rounded-xl border border-emerald-100 shadow-2xs space-y-1.5">
                <div class="w-8 h-8 rounded-lg bg-emerald-50 text-primary flex items-center justify-center mb-2">
                  <span class="material-symbols-outlined text-base">${c.icon}</span>
                </div>
                <h4 class="font-bold text-slate-900 text-sm">${c.title}</h4>
                <p class="text-xs text-slate-500 leading-relaxed">${c.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      document.querySelectorAll('.landing-role-tab').forEach(btn => {
        if (btn.dataset.tab === tab) {
          btn.className = 'landing-role-tab px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2';
        } else {
          btn.className = 'landing-role-tab px-4 py-2.5 rounded-xl bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2';
        }
      });
    }
  },

  // FAQ Interactive Accordion Toggle
  toggleFAQ(faqId) {
    const targetEl = document.getElementById(faqId);
    if (!targetEl) return;
    const isCurrentlyOpen = targetEl.classList.contains('open');
    
    // Close all other FAQ cards for smooth accordion behavior
    document.querySelectorAll('.faq-card').forEach(card => {
      card.classList.remove('open');
    });
    
    if (!isCurrentlyOpen) {
      targetEl.classList.add('open');
    }
  },

  // 1. Landing Page HTML (Clean, Spacious, Interactive First-Time User Experience)
  getLandingHTML(state) {
    const stats = window.SKILLSETU_DATA.stats;
    return `
      <main class="pt-28 sm:pt-32 pb-20 px-4 sm:px-6 md:px-margin-desktop max-w-container-max mx-auto space-y-16 sm:space-y-20">
        <!-- 1. Hero Section with Breathing Room & Non-Overlapping Layout -->
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <!-- Left Content Column -->
          <div class="lg:col-span-7 flex flex-col items-start text-left space-y-4">
            <div class="stagger-item delay-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-label-sm text-xs font-semibold shadow-xs">
              <span class="material-symbols-outlined text-[16px] text-primary">verified</span>
              Ministry of Ayush • Government of India
            </div>
            
            <h1 class="stagger-item delay-2 font-display-lg text-3xl sm:text-4xl lg:text-5xl text-slate-900 font-extrabold tracking-tight leading-tight">
              The National Career & Skill Platform for <span class="text-primary underline decoration-primary/30">Ayush Professionals</span>
            </h1>
            
            <p class="stagger-item delay-3 font-body-lg text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              Connect with 1,200+ verified Ayush pharma enterprises, hospitals, and clinical research centers. Take a 10-min competency diagnostic, bridge curriculum skill gaps, and get placed directly.
            </p>

            <!-- Prominent Primary & Secondary Call to Action Buttons -->
            <div class="stagger-item delay-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto pt-1">
              <button onclick="AppUI.navigate('roles')" class="px-8 py-3.5 bg-primary text-white rounded-xl font-label-md text-sm sm:text-base font-bold hover:bg-emerald-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5 group">
                <span class="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">rocket_launch</span>
                <span>Launch SkillSetu Platform</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>

              <button onclick="AppUI.navigate('assessment')" class="px-6 py-3.5 bg-white text-primary border border-emerald-300 rounded-xl font-label-md text-sm sm:text-base font-bold hover:bg-emerald-50 transition-all shadow-xs flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-lg text-primary">speed</span>
                <span>Take 10-Min Diagnostic</span>
              </button>
            </div>

            <!-- Social Proof & Institution Trust Strip (Group of 2 Responsive Grid - No Truncation) -->
            <div class="stagger-item delay-5 grid grid-cols-2 gap-2 sm:gap-3.5 pt-3 border-t border-slate-200 w-full">
              <div class="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-slate-800 shadow-xs min-h-[48px]">
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100 text-primary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-sm sm:text-base">check_circle</span>
                </div>
                <span class="text-[11px] sm:text-xs font-bold leading-tight text-slate-800">100% Free for Students</span>
              </div>
              <div class="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-slate-800 shadow-xs min-h-[48px]">
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100 text-primary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-sm sm:text-base">verified</span>
                </div>
                <span class="text-[11px] sm:text-xs font-bold leading-tight text-slate-800">Industry Verified Badges</span>
              </div>
              <div class="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-slate-800 shadow-xs min-h-[48px]">
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100 text-primary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-sm sm:text-base">account_balance</span>
                </div>
                <span class="text-[11px] sm:text-xs font-bold leading-tight text-slate-800">350+ Accredited Colleges</span>
              </div>
              <div class="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-slate-800 shadow-xs min-h-[48px]">
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-100 text-primary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-sm sm:text-base">bolt</span>
                </div>
                <span class="text-[11px] sm:text-xs font-bold leading-tight text-slate-800">1-Click Direct Hiring</span>
              </div>
            </div>
          </div>

          <!-- Right Hero Image Column (Authentic Professional Medical Photo) -->
          <div class="stagger-item delay-3 lg:col-span-5 relative">
            <div class="linkedin-card overflow-hidden p-2.5 group shadow-lg">
              <div class="relative rounded-xl overflow-hidden">
                <img src="./assets/hero_ayush_bridge.jpg" alt="Ayush Doctors and Medical Students collaborating on Career Diagnostics" class="w-full h-[320px] sm:h-[390px] object-cover group-hover:scale-102 transition-transform duration-500" />
                
                <!-- Floating LinkedIn Style Credential Badge -->
                <div class="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between shadow-lg">
                  <div class="flex items-center gap-2.5">
                    <div class="w-9 h-9 rounded-lg bg-emerald-50 text-primary flex items-center justify-center border border-emerald-200">
                      <span class="material-symbols-outlined text-xl">school</span>
                    </div>
                    <div>
                      <div class="text-xs font-bold text-slate-900">National Competency Index</div>
                      <div class="text-[11px] text-slate-500">Real-time clinical skill verification</div>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                    98% Match Rate
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 2. Unified National Impact & Top Recruiter Showcase -->
        <section class="stagger-item delay-4 linkedin-card p-6 sm:p-8 space-y-6">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
              <span class="font-headline-md text-2xl sm:text-3xl text-primary font-extrabold mb-0.5">${stats.registeredStudents}</span>
              <span class="font-label-sm text-[11px] text-slate-600 uppercase tracking-wider font-semibold">Registered Doctors & Students</span>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
              <span class="font-headline-md text-2xl sm:text-3xl text-primary font-extrabold mb-0.5">${stats.industryPartners}</span>
              <span class="font-label-sm text-[11px] text-slate-600 uppercase tracking-wider font-semibold">Verified Enterprise Partners</span>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
              <span class="font-headline-md text-2xl sm:text-3xl text-primary font-extrabold mb-0.5">${stats.avgSkillMatch}</span>
              <span class="font-label-sm text-[11px] text-slate-600 uppercase tracking-wider font-semibold">Post-Bridge Match Rate</span>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-center">
              <span class="font-headline-md text-2xl sm:text-3xl text-primary font-extrabold mb-0.5">${stats.skillGapsResolved}</span>
              <span class="font-label-sm text-[11px] text-slate-600 uppercase tracking-wider font-semibold">Curriculum Gaps Resolved</span>
            </div>
          </div>

          <div class="border-t border-slate-100 pt-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 gap-2">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-lg">corporate_fare</span>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-700">Top Healthcare & Pharmaceutical Employers Hiring via SkillSetu</span>
              </div>
              <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 1,240+ Active Recruiters
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
              <!-- Employer 1 -->
              <div onclick="AppUI.openInternshipDetailModal('OPP-DABUR-01')" class="group p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition-all duration-200 flex flex-col items-center text-center cursor-pointer shadow-2xs hover:shadow-xs transform hover:-translate-y-0.5">
                <div class="w-9 h-9 rounded-lg bg-emerald-100/70 text-primary flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-lg">domain</span>
                </div>
                <div class="font-bold text-slate-900 text-xs leading-tight truncate w-full">Dabur India</div>
                <div class="text-[10px] text-emerald-700 font-semibold mt-0.5">18 Openings</div>
              </div>

              <!-- Employer 2 -->
              <div onclick="AppUI.openInternshipDetailModal('OPP-PATANJALI-01')" class="group p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition-all duration-200 flex flex-col items-center text-center cursor-pointer shadow-2xs hover:shadow-xs transform hover:-translate-y-0.5">
                <div class="w-9 h-9 rounded-lg bg-emerald-100/70 text-primary flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-lg">science</span>
                </div>
                <div class="font-bold text-slate-900 text-xs leading-tight truncate w-full">Patanjali Res.</div>
                <div class="text-[10px] text-emerald-700 font-semibold mt-0.5">12 Openings</div>
              </div>

              <!-- Employer 3 -->
              <div onclick="AppUI.openInternshipDetailModal('OPP-HIMALAYA-01')" class="group p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition-all duration-200 flex flex-col items-center text-center cursor-pointer shadow-2xs hover:shadow-xs transform hover:-translate-y-0.5">
                <div class="w-9 h-9 rounded-lg bg-emerald-100/70 text-primary flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-lg">spa</span>
                </div>
                <div class="font-bold text-slate-900 text-xs leading-tight truncate w-full">Himalaya Well.</div>
                <div class="text-[10px] text-emerald-700 font-semibold mt-0.5">15 Openings</div>
              </div>

              <!-- Employer 4 -->
              <div onclick="AppUI.openInternshipDetailModal('OPP-KOTTAKKAL-01')" class="group p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition-all duration-200 flex flex-col items-center text-center cursor-pointer shadow-2xs hover:shadow-xs transform hover:-translate-y-0.5">
                <div class="w-9 h-9 rounded-lg bg-emerald-100/70 text-primary flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-lg">local_hospital</span>
                </div>
                <div class="font-bold text-slate-900 text-xs leading-tight truncate w-full">Kottakkal Arya</div>
                <div class="text-[10px] text-emerald-700 font-semibold mt-0.5">9 Openings</div>
              </div>

              <!-- Employer 5 -->
              <div onclick="AppUI.openInternshipDetailModal('OPP-CHARAK-01')" class="group p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition-all duration-200 flex flex-col items-center text-center cursor-pointer shadow-2xs hover:shadow-xs transform hover:-translate-y-0.5">
                <div class="w-9 h-9 rounded-lg bg-emerald-100/70 text-primary flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-lg">medication</span>
                </div>
                <div class="font-bold text-slate-900 text-xs leading-tight truncate w-full">Charak Pharma</div>
                <div class="text-[10px] text-emerald-700 font-semibold mt-0.5">8 Openings</div>
              </div>

              <!-- Employer 6 -->
              <div onclick="AppUI.openInternshipDetailModal('OPP-BAIDYANATH-01')" class="group p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition-all duration-200 flex flex-col items-center text-center cursor-pointer shadow-2xs hover:shadow-xs transform hover:-translate-y-0.5">
                <div class="w-9 h-9 rounded-lg bg-emerald-100/70 text-primary flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                  <span class="material-symbols-outlined text-lg">healing</span>
                </div>
                <div class="font-bold text-slate-900 text-xs leading-tight truncate w-full">Baidyanath Ayu.</div>
                <div class="text-[10px] text-emerald-700 font-semibold mt-0.5">10 Openings</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3. Interactive Stakeholder Persona Explorer (Clean Onboarding Tabbed Experience) -->
        <section id="ecosystem" class="stagger-item delay-5 space-y-6">
          <div class="text-center max-w-2xl mx-auto space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-primary">Tailored Experience</span>
            <h2 class="font-headline-md text-2xl sm:text-3xl font-bold text-slate-900">Personalized For Every Stakeholder</h2>
            <p class="font-body-md text-slate-600 text-xs sm:text-sm">Select your role to explore how SkillSetu accelerates your clinical & institutional journey.</p>
          </div>

          <!-- Role Selector Tabs -->
          <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button onclick="AppUI.setLandingTab('student')" data-tab="student" class="landing-role-tab px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-base">school</span>
              <span>Students & Doctors</span>
            </button>
            <button onclick="AppUI.setLandingTab('industry')" data-tab="industry" class="landing-role-tab px-4 py-2.5 rounded-xl bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-base">domain</span>
              <span>Industry & Pharma</span>
            </button>
            <button onclick="AppUI.setLandingTab('college')" data-tab="college" class="landing-role-tab px-4 py-2.5 rounded-xl bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-base">account_balance</span>
              <span>Colleges & Faculty</span>
            </button>
            <button onclick="AppUI.setLandingTab('ministry')" data-tab="ministry" class="landing-role-tab px-4 py-2.5 rounded-xl bg-white text-slate-700 hover:bg-emerald-50 border border-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-base">admin_panel_settings</span>
              <span>Ministry of Ayush</span>
            </button>
          </div>

          <!-- Dynamic Role Tab Content Container -->
          <div id="landing-tab-content">
            <div class="fade-in-up bg-emerald-50/60 p-6 sm:p-8 rounded-2xl border border-emerald-200/80 shadow-xs space-y-6">
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 class="font-headline-sm text-xl font-bold text-slate-900 mb-1">For Ayush Scholars & Doctors</h3>
                  <p class="text-xs sm:text-sm text-slate-600 max-w-2xl">
                    Diagnose clinical competencies, bridge Schedule T GMP deficits with 1-click micro-modules, and apply directly to verified pharmaceutical and hospital openings.
                  </p>
                </div>
                <button onclick="AppUI.selectRoleAndLogin('student')" class="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs sm:text-sm hover:bg-emerald-800 transition-all shadow-md shrink-0 flex items-center gap-2">
                  <span>Launch Student Portal</span>
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 bg-white/95 rounded-xl border border-emerald-100 shadow-2xs space-y-1.5">
                  <div class="w-8 h-8 rounded-lg bg-emerald-50 text-primary flex items-center justify-center mb-2">
                    <span class="material-symbols-outlined text-base">quiz</span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-sm">10-Min Diagnostic</h4>
                  <p class="text-xs text-slate-500 leading-relaxed">Scenario-based clinical & formulation assessment.</p>
                </div>
                <div class="p-4 bg-white/95 rounded-xl border border-emerald-100 shadow-2xs space-y-1.5">
                  <div class="w-8 h-8 rounded-lg bg-emerald-50 text-primary flex items-center justify-center mb-2">
                    <span class="material-symbols-outlined text-base">radar</span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-sm">6-Axis Skill Radar</h4>
                  <p class="text-xs text-slate-500 leading-relaxed">Instant visual of strengths & industry gap analysis.</p>
                </div>
                <div class="p-4 bg-white/95 rounded-xl border border-emerald-100 shadow-2xs space-y-1.5">
                  <div class="w-8 h-8 rounded-lg bg-emerald-50 text-primary flex items-center justify-center mb-2">
                    <span class="material-symbols-outlined text-base">work</span>
                  </div>
                  <h4 class="font-bold text-slate-900 text-sm">1-Click Direct Placements</h4>
                  <p class="text-xs text-slate-500 leading-relaxed">Unlock 95%+ match ratings at Dabur, Patanjali & more.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 4. 3-Step Clear Career Pathway (No Clutter, Clean Linear Roadmap) -->
        <section id="capabilities" class="stagger-item delay-6 space-y-8">
          <div class="text-center max-w-2xl mx-auto space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-primary">Simple 3-Step Pathway</span>
            <h2 class="font-headline-md text-2xl sm:text-3xl font-bold text-slate-900">How SkillSetu Works</h2>
            <p class="font-body-md text-slate-600 text-xs sm:text-sm">From initial diagnostic to verified industrial placement in three streamlined steps.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Step 1 -->
            <div class="linkedin-card p-6 flex flex-col relative group">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center text-sm font-extrabold mb-4 border border-emerald-200">
                1
              </div>
              <h3 class="font-headline-sm text-base font-bold text-slate-900 mb-1.5">Take 10-Min Diagnostic</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Take a quick 5-question scenario quiz covering clinical diagnosis, herbology, and manufacturing standards.
              </p>
            </div>

            <!-- Step 2 -->
            <div class="linkedin-card p-6 flex flex-col relative group">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center text-sm font-extrabold mb-4 border border-emerald-200">
                2
              </div>
              <h3 class="font-headline-sm text-base font-bold text-slate-900 mb-1.5">View AI Competency Radar</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Your interactive 6-axis polygon highlights clinical strengths and pinpoints exact Schedule T GMP deficits.
              </p>
            </div>

            <!-- Step 3 -->
            <div class="linkedin-card p-6 flex flex-col relative group">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center text-sm font-extrabold mb-4 border border-emerald-200">
                3
              </div>
              <h3 class="font-headline-sm text-base font-bold text-slate-900 mb-1.5">Bridge & 1-Click Apply</h3>
              <p class="text-xs text-slate-600 leading-relaxed">
                Complete free 1-click micro-modules, upgrade your score to 85%+, and apply directly to verified openings.
              </p>
            </div>
          </div>
        </section>

        <!-- 5. Supported Ayush Branches (Clean Grid) -->
        <section id="disciplines" class="stagger-item delay-7 space-y-8">
          <div class="text-center max-w-2xl mx-auto space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-primary">National Coverage</span>
            <h2 class="font-headline-md text-2xl sm:text-3xl font-bold text-slate-900">Ayush Disciplines Supported</h2>
            <p class="font-body-md text-xs sm:text-sm text-slate-600">Standardized competency frameworks tailored for all traditional healthcare branches.</p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div class="linkedin-card p-5 text-center">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <span class="material-symbols-outlined text-xl">spa</span>
              </div>
              <h3 class="font-headline-sm text-sm font-bold text-slate-900 mb-1">Ayurveda</h3>
              <p class="text-[11px] text-slate-500">BAMS & MD (Panchakarma, Dravyaguna, Rasa Shastra, GMP)</p>
            </div>

            <div class="linkedin-card p-5 text-center">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <span class="material-symbols-outlined text-xl">self_improvement</span>
              </div>
              <h3 class="font-headline-sm text-sm font-bold text-slate-900 mb-1">Yoga & Naturopathy</h3>
              <p class="text-[11px] text-slate-500">BNYS & M.Sc (Therapeutic Yoga, Rehabilitation Protocols)</p>
            </div>

            <div class="linkedin-card p-5 text-center">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <span class="material-symbols-outlined text-xl">science</span>
              </div>
              <h3 class="font-headline-sm text-sm font-bold text-slate-900 mb-1">Unani Medicine</h3>
              <p class="text-[11px] text-slate-500">BUMS & MD (Ilaj-bit-Tadbeer, Moalajat, Pharmacognosy)</p>
            </div>

            <div class="linkedin-card p-5 text-center">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-primary flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <span class="material-symbols-outlined text-xl">medication</span>
              </div>
              <h3 class="font-headline-sm text-sm font-bold text-slate-900 mb-1">Siddha & Homeopathy</h3>
              <p class="text-[11px] text-slate-500">BSMS & BHMS (Varmam Therapy, Repertory, Formulations)</p>
            </div>
          </div>
        </section>

        <!-- 6. Interactive FAQ Section with Clean Accordion -->
        <section id="faq" class="stagger-item delay-8 max-w-4xl mx-auto space-y-8">
          <div class="text-center space-y-2">
            <span class="text-xs font-bold uppercase tracking-wider text-primary">Got Questions?</span>
            <h2 class="font-headline-md text-2xl sm:text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
            <p class="font-body-md text-xs sm:text-sm text-slate-600">Everything you need to know about testing, bridge courses, and hiring on SkillSetu.</p>
          </div>

          <div class="space-y-3.5">
            <!-- FAQ 1 (Open by default) -->
            <div id="faq-card-1" class="faq-card open linkedin-card p-5 cursor-pointer" onclick="AppUI.toggleFAQ('faq-card-1')">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">General</span>
                  <h3 class="font-headline-sm text-sm sm:text-base font-bold text-slate-900">
                    Is SkillSetu free for Ayush students and colleges?
                  </h3>
                </div>
                <span class="material-symbols-outlined faq-chevron text-slate-400 text-xl shrink-0">expand_more</span>
              </div>
              <div class="faq-content text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                Yes, SkillSetu is a 100% free digital governance initiative under the Ministry of Ayush, Government of India. All competency assessments, Skill Radar visualizations, bridge micro-learning modules, and internship applications are completely free.
              </div>
            </div>

            <!-- FAQ 2 -->
            <div id="faq-card-2" class="faq-card linkedin-card p-5 cursor-pointer" onclick="AppUI.toggleFAQ('faq-card-2')">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">Curriculum</span>
                  <h3 class="font-headline-sm text-sm sm:text-base font-bold text-slate-900">
                    What is Schedule T GMP and why is it essential for placements?
                  </h3>
                </div>
                <span class="material-symbols-outlined faq-chevron text-slate-400 text-xl shrink-0">expand_more</span>
              </div>
              <div class="faq-content text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                Schedule T of the Drugs & Cosmetics Act specifies the Good Manufacturing Practices (GMP) for Ayurvedic, Siddha, and Unani drugs — including sterile handling, standard operating procedures (SOPs), and batch documentation.
              </div>
            </div>

            <!-- FAQ 3 -->
            <div id="faq-card-3" class="faq-card linkedin-card p-5 cursor-pointer" onclick="AppUI.toggleFAQ('faq-card-3')">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">AI Diagnostics</span>
                  <h3 class="font-headline-sm text-sm sm:text-base font-bold text-slate-900">
                    How does the 6-Axis Clinical Skill Radar calculate my scores?
                  </h3>
                </div>
                <span class="material-symbols-outlined faq-chevron text-slate-400 text-xl shrink-0">expand_more</span>
              </div>
              <div class="faq-content text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                The Skill Radar maps your answers against verified Indian Pharmacopoeia and clinical benchmarks across 6 core domains. Scores are dynamically recalculated as you complete bridge modules.
              </div>
            </div>

            <!-- FAQ 4 -->
            <div id="faq-card-4" class="faq-card linkedin-card p-5 cursor-pointer" onclick="AppUI.toggleFAQ('faq-card-4')">
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">Industry</span>
                  <h3 class="font-headline-sm text-sm sm:text-base font-bold text-slate-900">
                    How do recruiters like Dabur and Patanjali evaluate candidates?
                  </h3>
                </div>
                <span class="material-symbols-outlined faq-chevron text-slate-400 text-xl shrink-0">expand_more</span>
              </div>
              <div class="faq-content text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                Recruiters log into the Industry Portal and filter talent by verified benchmark scores, specific bridge course certifications, and match percentages. They can shortlist candidates directly with zero friction.
              </div>
            </div>
          </div>
        </section>

        <!-- 7. Final Call to Action Banner -->
        <section class="stagger-item delay-9 linkedin-card p-8 sm:p-12 text-center bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white relative overflow-hidden shadow-xl">
          <div class="max-w-2xl mx-auto space-y-4 relative z-10">
            <span class="inline-block px-3 py-1 bg-emerald-700/50 rounded-full text-xs font-bold text-emerald-200 border border-emerald-500/30">Official Ayush Skill Network</span>
            <h2 class="font-display-lg text-2xl sm:text-4xl font-extrabold text-white">Join 42,850+ Ayush Scholars & Recruiters</h2>
            <p class="font-body-lg text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Sign in to assess your skills, upgrade your diagnostic competencies, and access verified nationwide opportunities.
            </p>
            <div class="pt-2">
              <button onclick="AppUI.navigate('roles')" class="px-8 py-3.5 bg-white text-emerald-900 rounded-xl font-label-md text-sm font-bold hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2 transform hover:-translate-y-0.5">
                <span class="material-symbols-outlined text-lg">login</span>
                <span>Select Your Portal / Get Started</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
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
        <!-- Header -->
        <div class="w-full flex justify-between items-center mb-10 max-w-6xl mx-auto">
          <button onclick="AppUI.navigate('home')" class="flex items-center gap-2 text-primary font-label-md text-sm font-semibold hover:underline">
            <span class="material-symbols-outlined text-lg">arrow_back</span> Back to Home
          </button>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 text-primary font-label-sm text-xs border border-primary/20">
            Step 1 of 2: Role Selection
          </div>
        </div>

        <div class="text-center mb-12 max-w-2xl mx-auto space-y-3">
          <h1 class="font-display-lg text-3xl md:text-4xl font-bold text-on-surface">Select Your Portal</h1>
          <p class="font-body-lg text-on-surface-variant text-sm md:text-base">Choose your stakeholder role to proceed to the personalized sign-in screen.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto mb-12">
          <!-- Student -->
          <div onclick="AppUI.selectRoleAndLogin('student')" class="role-portal-card glass-card rounded-2xl p-8 flex flex-col items-center text-center h-full group cursor-pointer border border-primary/20">
            <div class="role-icon-box w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform mx-auto">
              <span class="material-symbols-outlined text-3xl">school</span>
            </div>
            <h2 class="font-headline-sm text-xl font-bold text-on-surface mb-2 text-center">Student</h2>
            <p class="font-body-md text-xs text-on-surface-variant mb-6 flex-1 text-center">Take skill assessments, bridge knowledge gaps, and apply to top industry opportunities.</p>
            <button class="w-full py-2.5 px-4 rounded-xl bg-surface-container-highest text-primary font-label-md text-sm font-semibold group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2">
              Select Student <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <!-- Industry -->
          <div onclick="AppUI.selectRoleAndLogin('industry')" class="role-portal-card glass-card rounded-2xl p-8 flex flex-col items-center text-center h-full group cursor-pointer border border-primary/20">
            <div class="role-icon-box w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform mx-auto">
              <span class="material-symbols-outlined text-3xl">domain</span>
            </div>
            <h2 class="font-headline-sm text-xl font-bold text-on-surface mb-2 text-center">Industry</h2>
            <p class="font-body-md text-xs text-on-surface-variant mb-6 flex-1 text-center">Find verified Ayush talent, shortlist candidates, and post internship & job openings.</p>
            <button class="w-full py-2.5 px-4 rounded-xl bg-surface-container-highest text-primary font-label-md text-sm font-semibold group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2">
              Select Industry <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <!-- College -->
          <div onclick="AppUI.selectRoleAndLogin('college')" class="role-portal-card glass-card rounded-2xl p-8 flex flex-col items-center text-center h-full group cursor-pointer border border-primary/20">
            <div class="role-icon-box w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform mx-auto">
              <span class="material-symbols-outlined text-3xl">account_balance</span>
            </div>
            <h2 class="font-headline-sm text-xl font-bold text-on-surface mb-2 text-center">College & Faculty</h2>
            <p class="font-body-md text-xs text-on-surface-variant mb-6 flex-1 text-center">Track student cohort competencies, analyze deficits, and publish bridge courses.</p>
            <button class="w-full py-2.5 px-4 rounded-xl bg-surface-container-highest text-primary font-label-md text-sm font-semibold group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2">
              Select Faculty <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <!-- Ministry -->
          <div onclick="AppUI.selectRoleAndLogin('ministry')" class="role-portal-card glass-card rounded-2xl p-8 flex flex-col items-center text-center h-full group cursor-pointer border border-primary/20">
            <div class="role-icon-box w-16 h-16 rounded-xl bg-primary-container/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform mx-auto">
              <span class="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>
            <h2 class="font-headline-sm text-xl font-bold text-on-surface mb-2 text-center">Ministry Admin</h2>
            <p class="font-body-md text-xs text-on-surface-variant mb-6 flex-1 text-center">Access national impact analytics, regional skill-gap heatmaps, and placement trends.</p>
            <button class="w-full py-2.5 px-4 rounded-xl bg-surface-container-highest text-primary font-label-md text-sm font-semibold group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center gap-2">
              Select Admin <span class="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    `;
  },

  // 3. Login / Auth HTML
  getLoginHTML(state) {
    const role = state.currentRole || 'student';
    const roleConfig = {
      student: {
        badge: 'Login as Student',
        title: 'Welcome Student',
        desc: 'Sign in to access your skills dashboard and internship opportunities.',
        email: 'shubham.rawal@nia.edu.in',
        name: 'Shubham Rawal',
        icon: 'school',
        roleSubtitle: 'BAMS Cohort 2024 • NIA Jaipur'
      },
      industry: {
        badge: 'Login as Industry Partner',
        title: 'Industry Portal Access',
        desc: 'Sign in to recruit verified Ayush talent and publish opportunities.',
        email: 'talent@dabur.com',
        name: 'Dabur India / Patanjali HR',
        icon: 'domain',
        roleSubtitle: 'Verified Corporate Partner'
      },
      college: {
        badge: 'Login as College Faculty',
        title: 'Faculty Portal Access',
        desc: 'Sign in to monitor student cohort readiness and create bridge courses.',
        email: 'faculty@nia.edu.in',
        name: 'Prof. Meenakshi Sundaram',
        icon: 'account_balance',
        roleSubtitle: 'National Institute of Ayurveda (Jaipur)'
      },
      ministry: {
        badge: 'Login as Ministry Admin',
        title: 'Ayush Admin Access',
        desc: 'Sign in to view national workforce analytics and regional heatmaps.',
        email: 'admin@ayush.gov.in',
        name: 'Ayush Governance Admin',
        icon: 'admin_panel_settings',
        roleSubtitle: 'Ministry of Ayush, Govt. of India'
      }
    };

    const cfg = roleConfig[role] || roleConfig.student;

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
              <p class="font-body-md text-sm text-on-surface-variant leading-relaxed mb-6">
                Connect traditional Ayush wisdom with verified competencies, bridge courses, and top industry placements.
              </p>

              <div class="p-4 rounded-xl bg-white/70 border border-primary/15 mb-4 shadow-sm">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-10 h-10 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
                    <span class="material-symbols-outlined text-xl">${cfg.icon}</span>
                  </div>
                  <div>
                    <div class="font-bold text-xs text-on-surface">${cfg.name}</div>
                    <div class="text-[11px] text-on-surface-variant">${cfg.roleSubtitle}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Portal Security Badges -->
            <div class="pt-6 border-t border-primary/15 space-y-3">
              <div class="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <span class="material-symbols-outlined text-primary text-base">verified_user</span>
                <span>256-Bit SSL Encrypted Portal</span>
              </div>
              <div class="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <span class="material-symbols-outlined text-primary text-base">badge</span>
                <span>Verified Stakeholder Credentials</span>
              </div>
              <div class="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <span class="material-symbols-outlined text-primary text-base">lock</span>
                <span>Ministry of Ayush Data Protection</span>
              </div>
            </div>
          </div>

          <!-- Right Form Panel -->
          <div class="p-8 md:p-10 flex flex-col justify-center bg-surface-container-lowest">
            <div class="flex justify-between items-center mb-6">
              <button onclick="AppUI.navigate('roles')" class="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                <span class="material-symbols-outlined text-sm">arrow_back</span> Change Role
              </button>
              <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-container/10 text-primary text-xs font-semibold border border-primary/20">
                <span class="material-symbols-outlined text-sm">${cfg.icon}</span> ${cfg.badge}
              </div>
            </div>

            <div class="mb-6">
              <h3 class="font-headline-sm text-2xl font-bold text-on-surface">${cfg.title}</h3>
              <p class="font-body-md text-xs text-on-surface-variant">${cfg.desc}</p>
            </div>

            <form onsubmit="event.preventDefault(); AppUI.handleLoginSubmit();" class="space-y-4">
              <div>
                <label class="block font-label-md text-xs text-on-surface mb-1 font-semibold">Ayush ID or Email Address</label>
                <input type="text" value="${cfg.email}" class="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="block font-label-md text-xs text-on-surface font-semibold">Password</label>
                  <a href="javascript:void(0)" class="text-xs text-primary hover:underline">Forgot?</a>
                </div>
                <input type="password" value="••••••••••••" class="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>

              <button type="submit" class="w-full py-3 bg-primary text-white rounded-xl font-label-md text-xs sm:text-sm font-bold hover:bg-emerald-800 transition-all shadow-md mt-4 flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                <span>Sign In to ${role === 'student' ? 'Student' : role === 'industry' ? 'Industry' : role === 'college' ? 'College' : 'Ministry'} Dashboard</span>
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
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

    const nationalAverages = {
      Panchakarma: 72,
      Herbology: 68,
      PatientCare: 74,
      Diagnostics: 66,
      GMP: 50,
      Research: 58
    };

    const allSkillsList = [
      { key: "Panchakarma", shortLabel: "Panchakarma", name: "Panchakarma Therapy", icon: "spa", current: student.skills.Panchakarma.current, expected: student.skills.Panchakarma.expected, natAvg: nationalAverages.Panchakarma, focus: "Snehana, Swedana, Vamana, Virechana & Basti Protocols", domainId: "BC-PAN-101" },
      { key: "Herbology", shortLabel: "Herbology", name: "Herbology & Dravyaguna", icon: "eco", current: student.skills.Herbology.current, expected: student.skills.Herbology.expected, natAvg: nationalAverages.Herbology, focus: "Phytochemistry, HPTLC Standardization & Extract R&D", domainId: "BC-HERB-102" },
      { key: "PatientCare", shortLabel: "Patient Care", name: "Patient Care & Clinical Nadi", icon: "stethoscope", current: student.skills.PatientCare.current, expected: student.skills.PatientCare.expected, natAvg: nationalAverages.PatientCare, focus: "Nadi Pariksha, Prakriti Analysis & Bedside Diagnosis", domainId: "BC-PAT-103" },
      { key: "Diagnostics", shortLabel: "Pulse Nidan", name: "Pulse & Rog Nidan", icon: "vital_signs", current: student.skills.Diagnostics.current, expected: student.skills.Diagnostics.expected, natAvg: nationalAverages.Diagnostics, focus: "Ashtavidha Pariksha & Clinical Lab Interpretation", domainId: "BC-DIAG-104" },
      { key: "GMP", shortLabel: "Schedule T", name: "Schedule T GMP Compliance", icon: "verified", current: student.skills.GMP.current, expected: student.skills.GMP.expected, natAvg: nationalAverages.GMP, focus: "AYUSH Schedule T SOPs, Cleanroom QC & Batch Records", domainId: "BC-GMP-101" },
      { key: "Research", shortLabel: "Clinical R&D", name: "Clinical Research & GCP", icon: "science", current: student.skills.Research.current, expected: student.skills.Research.expected, natAvg: nationalAverages.Research, focus: "GCP Compliance, Pharmacovigilance & Case Documentation", domainId: "BC-RES-105" }
    ];

    const deficitSkills = allSkillsList.filter(s => s.current < 75);
    const hasDeficit = deficitSkills.length > 0;
    const primaryDeficit = hasDeficit ? deficitSkills[0] : null;
    const primaryCourse = primaryDeficit 
      ? (state.bridgeCourses.find(c => c.domain === primaryDeficit.key || c.id === primaryDeficit.domainId) || state.bridgeCourses[0])
      : null;

    const radarCoords = window.appState.getRadarCoordinates(student.skills, 68, 95, 95);

    return `
      <main class="pt-28 pb-24 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col gap-8">
        <!-- Welcome Header -->
        <section class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-panel p-6 rounded-2xl">
          <div class="flex items-center gap-4">
            <div class="relative group cursor-pointer" onclick="AppUI.openFullProfileModal('me')" title="Click to view full LinkedIn profile">
              <img src="${student.avatar}" alt="${student.name}" class="w-16 h-16 rounded-full object-cover border-2 border-primary/30 shadow-md group-hover:opacity-85 transition-opacity" />
              <div class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <span class="material-symbols-outlined text-base">visibility</span>
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-container/10 text-primary text-[11px] font-bold border border-primary/20">
                  <span class="material-symbols-outlined text-[13px]">verified</span> Verified Ayush Student
                </div>
                <button onclick="AppUI.openFullProfileModal('me')" class="px-2.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1 transition-all">
                  <span class="material-symbols-outlined text-[12px] text-primary">person</span> View Profile
                </button>
                <button onclick="AppUI.openEditProfileModal()" class="px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[10px] font-bold border border-slate-200 inline-flex items-center gap-1 transition-all">
                  <span class="material-symbols-outlined text-[12px] text-slate-600">edit</span> Edit
                </button>
              </div>
              <h1 class="font-headline-md text-2xl md:text-3xl font-bold text-on-surface cursor-pointer hover:text-primary transition-colors" onclick="AppUI.openFullProfileModal('me')">Welcome back, ${student.name}</h1>
              <p class="font-body-md text-xs sm:text-sm text-on-surface-variant">${student.program} • ${student.institution}</p>
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

        <!-- Benchmark Analytics & Radar Morph Engine (Dual Visual Panel) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div class="lg:col-span-8 glass-panel p-4 sm:p-6 md:p-8 rounded-2xl flex flex-col justify-between overflow-hidden">
            <div>
              <!-- Card Header -->
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-slate-200/80">
                <div>
                  <h3 class="font-headline-sm text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-2xl">bar_chart</span>
                    <span>Ayush Competency Benchmark vs. Industry Baseline</span>
                  </h3>
                  <p class="text-xs text-slate-500 mt-1">Direct comparison of your evaluated skills against the 75% national industry requirement threshold.</p>
                </div>
                <button onclick="AppUI.navigate('assessment')" class="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 self-stretch sm:self-auto justify-center">
                  <span class="material-symbols-outlined text-sm">quiz</span>
                  <span>Retake Quiz</span>
                </button>
              </div>

              <!-- 6-Axis Clean Bar Chart Container -->
              <div class="bg-white rounded-xl p-3 sm:p-6 border border-slate-200/80 shadow-xs">
                <!-- Bar Grid -->
                <div class="h-56 sm:h-64 flex items-end justify-between gap-1 sm:gap-4 px-0.5 sm:px-4 pb-2 border-b-2 border-slate-300 relative">
                  <!-- 75% Target Reference Line -->
                  <div class="absolute left-0 right-0 top-[25%] border-t-2 border-dashed border-slate-400/80 z-0 pointer-events-none flex justify-end pr-2">
                    <span class="text-[9px] sm:text-[10px] font-bold text-slate-500 bg-white/90 px-1 py-0.5 rounded shadow-xs -mt-3">Industry Req (75%)</span>
                  </div>

                  <!-- 6 Distinct Category Columns -->
                  ${allSkillsList.map((s) => {
                    const isDeficit = s.current < 75;
                    const barHeightPct = Math.min(100, Math.max(12, s.current));
                    return `
                      <div class="flex-1 flex flex-col items-center h-full justify-end relative z-10 group max-w-[32px] sm:max-w-[48px] mx-auto">
                        <!-- Score Number on Top -->
                        <span class="text-[10px] sm:text-xs font-extrabold ${isDeficit ? 'text-red-600 font-black' : 'text-emerald-700'} mb-1.5 transition-transform group-hover:scale-110">
                          ${s.current}%
                        </span>

                        <!-- The Animated Vertical Bar -->
                        <div class="w-full h-full flex items-end justify-center">
                          <div 
                            class="w-full rounded-t-lg transition-all duration-700 shadow-sm ${isDeficit ? 'bg-gradient-to-t from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 ring-1 ring-red-400' : 'bg-gradient-to-t from-emerald-700 to-emerald-500 hover:from-emerald-800 hover:to-emerald-600'}" 
                            style="height: ${barHeightPct}%;"
                            title="${s.name}: ${s.current}% (Expected: ${s.expected}%)"
                          >
                          </div>
                        </div>

                        <!-- Bar Status Pill (Passed / Needs Fix) -->
                        <div class="mt-1.5 text-center w-full">
                          <span class="text-[8px] sm:text-[9px] font-bold ${isDeficit ? 'text-red-700' : 'text-emerald-700'}">${isDeficit ? 'FIX' : 'PASS'}</span>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Dynamic Action Summary Box -->
              <div class="mt-5 p-4 rounded-xl ${hasDeficit ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full ${hasDeficit ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'} flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-xl">${hasDeficit ? 'notification_important' : 'verified'}</span>
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-900 text-xs sm:text-sm">
                      ${hasDeficit ? `${deficitSkills.length} Skill${deficitSkills.length > 1 ? 's' : ''} Below Target: ${primaryDeficit.name} (${primaryDeficit.current}% vs 75%)` : 'All 6 Skills Verified & Passed Industry Benchmarks!'}
                    </h4>
                    <p class="text-[11px] text-slate-600">
                      ${hasDeficit ? `Complete the ${primaryCourse.title} bridge course to reach ${primaryCourse.boostedSkill}% and unlock top industry placements.` : 'You qualify for 100% of open Ayush pharmaceutical, clinical, and hospital placements.'}
                    </p>
                  </div>
                </div>
                ${hasDeficit ? `
                  <button onclick="AppUI.openBridgeCourseModal('${primaryCourse.id}')" class="px-4 py-2 bg-primary hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1.5 w-full sm:w-auto justify-center whitespace-nowrap">
                    <span>Fix Score (Bridge Course)</span>
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                ` : `
                  <button onclick="AppUI.navigate('opportunities')" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1.5 w-full sm:w-auto justify-center whitespace-nowrap">
                    <span>View Jobs</span>
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                `}
              </div>
            </div>

            <!-- Simple Chart Legend -->
            <div class="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-slate-200/80 w-full text-xs">
              <div class="flex items-center gap-2">
                <span class="w-3.5 h-3.5 rounded-sm bg-emerald-600 shadow-xs"></span>
                <span class="font-bold text-slate-700">Green Bar = Passed (&ge; 75%)</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3.5 h-3.5 rounded-sm bg-red-500 shadow-xs"></span>
                <span class="font-bold text-slate-700">Red Bar = Needs Bridge Course (&lt; 75%)</span>
              </div>
            </div>
          </div>

          <!-- Right Column: 6-Axis Radar SVG & Deficit Card -->
          <div class="lg:col-span-4 flex flex-col gap-6">
            <!-- 6-Axis Morphing Radar SVG Card -->
            <div class="glass-panel p-5 rounded-2xl flex flex-col items-center justify-between border border-primary/20 shadow-xs bg-white/80">
              <div class="w-full flex items-center justify-between pb-2 border-b border-slate-100">
                <div class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-primary text-base">radar</span>
                  <h4 class="font-bold text-xs text-slate-800 uppercase tracking-wider">Dynamic Radar Engine</h4>
                </div>
                <span class="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Morph
                </span>
              </div>

              <!-- SVG Canvas with CSS Morph Transition -->
              <div class="relative w-full max-w-[200px] aspect-square flex items-center justify-center my-3">
                <svg viewBox="0 0 190 190" class="w-full h-full overflow-visible">
                  <!-- Concentric Guide Polygons -->
                  <polygon points="95,27 154,61 154,129 95,163 36,129 36,61" fill="none" stroke="#e2e8f0" stroke-width="1"></polygon>
                  <polygon points="95,44 139,69 139,121 95,146 51,121 51,69" fill="none" stroke="#cbd5e1" stroke-width="1"></polygon>
                  <polygon points="95,61 124,78 124,112 95,129 66,112 66,78" fill="none" stroke="#e2e8f0" stroke-width="1"></polygon>

                  <!-- 75% Baseline Threshold Reference (Dashed) -->
                  <polygon points="${radarCoords.expectedPolygon}" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3"></polygon>

                  <!-- Live Evaluated Radar Polygon (Morphs on state update via CSS) -->
                  <polygon class="radar-polygon" points="${radarCoords.currentPolygon}" fill="rgba(16, 185, 129, 0.28)" stroke="#059669" stroke-width="2.5"></polygon>

                  <!-- Data Vertices -->
                  ${radarCoords.axisDetails.map(ax => `
                    <circle cx="${ax.xCurr}" cy="${ax.yCurr}" r="3.5" class="radar-point fill-emerald-700 stroke-white stroke-2 shadow-xs"></circle>
                  `).join('')}

                  <!-- Labels -->
                  <text x="95" y="16" text-anchor="middle" font-size="7.5" font-weight="700" fill="#334155">Panchakarma</text>
                  <text x="165" y="60" text-anchor="start" font-size="7.5" font-weight="700" fill="#334155">Herbology</text>
                  <text x="165" y="135" text-anchor="start" font-size="7.5" font-weight="700" fill="#334155">PatientCare</text>
                  <text x="95" y="180" text-anchor="middle" font-size="7.5" font-weight="700" fill="#334155">Diagnostics</text>
                  <text x="25" y="135" text-anchor="end" font-size="7.5" font-weight="700" fill="${student.skills.GMP.current < 75 ? '#dc2626' : '#334155'}">GMP (${student.skills.GMP.current}%)</text>
                  <text x="25" y="60" text-anchor="end" font-size="7.5" font-weight="700" fill="#334155">Research</text>
                </svg>
              </div>

              <div class="w-full pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Evaluated</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-0.5 border-t-2 border-dashed border-slate-400"></span> 75% Baseline</span>
              </div>
            </div>

            <!-- Skill Gap Alert Card -->
            <div class="glass-panel-heavy rounded-2xl p-6 relative overflow-hidden ${hasDeficit ? 'border-tertiary-container/50 ambient-glow-error' : 'border-primary/30'}">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full ${hasDeficit ? 'bg-error-container text-error' : 'bg-primary-container/20 text-primary'} flex items-center justify-center font-bold">
                  <span class="material-symbols-outlined text-xl">${hasDeficit ? 'warning' : 'verified'}</span>
                </div>
                <div>
                  <h3 class="font-headline-sm text-lg font-bold text-on-surface">${hasDeficit ? `Skill Gap: ${primaryDeficit.shortLabel}` : 'All Baselines Satisfied'}</h3>
                  <span class="text-[11px] text-on-surface-variant">${hasDeficit ? 'Requires Bridge Certification' : 'Ready for Formulation Placements'}</span>
                </div>
              </div>
              
              <p class="font-body-md text-xs text-on-surface-variant mb-4 leading-relaxed">
                ${hasDeficit 
                  ? `Your evaluated proficiency in <strong>${primaryDeficit.name}</strong> is currently at <strong>${primaryDeficit.current}%</strong> (Industry baseline is <strong>${primaryDeficit.expected}%</strong>). This restricts direct placement into premier clinical & formulation roles.`
                  : `All 6 core Ayush competencies are verified above industry targets. Your profile is ranked in the top 5% of candidate matches for partner enterprises.`
                }
              </p>

              ${hasDeficit ? `
                <div class="bg-surface/70 rounded-xl p-3.5 mb-5 border border-outline-variant/40">
                  <div class="flex justify-between text-xs font-semibold mb-1">
                    <span class="text-on-surface-variant">${primaryDeficit.shortLabel} Readiness</span>
                    <span class="text-error font-bold">${primaryDeficit.current}% / ${primaryDeficit.expected}%</span>
                  </div>
                  <div class="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                    <div class="bg-error h-2 rounded-full transition-all duration-500" style="width: ${primaryDeficit.current}%"></div>
                  </div>
                </div>

                <button onclick="AppUI.openBridgeCourseModal('${primaryCourse.id}')" class="w-full py-3 bg-primary text-white rounded-xl font-label-md text-xs font-semibold hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2">
                  <span class="material-symbols-outlined text-sm">auto_stories</span>
                  <span>Explore Bridge Course (${primaryCourse.domain || primaryCourse.title})</span>
                </button>
              ` : `
                <div class="p-3 rounded-xl bg-primary-container/10 border border-primary-container/30 text-primary text-xs font-semibold flex items-center gap-2">
                  <span class="material-symbols-outlined text-base">check_circle</span> Bridge Course Completed • Verified
                </div>
              `}
            </div>
          </div>
        </div>

        <!-- Opportunity Matching Section (Dynamic Vector Matching) -->
        <section class="mt-4">
          <div class="flex justify-between items-end mb-6">
            <div>
              <div class="inline-flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <span class="material-symbols-outlined text-sm">target</span> Vector Cosine Match Engine
              </div>
              <h2 class="font-headline-md text-2xl font-bold text-on-surface">Industry Opportunities</h2>
              <p class="font-body-md text-xs text-on-surface-variant">Top positions ranked dynamically by your multi-dimensional skill vector compatibility</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${state.opportunities.map(opp => {
              const appInfo = state.applications[opp.id] || { applied: false, status: "Not Applied" };
              const dynamicMatch = window.appState.calculateOpportunityMatch(student.skills, opp);
              const isBoosted = dynamicMatch > (opp.initialMatch || 65);
              return `
                <div class="glass-card rounded-2xl p-6 flex flex-col justify-between h-full border border-primary/15 hover:border-primary/40 relative">
                  <div>
                    <div class="flex justify-between items-start mb-4">
                      <div class="w-12 h-12 rounded-xl bg-white border border-outline-variant/40 flex items-center justify-center p-2 shadow-sm">
                        ${opp.logo ? `<img src="${opp.logo}" alt="${opp.company}" class="w-full h-full object-contain" />` : `<span class="font-bold text-primary text-sm">${opp.company.slice(0, 2).toUpperCase()}</span>`}
                      </div>
                      <div class="flex flex-col items-end gap-1">
                        <div class="px-3 py-1 ${dynamicMatch >= 90 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-surface-variant text-on-surface-variant border-outline-variant/30'} rounded-full font-label-sm text-xs font-bold flex items-center gap-1 border shadow-xs">
                          <span class="material-symbols-outlined text-sm">verified</span> ${dynamicMatch}% Match
                        </div>
                        ${isBoosted ? `
                          <span class="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold flex items-center gap-0.5 shadow-xs match-boost-pill whitespace-nowrap">
                            ▲ +${dynamicMatch - (opp.initialMatch || 65)}% Skill Boost Applied
                          </span>
                        ` : ''}
                      </div>
                    </div>
                    
                    <h3 class="font-headline-sm text-lg font-bold text-on-surface mb-1">${opp.role}</h3>
                    <p class="font-body-md text-xs text-on-surface-variant mb-3">${opp.company} • ${opp.location}</p>
                    <p class="font-body-md text-xs text-on-surface-variant/80 mb-4 line-clamp-2">${opp.description}</p>
                    
                    <div class="flex flex-wrap gap-1.5 mb-6">
                      ${opp.requiredSkills.map(s => {
                        const gate = opp.gatekeeperSkill || 'GMP';
                        const currentVal = student.skills?.[gate]?.current || 42;
                        const thresh = opp.gatekeeperThreshold || 75;
                        const isSatisfied = (s.includes('GMP') || s === gate) ? currentVal >= thresh : true;
                        return `
                          <span class="px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 ${isSatisfied ? 'bg-primary-container/10 text-primary border border-primary/20' : 'bg-error-container/20 text-error border border-error/20'}">
                            <span class="material-symbols-outlined text-[13px]">${isSatisfied ? 'check_circle' : 'warning'}</span>
                            ${s}
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
              <p class="text-on-surface-variant flex items-center gap-1.5">
                <span class="material-symbols-outlined text-sm text-primary">check_circle</span>
                <span>Strong conceptual mastery in <strong>Tridosha Diagnostics & Dravyaguna Herbology</strong>.</span>
              </p>
              <p class="flex items-center gap-1.5 ${state.student.skills.GMP.current < 78 ? 'text-error font-medium' : 'text-primary font-medium'}">
                <span class="material-symbols-outlined text-sm ${state.student.skills.GMP.current < 78 ? 'text-error' : 'text-primary'}">${state.student.skills.GMP.current < 78 ? 'warning' : 'check_circle'}</span>
                <span>${state.student.skills.GMP.current < 78 
                  ? '<strong>GMP Compliance (Schedule T)</strong> requires bridge upskilling before industrial formulation clearance.'
                  : '<strong>GMP Schedule T Compliance</strong> validated for pharmaceutical manufacturing.'
                }</span>
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
      <div id="bridge-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm fade-in" onclick="if(event.target===this)this.remove();">
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
    const courseList = window.appState.state.bridgeCourses || window.SKILLSETU_DATA.bridgeCourses || [];
    const course = courseList.find(c => c.id === courseId) || courseList[0];

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined text-sm animate-spin">sync</span> Validating Module...`;
    }

    if (pBar) pBar.style.width = '60%';
    if (pText) pText.textContent = `60% Validating ${course.domain || 'Skill'} Curricula...`;

    setTimeout(() => {
      if (pBar) pBar.style.width = '100%';
      if (pText) pText.textContent = '100% Certified!';

      setTimeout(() => {
        window.appState.completeBridgeCourse(courseId);
        const modal = document.getElementById('bridge-modal');
        if (modal) modal.remove();
        AppUI.showToast(`Bridge Course Completed! ${course.domain || 'Target'} skill upgraded to ${course.boostedSkill || 85}%. Opportunity matches updated!`, "success");
      }, 700);
    }, 900);
  },

  // 6.5 Interactive Internship Details & Match Score Modal
  openInternshipDetailModal(oppId = 'OPP-DABUR-01') {
    const opp = (window.appState.state.opportunities || []).find(o => o.id === oppId) || window.appState.state.opportunities[0];
    const student = window.appState.state.student;
    const currentMatch = window.appState.calculateOpportunityMatch(student.skills, opp);
    const appInfo = window.appState.state.applications[opp.id] || { applied: false, status: "Not Applied" };
    const gatekeeper = opp.gatekeeperSkill || "GMP";
    const gateSkill = student.skills?.[gatekeeper] || { current: 75, expected: 75 };
    const thresh = opp.gatekeeperThreshold || 75;
    const isGateDeficit = gateSkill.current < thresh;
    const bridgeCourse = (window.appState.state.bridgeCourses || []).find(c => c.domain === gatekeeper) || { id: "BC-GMP-101", title: "Bridge Course" };

    const modalHTML = `
      <div id="internship-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onclick="if(event.target===this)this.remove();">
        <div class="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-emerald-200 flex flex-col max-h-[92vh]">
          <!-- Modal Header -->
          <div class="px-5 sm:px-6 py-4 border-b border-slate-200 flex justify-between items-start bg-slate-50">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-2 shadow-xs shrink-0">
                ${opp.logo ? `<img src="${opp.logo}" alt="${opp.company}" class="w-full h-full object-contain" />` : `<span class="font-extrabold text-primary text-base">${opp.company.slice(0, 2).toUpperCase()}</span>`}
              </div>
              <div>
                <div class="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mb-0.5">
                  <span class="material-symbols-outlined text-[12px]">verified</span> Verified Ayush Enterprise
                </div>
                <h2 class="font-headline-sm text-base sm:text-lg font-bold text-slate-900">${opp.role || opp.title}</h2>
                <p class="text-xs text-slate-600">${opp.company} • ${opp.location}</p>
              </div>
            </div>
            <button onclick="document.getElementById('internship-modal').remove()" class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Scrollable Content -->
          <div class="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
            
            <!-- AI Skill Match Score Banner -->
            <div class="p-4 rounded-xl ${currentMatch >= 90 ? 'bg-emerald-50/80 border border-emerald-200' : 'bg-amber-50/80 border border-amber-200'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="flex items-center gap-3.5">
                <div class="w-14 h-14 rounded-xl ${currentMatch >= 90 ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'} flex flex-col items-center justify-center font-extrabold shadow-sm shrink-0">
                  <span class="text-base leading-none">${currentMatch}%</span>
                  <span class="text-[9px] uppercase tracking-tighter opacity-90 mt-0.5">Match</span>
                </div>
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">
                    ${currentMatch >= 90 ? 'High Compatibility Score (Top 5% Fit)' : 'Good Potential • 1 Competency Bridge Recommended'}
                  </h4>
                  <p class="text-[11px] text-slate-600 mt-0.5">
                    ${currentMatch >= 90 
                      ? 'You meet or exceed all clinical & manufacturing prerequisites for this verified position.' 
                      : `Bridge your ${gatekeeper} score from ${gateSkill.current}% to ${thresh}+% to unlock maximum match priority.`}
                  </p>
                </div>
              </div>

              ${isGateDeficit ? `
                <button onclick="document.getElementById('internship-modal').remove(); AppUI.openBridgeCourseModal('${bridgeCourse.id}')" class="px-3 py-1.5 bg-primary text-white rounded-lg font-bold text-xs hover:bg-emerald-800 transition-all shadow-xs shrink-0 flex items-center gap-1 whitespace-nowrap">
                  <span>Fix ${gatekeeper} Score</span>
                  <span class="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              ` : ''}
            </div>

            <!-- Key Parameters Strip -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Stipend</span>
                <span class="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 block">${opp.stipend || '₹28,000 / mo'}</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Duration</span>
                <span class="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 block">${opp.duration || '6 Months'}</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Target Pool</span>
                <span class="text-xs sm:text-sm font-extrabold text-slate-900 mt-0.5 block">BAMS / MD</span>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Certification</span>
                <span class="text-xs sm:text-sm font-extrabold text-emerald-700 mt-0.5 block">Pre-Placement</span>
              </div>
            </div>

            <!-- Detailed Skill Breakdown vs Requirements -->
            <div>
              <h4 class="font-bold text-slate-900 text-xs sm:text-sm mb-2.5 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-base">checklist</span>
                Verified Competency Breakdown
              </h4>
              <div class="space-y-2">
                <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-600 text-base">spa</span>
                    <div>
                      <span class="font-bold text-slate-900 text-xs">Panchakarma & Clinical Protocols</span>
                      <span class="text-[10px] text-slate-400 block">Your Score: ${student.skills.Panchakarma?.current || 85}% • Required: 75%</span>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-extrabold inline-flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[11px]">check</span> Passed
                  </span>
                </div>

                <div class="p-2.5 ${student.skills.GMP?.current < 78 ? 'bg-red-50/70 border border-red-200' : 'bg-slate-50 border border-slate-200/80'} rounded-xl flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined ${student.skills.GMP?.current < 78 ? 'text-red-600' : 'text-emerald-600'} text-base">science</span>
                    <div>
                      <span class="font-bold text-slate-900 text-xs">Schedule T GMP Compliance</span>
                      <span class="text-[10px] ${student.skills.GMP?.current < 78 ? 'text-red-600 font-semibold' : 'text-slate-400'} block">
                        Your Score: ${student.skills.GMP?.current || 42}% • Required: 78% ${student.skills.GMP?.current < 78 ? '(Deficit - Bridge Available)' : '(Passed)'}
                      </span>
                    </div>
                  </div>
                  ${student.skills.GMP?.current < 78 ? `
                    <button onclick="document.getElementById('internship-modal').remove(); AppUI.openBridgeCourseModal('BC-GMP-101')" class="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-[10px] font-bold shadow-xs">
                      Take Bridge Course
                    </button>
                  ` : `
                    <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-extrabold inline-flex items-center gap-0.5">
                      <span class="material-symbols-outlined text-[11px]">check</span> Passed
                    </span>
                  `}
                </div>

                <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-600 text-base">eco</span>
                    <div>
                      <span class="font-bold text-slate-900 text-xs">Herbology & Phytochemistry</span>
                      <span class="text-[10px] text-slate-400 block">Your Score: ${student.skills.Herbology?.current || 80}% • Required: 70%</span>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-extrabold inline-flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[11px]">check</span> Passed
                  </span>
                </div>

                <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-emerald-600 text-base">vital_signs</span>
                    <div>
                      <span class="font-bold text-slate-900 text-xs">Pulse & Clinical Diagnostics</span>
                      <span class="text-[10px] text-slate-400 block">Your Score: ${student.skills.Diagnostics?.current || 75}% • Required: 70%</span>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-extrabold inline-flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[11px]">check</span> Passed
                  </span>
                </div>
              </div>
            </div>

            <!-- Role Description & Scope -->
            <div>
              <h4 class="font-bold text-slate-900 text-xs sm:text-sm mb-1.5">Role Overview & Responsibilities</h4>
              <p class="leading-relaxed text-slate-600">
                ${opp.description || 'Candidates will undergo hands-on industrial immersion at modern Ayush manufacturing facilities. Responsibilities include Schedule T batch record auditing, raw herbal extract testing, clinical quality assurance, and pharmacovigilance documentation.'}
              </p>
            </div>
          </div>

          <!-- Modal Action Footer -->
          <div class="px-5 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50">
            <div class="text-xs text-slate-500">
              <span class="material-symbols-outlined text-sm align-middle text-primary mr-1">security</span>
              Verified SkillSetu 1-Click Application Pipeline
            </div>

            <div class="flex items-center gap-2 w-full sm:w-auto">
              <button onclick="document.getElementById('internship-modal').remove()" class="px-4 py-2 border border-slate-300 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors w-full sm:w-auto">
                Close
              </button>

              ${appInfo.applied ? `
                <button class="px-5 py-2 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-xs" disabled>
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  <span>Applied • Under Review</span>
                </button>
              ` : `
                <button onclick="AppUI.submitInternshipApplication('${opp.id}')" class="px-5 py-2 bg-primary hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto shadow-md transition-all">
                  <span class="material-symbols-outlined text-sm">send</span>
                  <span>1-Click Submit Application</span>
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('internship-modal');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  submitInternshipApplication(oppId) {
    window.appState.applyOpportunity(oppId);
    this.showToast('Application successfully submitted via SkillSetu Verified Pipeline!', 'success');
    
    // Rerender active modal with applied status
    this.openInternshipDetailModal(oppId);
    
  },

  // 6.6 Full-Screen LinkedIn-Style Dedicated Profile View & Navigation
  openFullProfileModal(profileQuery = 'me') {
    this.activeProfileQuery = profileQuery;
    this.navigate('profile');
  },

  openProfilePage(profileQuery = 'me') {
    this.activeProfileQuery = profileQuery;
    this.navigate('profile');
  },

  getProfileHTML(state) {
    const profileQuery = this.activeProfileQuery || 'me';
    const student = state.student || window.appState.state.student;
    const gmpSkill = student.skills?.["GMP"] || { current: 42, expected: 78 };
    const candidates = state.candidates || window.appState.state.candidates || [];

    let isMe = false;
    let name = student.name;
    let headline = `${student.program} @ ${student.institution}`;
    let institution = student.institution;
    let avatar = student.avatar;
    let location = "Jaipur, Rajasthan, India";
    let about = "Final year Bachelor of Ayurvedic Medicine and Surgery (BAMS) scholar at National Institute of Ayurveda (NIA) Jaipur. Passionate about evidence-based clinical diagnostics, herbal drug standardization under Schedule T GMP guidelines, and Panchakarma therapies. Actively seeking clinical and pharmaceutical formulation internship opportunities.";
    let match = student.overallMatch || 92;
    let verifiedBadges = student.verifiedBadges || [
      { name: "Clinical Panchakarma Benchmark", issuer: "NIA Jaipur", date: "Verified 2026" },
      { name: "Schedule T GMP Specialist", issuer: "Ministry of Ayush", date: "Verified 2026" },
      { name: "Herbology Standardization", issuer: "AIIA New Delhi", date: "Verified 2026" }
    ];
    let skills = [
      { name: "Panchakarma Therapy", score: student.skills?.Panchakarma?.current || 85, icon: "spa" },
      { name: "Herbology & Dravyaguna", score: student.skills?.Herbology?.current || 80, icon: "eco" },
      { name: "Patient Care & Nadi", score: student.skills?.PatientCare?.current || 88, icon: "stethoscope" },
      { name: "Pulse & Rog Nidan", score: student.skills?.Diagnostics?.current || 75, icon: "vital_signs" },
      { name: "Schedule T GMP", score: gmpSkill.current, icon: "verified" },
      { name: "Clinical Research & GCP", score: student.skills?.Research?.current || 65, icon: "science" }
    ];
    let education = [
      { school: student.institution || "National Institute of Ayurveda (NIA), Jaipur", degree: "Bachelor of Ayurvedic Medicine and Surgery - BAMS", dates: "2021 - 2026", grade: "8.6 / 10 CGPA • Clinical Honors" }
    ];
    let experience = [
      { role: "Clinical Intern (BAMS Resident)", company: "National Institute of Ayurveda Hospital", dates: "Jun 2025 - Present (12 Months)", location: "Jaipur, Rajasthan", desc: "Conducted bedside pulse diagnostics (Nadi Pariksha), managed classical Panchakarma therapy cycles (Vamana, Virechana, Basti), and recorded patient case histories." },
      { role: "Herbal Drug Extraction Fellow", company: "Ayush Phytochemistry Research Facility", dates: "Jan 2025 - May 2025", location: "Jaipur", desc: "Standardized raw botanical extracts using HPTLC fingerprinting and audited compliance batch records under Schedule T guidelines." }
    ];
    let coverBg = "bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-700";

    // Resolve other profiles
    if (profileQuery === 'me' || profileQuery === student.name || profileQuery === 'student') {
      isMe = true;
    } else {
      const foundCandidate = candidates.find(c => c.id === profileQuery || c.name.toLowerCase() === String(profileQuery).toLowerCase());
      if (foundCandidate) {
        name = foundCandidate.name;
        headline = `${foundCandidate.education} • ${foundCandidate.institution}`;
        institution = foundCandidate.institution;
        avatar = foundCandidate.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(foundCandidate.name)}&background=047857&color=fff`;
        match = foundCandidate.match || 90;
        about = `Ayush healthcare scholar and clinical specialist at ${foundCandidate.institution}. Specialized in verified competency standards with verified benchmarks in ${foundCandidate.verifiedSkills?.join(', ')}.`;
      } else if (String(profileQuery).includes('Priya')) {
        name = "Dr. Priya Sharma";
        headline = "BAMS Resident & Herbology Specialist @ All India Institute of Ayurveda (AIIA), New Delhi";
        institution = "All India Institute of Ayurveda (AIIA), New Delhi";
        avatar = "https://images.unsplash.com/photo-1594824813501-4890d23b3780?w=200&auto=format&fit=crop&q=80";
        location = "New Delhi, India";
        match = 94;
        about = "BAMS Resident Physician at AIIA New Delhi focusing on integrating classical Ashtavidha diagnostics with modern phytochemistry. Completed national certification in Schedule T GMP batch processing.";
      } else if (String(profileQuery).includes('Aditi')) {
        name = "Dr. Aditi Sharma";
        headline = "MD (Ay) Scholar • Clinical Trial Management & Dravyaguna @ AIIA New Delhi";
        institution = "All India Institute of Ayurveda (AIIA)";
        avatar = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80";
        location = "New Delhi, India";
        match = 96;
        about = "Postgraduate clinical researcher with 2+ years of trial monitoring experience under Ministry of Ayush clinical research guidelines.";
      } else if (String(profileQuery).includes('Dabur')) {
        name = "Dabur India Ltd";
        headline = "Ayush Healthcare, Wellness & Pharmaceutical Enterprise • Verified Recruiter";
        institution = "Dabur Research & Development Center, Sahibabad";
        avatar = "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=80";
        location = "Sahibabad / NCR, India • 240,000+ Followers";
        match = 100;
        about = "India's premier Ayurvedic formulations enterprise with over 138 years of scientific trust. Actively partnering with SkillSetu to recruit top-performing BAMS and MD Ayurveda graduates.";
      } else {
        name = String(profileQuery);
        headline = "Ayush Healthcare Professional • SkillSetu Verified Network";
        institution = "Ministry of Ayush Ecosystem";
        avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=047857&color=fff`;
        location = "India";
        about = "Verified member of the National SkillSetu Ayush professional network.";
      }
    }

    return `
      ${this.getNavbarHTML(state)}
      <main class="pt-20 pb-20 px-3 sm:px-6 md:px-margin-desktop max-w-6xl mx-auto w-full">
        <!-- Top Back Bar -->
        <div class="flex items-center justify-between mb-4">
          <button onclick="AppUI.navigate('feed')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-primary font-bold text-xs shadow-xs hover:bg-slate-50 transition-all">
            <span class="material-symbols-outlined text-base">arrow_back</span>
            <span>Back to Feed</span>
          </button>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-sm text-primary" style="font-variation-settings: 'FILL' 1;">verified</span>
              Ministry Verified Ayush Profile
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <!-- MAIN COLUMN (8 cols) -->
          <div class="lg:col-span-8 space-y-4">
            
            <!-- 1. LinkedIn Hero Card -->
            <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm relative">
              <!-- Cover Banner -->
              <div class="h-44 sm:h-60 ${coverBg} relative">
                <div class="absolute inset-0 bg-black/15"></div>
                <div class="absolute top-3 right-3 flex items-center gap-2">
                  ${isMe ? `
                    <button onclick="AppUI.openEditProfileModal()" class="px-3.5 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm">
                      <span class="material-symbols-outlined text-sm">photo_camera</span> Edit Cover
                    </button>
                  ` : ''}
                </div>
              </div>

              <!-- Profile Details Header Area -->
              <div class="px-5 sm:px-8 pb-6">
                <div class="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
                  <!-- Avatar -->
                  <div class="relative inline-block">
                    <img src="${avatar}" alt="${name}" class="w-28 sm:w-36 h-28 sm:h-36 rounded-full object-cover border-4 border-white shadow-xl bg-white" />
                    <span class="absolute bottom-2 right-2 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm" title="Verified SkillSetu Profile">
                      <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">verified</span>
                    </span>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                    ${isMe ? `
                      <button onclick="AppUI.openEditProfileModal()" class="px-4 py-2 bg-primary hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-base">edit</span> Edit Profile
                      </button>
                      <button onclick="AppUI.showToast('Profile link copied to clipboard!', 'success')" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1">
                        <span class="material-symbols-outlined text-base">share</span> Share
                      </button>
                    ` : `
                      <button onclick="AppUI.showToast('Connection request sent to ${name}!', 'success')" class="px-5 py-2 bg-primary hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-base">person_add</span> Connect
                      </button>
                      <button onclick="AppUI.showToast('Direct message chat initialized with ${name}.', 'info')" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-base">chat</span> Message
                      </button>
                    `}
                  </div>
                </div>

                <!-- Name & Headline -->
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <h1 class="text-xl sm:text-2xl font-bold text-slate-900">${name}</h1>
                    <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider">
                      Verified Scholar
                    </span>
                  </div>
                  <p class="text-xs sm:text-sm text-slate-700 font-medium leading-normal">${headline}</p>
                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">location_on</span> ${location}</span>
                    <span class="flex items-center gap-1"><span class="material-symbols-outlined text-sm">school</span> ${institution}</span>
                    <span class="text-primary font-bold">500+ Connections</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Analytics & Highlights Strip -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-primary text-base">analytics</span>
                  Analytics & Benchmark Metrics
                </h3>
                <span class="text-[10px] text-slate-400 font-semibold">Updated Today</span>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div class="text-[10px] text-slate-500 font-bold uppercase">Overall Match</div>
                  <div class="text-lg font-extrabold text-primary mt-0.5">${match}% Fit</div>
                  <div class="text-[10px] text-emerald-600 font-semibold">Top 5% Cohort</div>
                </div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div class="text-[10px] text-slate-500 font-bold uppercase">Profile Views</div>
                  <div class="text-lg font-extrabold text-slate-900 mt-0.5">142 Views</div>
                  <div class="text-[10px] text-primary font-semibold">+18% this week</div>
                </div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div class="text-[10px] text-slate-500 font-bold uppercase">Recruiter Queries</div>
                  <div class="text-lg font-extrabold text-slate-900 mt-0.5">32 Searches</div>
                  <div class="text-[10px] text-blue-600 font-semibold">Dabur, Himalaya</div>
                </div>
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div class="text-[10px] text-slate-500 font-bold uppercase">Verified Badges</div>
                  <div class="text-lg font-extrabold text-secondary mt-0.5">${verifiedBadges.length} Certified</div>
                  <div class="text-[10px] text-emerald-700 font-semibold">Ayush Ministry</div>
                </div>
              </div>
            </div>

            <!-- 3. About Section -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-2">
              <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-base">person</span>
                About
              </h3>
              <p class="text-xs text-slate-700 leading-relaxed">${about}</p>
            </div>

            <!-- 4. Verified Skill Scores & Radar Breakdown -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-primary text-base">verified</span>
                  Verified Competencies & Scores
                </h3>
                <button onclick="AppUI.navigate('student-dashboard')" class="text-xs text-primary font-bold hover:underline">
                  View Skill Dashboard →
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${skills.map(s => {
                  const isPass = s.score >= 75;
                  return `
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                      <div class="flex items-center gap-2.5">
                        <span class="material-symbols-outlined text-primary text-lg">${s.icon}</span>
                        <div>
                          <div class="font-bold text-slate-900 text-xs">${s.name}</div>
                          <div class="text-[10px] text-slate-400">Industry Standard: 75%</div>
                        </div>
                      </div>
                      <span class="px-2 py-1 rounded-lg text-xs font-extrabold ${isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'}">
                        ${s.score}%
                      </span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- 5. Experience & Clinical Postings -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-base">work</span>
                Clinical Experience & Internships
              </h3>
              <div class="space-y-4">
                ${experience.map(exp => `
                  <div class="flex items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                      <span class="material-symbols-outlined text-xl">local_hospital</span>
                    </div>
                    <div class="flex-1 text-xs">
                      <h4 class="font-bold text-slate-900 text-sm">${exp.role}</h4>
                      <p class="font-semibold text-slate-700">${exp.company}</p>
                      <p class="text-[10px] text-slate-400">${exp.dates} • ${exp.location}</p>
                      <p class="text-slate-600 mt-1 leading-relaxed">${exp.desc}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- 6. Education -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-base">school</span>
                Education & Qualifications
              </h3>
              <div class="space-y-3">
                ${education.map(edu => `
                  <div class="flex items-start gap-3">
                    <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center shrink-0 mt-0.5">
                      <span class="material-symbols-outlined text-xl">account_balance</span>
                    </div>
                    <div class="flex-1 text-xs">
                      <h4 class="font-bold text-slate-900 text-sm">${edu.school}</h4>
                      <p class="font-semibold text-slate-700">${edu.degree}</p>
                      <p class="text-[10px] text-slate-400">${edu.dates}</p>
                      <p class="text-emerald-700 font-bold mt-0.5">${edu.grade}</p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- 7. Verified Licenses & Certifications -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-base">card_membership</span>
                Licenses & Certifications
              </h3>
              <div class="space-y-2.5">
                ${verifiedBadges.map(b => `
                  <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div class="flex items-center gap-2.5">
                      <span class="material-symbols-outlined text-primary text-xl">verified</span>
                      <div>
                        <div class="font-bold text-slate-900">${b.name}</div>
                        <div class="text-[10px] text-slate-500">${b.issuer} • ${b.date}</div>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-bold text-[10px] rounded-lg">
                      Verified
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>

          <!-- RIGHT SIDEBAR (4 cols) -->
          <div class="lg:col-span-4 space-y-4">
            <!-- 1. People Also Viewed -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3.5">
              <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-base">group</span>
                Ayush Peers & Scholars
              </h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div class="flex items-center gap-2.5 cursor-pointer" onclick="AppUI.openFullProfileModal('Dr. Priya Sharma')">
                    <img src="https://images.unsplash.com/photo-1594824813501-4890d23b3780?w=100&auto=format&fit=crop&q=80" alt="Dr. Priya Sharma" class="w-9 h-9 rounded-full object-cover border border-slate-200" />
                    <div>
                      <h4 class="font-bold text-slate-900 text-xs hover:text-primary">Dr. Priya Sharma</h4>
                      <p class="text-[10px] text-slate-500">BAMS Resident @ AIIA</p>
                    </div>
                  </div>
                  <button onclick="AppUI.openFullProfileModal('Dr. Priya Sharma')" class="px-2.5 py-1 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white text-[11px] font-bold transition-colors">
                    View
                  </button>
                </div>

                <div class="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div class="flex items-center gap-2.5 cursor-pointer" onclick="AppUI.openFullProfileModal('Dr. Aditi Sharma')">
                    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&auto=format&fit=crop&q=80" alt="Dr. Aditi Sharma" class="w-9 h-9 rounded-full object-cover border border-slate-200" />
                    <div>
                      <h4 class="font-bold text-slate-900 text-xs hover:text-primary">Dr. Aditi Sharma</h4>
                      <p class="text-[10px] text-slate-500">MD (Ay) Research Fellow</p>
                    </div>
                  </div>
                  <button onclick="AppUI.openFullProfileModal('Dr. Aditi Sharma')" class="px-2.5 py-1 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white text-[11px] font-bold transition-colors">
                    View
                  </button>
                </div>

                <div class="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div class="flex items-center gap-2.5 cursor-pointer" onclick="AppUI.openFullProfileModal('CAND-RAJEEV')">
                    <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                      RV
                    </div>
                    <div>
                      <h4 class="font-bold text-slate-900 text-xs hover:text-primary">Rajeev Verma</h4>
                      <p class="text-[10px] text-slate-500">B.Sc Yoga @ SVYASA</p>
                    </div>
                  </div>
                  <button onclick="AppUI.openFullProfileModal('CAND-RAJEEV')" class="px-2.5 py-1 rounded-lg border border-primary text-primary hover:bg-primary hover:text-white text-[11px] font-bold transition-colors">
                    View
                  </button>
                </div>
              </div>
            </div>

            <!-- 2. Matching Internships -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <h3 class="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span class="material-symbols-outlined text-primary text-base">work</span>
                Top Matching Internships
              </h3>
              <div class="space-y-3">
                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-bold text-slate-900 text-xs">Formulation & QC Intern</h4>
                      <p class="text-[10px] text-slate-500">Dabur India Ltd • Sahibabad</p>
                    </div>
                    <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">95% Match</span>
                  </div>
                  <button onclick="AppUI.openInternshipDetailModal('OPP-DABUR-01')" class="w-full py-1.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-emerald-800 transition-colors">
                    1-Click Apply
                  </button>
                </div>

                <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div class="flex justify-between items-start">
                    <div>
                      <h4 class="font-bold text-slate-900 text-xs">Clinical Herbology Fellow</h4>
                      <p class="text-[10px] text-slate-500">Patanjali Research • Haridwar</p>
                    </div>
                    <span class="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">90% Match</span>
                  </div>
                  <button onclick="AppUI.openInternshipDetailModal('OPP-PATANJALI-02')" class="w-full py-1.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-emerald-800 transition-colors">
                    1-Click Apply
                  </button>
                </div>
              </div>
            </div>

            <!-- 3. Verified Digital Skill Passport & Cryptographic Credential -->
            <div class="bg-gradient-to-br from-emerald-850 via-teal-900 to-emerald-950 rounded-2xl p-5 text-white shadow-md space-y-3 border border-emerald-500/30">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-2xl text-emerald-300">verified_user</span>
                  <h4 class="font-bold text-sm">Digital Skill Passport</h4>
                </div>
                <span class="px-2 py-0.5 bg-emerald-700/60 border border-emerald-400/40 text-[9px] font-mono font-bold rounded text-emerald-200">AUTHENTICATED</span>
              </div>
              <p class="text-xs text-emerald-100/90 leading-relaxed">
                All competency benchmark scores, clinical postings, and verified skill badges are cryptographically signed and authenticated under National Ayush Mission guidelines.
              </p>
              <div class="space-y-1.5 pt-2 border-t border-white/20 text-[11px] font-mono text-emerald-200">
                <div class="flex justify-between items-center">
                  <span class="opacity-80">Credential ID:</span>
                  <span class="font-bold text-white">${student.passportCredential?.credentialId || 'AYU-SHA256-88491A-2026'}</span>
                </div>
                <div class="flex justify-between items-center text-[10px]">
                  <span class="opacity-80">Verified Timestamp:</span>
                  <span class="text-white">${student.passportCredential?.verificationTimestamp || 'Aug 29, 2026, 10:30 AM'}</span>
                </div>
                <div class="flex justify-between items-center text-[10px]">
                  <span class="opacity-80">Signing Authority:</span>
                  <span class="text-white text-right">Ministry of Ayush (Node-01)</span>
                </div>
              </div>
              <button onclick="AppUI.copyPassportCredential('${student.passportCredential?.credentialId || 'AYU-SHA256-88491A-2026'}')" class="w-full py-2 bg-emerald-700/80 hover:bg-emerald-600 border border-emerald-400/50 rounded-xl text-[11px] font-bold text-white transition-all flex items-center justify-center gap-1.5 shadow-xs">
                <span class="material-symbols-outlined text-sm">content_copy</span>
                <span>Copy Verifiable ID & Hash</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    `;
  },

  getIndustryDashboardHTML(state) {
    const profile = window.appState.getProfileForRole('industry');
    const candidates = state.candidates.filter(c => {
      const matchesDiscipline = !this.activeFilterDiscipline || c.discipline === this.activeFilterDiscipline;
      const matchesDegree = !this.activeFilterDegree || c.degree === this.activeFilterDegree;
      const matchesSearch = !this.searchQuery || c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || c.verifiedSkills.some(s => s.toLowerCase().includes(this.searchQuery.toLowerCase()));
      return matchesDiscipline && matchesDegree && matchesSearch;
    });

    return `
      <main class="pt-28 pb-20 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full">
        <!-- Recruiter Profile & Actions Header -->
        <div class="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="flex items-center gap-4">
            <div class="relative group cursor-pointer" onclick="AppUI.openEditProfileModal()" title="Click to change logo / photo">
              <img src="${profile.avatar}" alt="${profile.name}" class="w-16 h-16 rounded-2xl object-cover border-2 border-primary/30 shadow-md group-hover:opacity-85 transition-opacity" />
              <div class="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <span class="material-symbols-outlined text-base">photo_camera</span>
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-secondary-container/20 text-on-secondary-container rounded-md font-label-sm text-xs border border-secondary-container/30">
                  <span class="material-symbols-outlined text-sm text-primary">domain</span> Verified Enterprise Recruiter
                </div>
                <button onclick="AppUI.openEditProfileModal()" class="px-2.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1 transition-all">
                  <span class="material-symbols-outlined text-[12px] text-primary">edit</span> Edit Profile
                </button>
              </div>
              <h1 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">${profile.name}</h1>
              <p class="font-body-lg text-xs md:text-sm text-on-surface-variant">${profile.role} • ${profile.institution}</p>
            </div>
          </div>

          <div class="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <button onclick="AppUI.openEditProfileModal()" class="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-slate-700 font-label-md text-xs font-semibold rounded-xl transition-all border border-slate-200 flex items-center gap-1.5 whitespace-nowrap">
              <span class="material-symbols-outlined text-sm">edit</span> Edit Recruiter Info
            </button>
            <button onclick="AppUI.openPostOpportunityModal()" class="flex-1 sm:flex-none justify-center px-4 sm:px-5 py-2.5 bg-primary text-white font-label-md text-xs font-semibold rounded-xl hover:bg-emerald-800 transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <span class="material-symbols-outlined text-sm">add_circle</span> Post Opportunity
            </button>
          </div>
        </div>

        <!-- Talent Discovery Header -->
        <div class="mb-5">
          <h2 class="font-display-lg text-xl md:text-2xl font-bold text-on-surface">Find Skill-Ready Ayush Talent</h2>
          <p class="font-body-lg text-xs md:text-sm text-on-surface-variant">Direct pipeline to certified practitioners, clinical trial investigators, and quality controllers.</p>
        </div>

        <!-- Search & Filters -->
        <div class="glass-panel rounded-2xl p-3.5 sm:p-4 mb-8 flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center">
          <div class="relative w-full md:flex-1">
            <span class="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">search</span>
            <input type="text" value="${this.searchQuery}" oninput="AppUI.searchQuery = this.value; AppUI.renderCurrentView();" placeholder="Search by name, skill (GMP, Nadi)..." class="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant/60 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 text-on-surface outline-none" />
          </div>
          <div class="grid grid-cols-2 gap-2 sm:gap-3 w-full md:w-auto">
            <select onchange="AppUI.activeFilterDiscipline = this.value; AppUI.renderCurrentView();" class="w-full min-w-0 bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-2.5 sm:px-3 py-2.5 text-xs text-on-surface font-semibold cursor-pointer truncate outline-none">
              <option value="">All Disciplines</option>
              <option value="ayurveda" ${this.activeFilterDiscipline === 'ayurveda' ? 'selected' : ''}>Ayurveda</option>
              <option value="yoga" ${this.activeFilterDiscipline === 'yoga' ? 'selected' : ''}>Yoga</option>
              <option value="unani" ${this.activeFilterDiscipline === 'unani' ? 'selected' : ''}>Unani</option>
            </select>
            <select onchange="AppUI.activeFilterDegree = this.value; AppUI.renderCurrentView();" class="w-full min-w-0 bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-2.5 sm:px-3 py-2.5 text-xs text-on-surface font-semibold cursor-pointer truncate outline-none">
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
                  <button onclick="AppUI.toggleCandidateShortlist('${c.id}')" class="px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${c.shortlisted ? 'bg-secondary text-white' : 'border border-outline-variant text-on-surface hover:bg-surface-variant'} transition-colors">
                    <span class="material-symbols-outlined text-[14px]">${c.shortlisted ? 'bookmark_added' : 'bookmark_add'}</span>
                    <span>${c.shortlisted ? 'Shortlisted' : 'Shortlist'}</span>
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
      <div id="cand-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm fade-in" onclick="if(event.target===this)this.remove();">
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
                  <span class="px-2.5 py-1 bg-primary-container/10 text-primary border border-primary/20 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <span class="material-symbols-outlined text-[13px]">verified</span>
                    ${s}
                  </span>
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
      <div id="post-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm fade-in" onclick="if(event.target===this)this.remove();">
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
    const profile = window.appState.getProfileForRole('college');
    return `
      <main class="pt-28 pb-20 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full">
        <!-- Faculty Profile & Actions Header -->
        <header class="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="flex items-center gap-4">
            <div class="relative group cursor-pointer" onclick="AppUI.openEditProfileModal()" title="Click to change photo">
              <img src="${profile.avatar}" alt="${profile.name}" class="w-16 h-16 rounded-full object-cover border-2 border-primary/30 shadow-md group-hover:opacity-85 transition-opacity" />
              <div class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <span class="material-symbols-outlined text-base">photo_camera</span>
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary-container/10 text-primary rounded-md font-label-sm text-xs border border-primary/20">
                  <span class="material-symbols-outlined text-sm">account_balance</span> College & Faculty Portal • Academic Intelligence
                </div>
                <button onclick="AppUI.openEditProfileModal()" class="px-2.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1 transition-all">
                  <span class="material-symbols-outlined text-[12px] text-primary">edit</span> Edit Profile
                </button>
              </div>
              <h1 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">${profile.name}</h1>
              <p class="font-body-lg text-xs md:text-sm text-on-surface-variant">${profile.role} • ${profile.institution}</p>
            </div>
          </div>

          <div class="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <button onclick="AppUI.openEditProfileModal()" class="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-slate-700 font-label-md text-xs font-semibold rounded-xl transition-all border border-slate-200 flex items-center gap-1.5 whitespace-nowrap">
              <span class="material-symbols-outlined text-sm">edit</span> Edit Faculty Info
            </button>
            <button onclick="AppUI.openCreateBridgeCourseModal()" class="flex-1 sm:flex-none justify-center px-4 sm:px-5 py-2.5 bg-primary text-white font-label-md text-xs font-semibold rounded-xl hover:bg-emerald-800 transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <span class="material-symbols-outlined text-sm">add</span> Create Bridge Course
            </button>
          </div>
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
      <div id="course-modal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm fade-in" onclick="if(event.target===this)this.remove();">
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
    const profile = window.appState.getProfileForRole('ministry');

    return `
      <main class="pt-28 pb-20 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full">
        <!-- Governance Admin Profile & Actions Header -->
        <div class="glass-panel p-6 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="flex items-center gap-4">
            <div class="relative group cursor-pointer" onclick="AppUI.openEditProfileModal()" title="Click to change photo">
              <img src="${profile.avatar}" alt="${profile.name}" class="w-16 h-16 rounded-full object-cover border-2 border-primary/30 shadow-md group-hover:opacity-85 transition-opacity" />
              <div class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <span class="material-symbols-outlined text-base">photo_camera</span>
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary-container/10 text-primary rounded-md font-label-sm text-xs border border-primary/20">
                  <span class="material-symbols-outlined text-sm">policy</span> Ministry of Ayush • National Skill Impact Analytics
                </div>
                <button onclick="AppUI.openEditProfileModal()" class="px-2.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1 transition-all">
                  <span class="material-symbols-outlined text-[12px] text-primary">edit</span> Edit Profile
                </button>
              </div>
              <h1 class="font-display-lg text-2xl md:text-3xl font-bold text-on-surface">${profile.name}</h1>
              <p class="font-body-md text-xs sm:text-sm text-on-surface-variant">${profile.role} • ${profile.institution}</p>
            </div>
          </div>

          <div class="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <button onclick="AppUI.openEditProfileModal()" class="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-slate-700 font-label-md text-xs font-semibold rounded-xl transition-all border border-slate-200 flex items-center gap-1.5 whitespace-nowrap">
              <span class="material-symbols-outlined text-sm">edit</span> Edit Admin Info
            </button>
            <button onclick="AppUI.exportNationalReport()" class="flex-1 sm:flex-none justify-center px-4 sm:px-5 py-2.5 bg-primary text-white font-label-md text-xs font-semibold rounded-xl hover:bg-emerald-800 transition-all flex items-center gap-1.5 shadow-sm whitespace-nowrap">
              <span class="material-symbols-outlined text-sm">download</span> Export Summary
            </button>
          </div>
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
        <section class="glass-panel rounded-2xl p-6 md:p-8 shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200/80 pb-4">
            <div>
              <div class="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <span class="material-symbols-outlined text-sm">trending_up</span> National Employment Stream
              </div>
              <h3 class="font-headline-sm text-xl font-bold text-on-surface">Quarterly Placement Trajectory</h3>
              <p class="text-xs text-on-surface-variant">Aggregate student placement clearance through SkillSetu verified pipelines</p>
            </div>
            <div class="flex items-center gap-3">
              <span class="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold shadow-xs">
                <span class="material-symbols-outlined text-sm text-emerald-600">arrow_upward</span> +106% YoY Growth
              </span>
            </div>
          </div>
          
          <!-- Chart Visual Container -->
          <div class="bg-surface-container-lowest rounded-2xl p-6 border border-slate-200/80 relative">
            <!-- Grid Reference Lines -->
            <div class="absolute left-6 right-6 top-10 border-t border-dashed border-slate-200"></div>
            <div class="absolute left-6 right-6 top-24 border-t border-dashed border-slate-200"></div>
            <div class="absolute left-6 right-6 top-36 border-t border-dashed border-slate-200"></div>

            <!-- Bars Container with defined height -->
            <div class="h-64 flex items-end justify-between gap-3 sm:gap-8 px-4 sm:px-12 pb-3 border-b-2 border-slate-300 relative z-10">
              ${min.placementTrends.map(tr => `
                <div class="flex-1 flex flex-col items-center h-full justify-end group">
                  <!-- Value Badge on Top of Bar -->
                  <div class="mb-2 text-center">
                    <span class="text-xs sm:text-sm font-extrabold ${tr.highlight ? 'text-emerald-900 bg-emerald-100 ring-2 ring-emerald-300' : 'text-slate-800 bg-slate-100 border border-slate-200'} px-2.5 py-0.5 rounded-md shadow-xs inline-block">
                      ${tr.value} Placed
                    </span>
                    ${tr.highlight ? `<div class="text-[9px] font-bold text-emerald-700 uppercase tracking-tight mt-0.5">Record High</div>` : ''}
                  </div>

                  <!-- Vertical Bar Track -->
                  <div class="w-full max-w-[72px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full shadow-inner">
                    <div 
                      class="w-full ${tr.highlight ? 'bg-gradient-to-t from-emerald-800 via-emerald-600 to-emerald-400 shadow-lg shadow-emerald-700/20' : 'bg-gradient-to-t from-slate-600 to-primary/80'} rounded-t-xl transition-all duration-700 hover:opacity-90 flex items-center justify-center"
                      style="height: ${tr.height}%;"
                    >
                      <span class="text-white font-extrabold text-xs opacity-90 hidden sm:inline">${tr.value}</span>
                    </div>
                  </div>

                  <!-- Quarter Label under Bar -->
                  <div class="mt-3 text-center">
                    <span class="font-bold text-slate-900 text-xs sm:text-sm block">${tr.quarter}</span>
                    <span class="text-[10px] text-slate-400 font-medium">Verified Pool</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Mini Summary Footer Inside Chart -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-200 text-xs">
              <div class="flex items-center gap-2.5 p-2.5 bg-slate-50 rounded-xl">
                <span class="material-symbols-outlined text-primary text-xl">group</span>
                <div>
                  <div class="text-[10px] text-slate-500 font-bold uppercase">Total Candidates Placed</div>
                  <div class="text-sm font-extrabold text-slate-900">35,600+ Students</div>
                </div>
              </div>
              <div class="flex items-center gap-2.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <span class="material-symbols-outlined text-emerald-700 text-xl">trending_up</span>
                <div>
                  <div class="text-[10px] text-emerald-800 font-bold uppercase">Quarterly Velocity</div>
                  <div class="text-sm font-extrabold text-emerald-900">+34.7% per Quarter</div>
                </div>
              </div>
              <div class="flex items-center gap-2.5 p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                <span class="material-symbols-outlined text-blue-700 text-xl">corporate_fare</span>
                <div>
                  <div class="text-[10px] text-blue-800 font-bold uppercase">Partner Enterprises</div>
                  <div class="text-sm font-extrabold text-blue-900">140+ Ayush Companies</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    `;
  },

  exportNationalReport() {
    this.showToast("National Impact CSV summary report generated and downloaded.", "success");
  },

  handleApplyOpportunity(oppId) {
    this.openInternshipDetailModal(oppId);
  },

  attachEventListeners() {
    // Any extra DOM attachments
  }
};

// Initialize once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.AppUI.init();
});
