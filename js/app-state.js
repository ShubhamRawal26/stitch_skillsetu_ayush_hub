/**
 * SkillSetu Reactive State Manager Backed by LocalStorage
 * Manages Cross-Portal synchronization, Assessment scoring, and Bridge course upgrades.
 */

class AppStateManager {
  constructor() {
    this.STORAGE_KEY = 'skillsetu_prototype_state_v1';
    this.listeners = [];
    this.state = this.loadState();
  }

  getInitialState() {
    return {
      currentRole: 'student', // 'student' | 'industry' | 'college' | 'ministry'
      currentView: 'home',    // 'home' | 'roles' | 'login' | 'student-dashboard' | 'assessment' | 'industry-dashboard' | 'college-dashboard' | 'ministry-dashboard'
      student: JSON.parse(JSON.stringify(window.SKILLSETU_DATA.defaultStudent)),
      assessment: {
        completed: false,
        score: 0,
        total: 5,
        percentage: 0,
        selectedAnswers: {},
        completedAt: null
      },
      bridgeCourseCompleted: false,
      bridgeCourseProgress: 0, // 0 to 100
      applications: {
        "OPP-DABUR-01": { applied: false, status: "Not Applied", date: null },
        "OPP-PATANJALI-02": { applied: false, status: "Not Applied", date: null },
        "OPP-KOTTAKKAL-03": { applied: false, status: "Not Applied", date: null },
        "OPP-HIMALAYA-04": { applied: false, status: "Not Applied", date: null }
      },
      candidates: JSON.parse(JSON.stringify(window.SKILLSETU_DATA.candidates)),
      opportunities: JSON.parse(JSON.stringify(window.SKILLSETU_DATA.opportunities)),
      bridgeCourses: JSON.parse(JSON.stringify(window.SKILLSETU_DATA.bridgeCourses)),
      feedPosts: JSON.parse(JSON.stringify(window.SKILLSETU_DATA.feedPosts || [])),
      roleProfiles: {
        student: {
          name: "Shubham Rawal",
          role: "BAMS Final Year (Ayurveda)",
          institution: "National Institute of Ayurveda (NIA), Jaipur",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbPrD05LHLmlcpCryv0Da3BrdItjvbOr8qBAASeP1rhz9381htAj0oR72GTCo0XdGK-qr32ZRiODbxozXMjxKAV5BcPe7beGr7CUHRJgJPfGzL2XvG1vO1Mek5Ns9IeR9Y4QVMoe1w2ZeXcxJRq03Ls9Kj5hB_RiQUP6WTQdGN46N-1xrLBKu39cfvDAnQUDtBvKYCL-B4ECgrX3wXWBJPa4sK5nzWNhXMicC0MxtbO-kXR1IHunvT",
          bio: "Passionate BAMS scholar with Schedule T GMP certification & clinical Nadi Pariksha proficiency."
        },
        industry: {
          name: "Dabur India Ltd",
          role: "Enterprise Recruiter & Formulation R&D",
          institution: "Sahibabad R&D Center",
          avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80",
          bio: "Recruiting top Ayush clinical & formulation talent for Dabur R&D centers across India."
        },
        college: {
          name: "Prof. Meenakshi Sundaram",
          role: "Dean & Head of Faculty",
          institution: "National Institute of Ayurveda (NIA Jaipur)",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
          bio: "Curriculum lead for BAMS & MD training in Ayurveda and Schedule T GMP compliance."
        },
        ministry: {
          name: "Ayush Governance Admin",
          role: "Ministry of Ayush Secretariat",
          institution: "Ministry of Ayush, Govt. of India",
          avatar: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&auto=format&fit=crop&q=80",
          bio: "Managing national skill impact analytics and modernization grants under National Ayush Mission."
        }
      },
      notifications: [
        { id: 1, title: "Assessment Ready", msg: "National Skill Benchmark Assessment is live.", time: "10m ago", read: false }
      ]
    };
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with initial state to ensure schema updates
        return Object.assign(this.getInitialState(), parsed);
      }
    } catch (e) {
      console.warn("Could not read localStorage:", e);
    }
    return this.getInitialState();
  }

  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
    this.notify();
  }

  resetDemo() {
    this.state = this.getInitialState();
    this.saveState();
    if (window.AppUI && typeof window.AppUI.showToast === 'function') {
      window.AppUI.showToast("Demo state has been reset to initial benchmark.", "info");
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.state); } catch (err) { console.error(err); }
    });
  }

  // Role & View Navigation
  setRole(role, redirect = true) {
    this.state.currentRole = role;
    if (redirect) {
      if (role === 'student') this.state.currentView = 'student-dashboard';
      else if (role === 'industry') this.state.currentView = 'industry-dashboard';
      else if (role === 'college') this.state.currentView = 'college-dashboard';
      else if (role === 'ministry') this.state.currentView = 'ministry-dashboard';
    }
    this.saveState();
  }

  selectRoleForAuth(role) {
    this.state.currentRole = role;
    this.state.currentView = 'login';
    this.saveState();
  }

  setView(viewName) {
    this.state.currentView = viewName;
    this.saveState();
  }

  // Assessment Logic
  submitAssessment(answers) {
    const questions = window.SKILLSETU_DATA.assessmentQuestions;
    let correctCount = 0;

    questions.forEach((q, idx) => {
      const selectedIndex = answers[q.id];
      if (selectedIndex !== undefined && q.options[selectedIndex] && q.options[selectedIndex].correct) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);

    this.state.assessment = {
      completed: true,
      score: correctCount,
      total: questions.length,
      percentage: percentage,
      selectedAnswers: answers,
      completedAt: new Date().toLocaleTimeString()
    };

    // Update student verified skills based on score
    if (percentage >= 60) {
      this.state.student.skills["Diagnostics"].current = Math.min(95, this.state.student.skills["Diagnostics"].current + 10);
      this.state.student.skills["Herbology"].current = Math.min(95, this.state.student.skills["Herbology"].current + 8);
    }

    // Recalculate overall match
    this.recalculateOverallMatch();

    this.saveState();
    return percentage;
  }

  // Bridge Course Progression
  completeBridgeCourse(courseId = "BC-GMP-101") {
    this.state.bridgeCourseCompleted = true;
    this.state.bridgeCourseProgress = 100;

    // Boost student's GMP Compliance skill from 42% -> 85%
    this.state.student.skills["GMP"].current = 85;

    // Add new verified certificate
    const exists = this.state.student.verifiedBadges.some(b => b.name.includes("GMP"));
    if (!exists) {
      this.state.student.verifiedBadges.push({
        name: "GMP Schedule T Compliance Certified",
        issuer: "Ministry of Ayush & SkillSetu",
        date: "2025"
      });
      this.state.student.certificationsCount += 1;
    }

    // Boost candidate profile in Industry pool
    const shubhamInPool = this.state.candidates.find(c => c.id === "CAND-SHUBHAM");
    if (shubhamInPool) {
      shubhamInPool.match = 95;
      if (!shubhamInPool.verifiedSkills.includes("GMP Schedule T Certified")) {
        shubhamInPool.verifiedSkills.push("GMP Schedule T Certified");
      }
    }

    // Boost opportunity matches
    const daburOpp = this.state.opportunities.find(o => o.id === "OPP-DABUR-01");
    if (daburOpp) {
      daburOpp.initialMatch = daburOpp.boostedMatch;
    }

    this.recalculateOverallMatch();
    this.saveState();
  }

  recalculateOverallMatch() {
    const skills = this.state.student.skills;
    // Core Ayush industry weighting
    const weights = {
      Panchakarma: 0.20,
      Herbology: 0.20,
      Diagnostics: 0.20,
      GMP: 0.25,
      PatientCare: 0.10,
      Research: 0.05
    };

    let weightedSum = 0;
    let totalWeight = 0;
    Object.keys(skills).forEach(k => {
      const w = weights[k] || 0.15;
      weightedSum += (skills[k].current * w);
      totalWeight += w;
    });

    let baseMatch = Math.round(weightedSum / totalWeight);

    // Certification bonus
    if (this.state.bridgeCourseCompleted) {
      baseMatch = Math.max(92, baseMatch + 5);
    }

    this.state.student.overallMatch = Math.min(98, baseMatch);
  }

  // Job Application Flow
  applyOpportunity(oppId) {
    if (!this.state.applications[oppId]) {
      this.state.applications[oppId] = { applied: true, status: "Applied - Under Review", date: new Date().toLocaleDateString() };
    } else {
      this.state.applications[oppId].applied = true;
      this.state.applications[oppId].status = "Applied - Under Review";
      this.state.applications[oppId].date = new Date().toLocaleDateString();
    }

    // Sync to candidate in industry talent pool
    const shubhamInPool = this.state.candidates.find(c => c.id === "CAND-SHUBHAM");
    if (shubhamInPool) {
      shubhamInPool.status = "Applied - Under Review";
    }

    this.saveState();
  }

  // Candidate Shortlisting (Industry portal)
  toggleShortlistCandidate(candId) {
    const cand = this.state.candidates.find(c => c.id === candId);
    if (cand) {
      cand.shortlisted = !cand.shortlisted;
      this.saveState();
      return cand.shortlisted;
    }
    return false;
  }

  // Post New Opportunity (Industry portal)
  addOpportunity(newOpp) {
    const opp = {
      id: `OPP-NEW-${Date.now()}`,
      company: newOpp.company || "Ayush Innovation Labs",
      logo: "",
      role: newOpp.role || "Ayurvedic Clinical Associate",
      location: newOpp.location || "New Delhi / Remote",
      type: newOpp.type || "Full-time Placement",
      stipend: newOpp.stipend || "₹35,000 / month",
      initialMatch: 90,
      boostedMatch: 95,
      requiredSkills: newOpp.requiredSkills || ["Herbology", "GMP Compliance"],
      description: newOpp.description || "Exciting opportunity in Ayush research and manufacturing.",
      posted: "Just now",
      applicantCount: 0
    };
    this.state.opportunities.unshift(opp);
    this.saveState();
    return opp;
  }

  // Social Feed Actions (LinkedIn style)
  togglePostLike(postId) {
    const post = (this.state.feedPosts || []).find(p => p.id === postId);
    if (post) {
      post.liked = !post.liked;
      post.likes = post.liked ? post.likes + 1 : Math.max(0, post.likes - 1);
      this.saveState();
    }
  }

  createPost(content, tag = "Skill Milestone") {
    if (!content || !content.trim()) return null;
    const newPost = {
      id: `post-${Date.now()}`,
      authorType: "student",
      authorName: this.state.student.name,
      authorRole: `${this.state.student.program} @ ${this.state.student.institution}`,
      authorAvatar: this.state.student.avatar,
      authorBadge: "Verified Student Scholar",
      timeAgo: "Just now • 🌐",
      content: content.trim(),
      hasBadge: true,
      badgeData: {
        title: tag,
        score: `${this.state.student.skills["GMP"]?.current || 85}% GMP Verified Benchmark`,
        issuer: "Ministry of Ayush • SkillSetu Community"
      },
      likes: 1,
      comments: 0,
      reposts: 0,
      liked: true
    };
    if (!this.state.feedPosts) this.state.feedPosts = [];
    this.state.feedPosts.unshift(newPost);
    this.saveState();
    return newPost;
  }

  // Create Bridge Course (College portal)
  addBridgeCourse(courseData) {
    const course = {
      id: `BC-NEW-${Date.now()}`,
      title: courseData.title || "Ayurvedic Drug Regulatory Affairs",
      category: "Institutional Bridge Learning",
      duration: courseData.duration || "4 Weeks (30 Hours)",
      skillImproved: courseData.skill || "Regulatory Affairs",
      instructor: courseData.faculty || "Faculty Department Lead",
      rating: "5.0/5 (New)",
      status: "Available",
      targetGap: courseData.skill || "Regulatory Affairs",
      initialSkill: 50,
      boostedSkill: 85,
      description: courseData.description || "Institutional bridge module developed to bridge high-deficit manufacturing skills.",
      modules: [
        { title: "Module 1: Fundamental Principles & Nomenclature", duration: "8 hrs", completed: false },
        { title: "Module 2: Practical Lab Application & Testing", duration: "12 hrs", completed: false },
        { title: "Module 3: Industry Audit Standards", duration: "10 hrs", completed: false }
      ]
    };
    this.state.bridgeCourses.push(course);
    this.saveState();
    return course;
  }

  // Helper for Radar Chart coordinate calculation
  getRadarCoordinates(skillsObj, size = 100) {
    // 6-axis radar (60 deg increments)
    const axes = [
      { key: "Panchakarma", angle: -90 }, // Top
      { key: "Herbology", angle: -30 },    // Top-Right
      { key: "PatientCare", angle: 30 },   // Bottom-Right
      { key: "Diagnostics", angle: 90 },   // Bottom
      { key: "GMP", angle: 150 },          // Bottom-Left
      { key: "Research", angle: 210 }      // Top-Left
    ];

    const center = size / 2;
    const maxRadius = (size / 2) * 0.78;

    const currentPoints = [];
    const expectedPoints = [];

    axes.forEach(axis => {
      const rad = (axis.angle * Math.PI) / 180;
      const skill = skillsObj[axis.key] || { current: 50, expected: 80 };

      const rCurrent = (skill.current / 100) * maxRadius;
      const rExpected = (skill.expected / 100) * maxRadius;

      const xCurr = center + rCurrent * Math.cos(rad);
      const yCurr = center + rCurrent * Math.sin(rad);
      currentPoints.push(`${xCurr.toFixed(1)},${yCurr.toFixed(1)}`);

      const xExp = center + rExpected * Math.cos(rad);
      const yExp = center + rExpected * Math.sin(rad);
      expectedPoints.push(`${xExp.toFixed(1)},${yExp.toFixed(1)}`);
    });

    return {
      currentPolygon: currentPoints.join(" "),
      expectedPolygon: expectedPoints.join(" ")
    };
  }

  // Profile Management for all Stakeholder Roles
  getProfileForRole(role = this.state.currentRole) {
    if (!this.state.roleProfiles) this.state.roleProfiles = {};
    if (role === 'student') {
      return {
        name: this.state.student.name,
        role: this.state.student.program || "BAMS Final Year (Ayurveda)",
        institution: this.state.student.institution,
        avatar: this.state.student.avatar,
        bio: this.state.student.bio || "Passionate BAMS scholar with Schedule T GMP certification & clinical Nadi Pariksha proficiency."
      };
    }
    return this.state.roleProfiles[role] || {
      name: role === 'industry' ? 'Dabur India Ltd' : role === 'college' ? 'Prof. Meenakshi Sundaram' : 'Ayush Governance Admin',
      role: role === 'industry' ? 'Enterprise Recruiter' : role === 'college' ? 'Dean of Faculty' : 'Ministry Secretariat',
      institution: role === 'industry' ? 'Sahibabad R&D Center' : role === 'college' ? 'NIA Jaipur' : 'Ministry of Ayush',
      avatar: role === 'industry' ? 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80' : role === 'college' ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80' : 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=120&auto=format&fit=crop&q=80',
      bio: "Ayush verified stakeholder profile on SkillSetu National Network."
    };
  }

  updateProfile(profileData) {
    const role = this.state.currentRole || 'student';
    if (!this.state.roleProfiles) this.state.roleProfiles = {};
    
    if (role === 'student') {
      if (profileData.name) this.state.student.name = profileData.name;
      if (profileData.avatar) this.state.student.avatar = profileData.avatar;
      if (profileData.role || profileData.program) this.state.student.program = profileData.role || profileData.program;
      if (profileData.institution) this.state.student.institution = profileData.institution;
      if (profileData.bio) this.state.student.bio = profileData.bio;

      // Synchronize student candidate pool entry
      const cand = (this.state.candidates || []).find(c => c.id === 'CAND-SHUBHAM');
      if (cand) {
        if (profileData.name) cand.name = profileData.name;
        if (profileData.avatar) cand.avatar = profileData.avatar;
        if (profileData.institution) cand.institution = profileData.institution;
      }
    } else {
      this.state.roleProfiles[role] = Object.assign(this.getProfileForRole(role), profileData);
    }

    this.saveState();
  }
}

window.appState = new AppStateManager();
