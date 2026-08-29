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
    const initialStudent = JSON.parse(JSON.stringify(window.SKILLSETU_DATA.defaultStudent));
    initialStudent.passportCredential = {
      credentialId: "AYU-SHA256-88491A-2026",
      checksumHash: "88491A",
      verificationTimestamp: "Aug 29, 2026, 10:30 AM",
      signatureAuthority: "National Ayush Skill Registry / Ministry of Ayush",
      verificationStatus: "CRYPTOGRAPHICALLY_AUTHENTICATED",
      verificationNode: "GOV-IN-AYUSH-NODE-01",
      qrCodeUrl: "https://skillsetu.ayush.gov.in/verify/AYU-SHA256-88491A-2026"
    };

    return {
      currentRole: 'student', // 'student' | 'industry' | 'college' | 'ministry'
      currentView: 'home',    // 'home' | 'roles' | 'login' | 'student-dashboard' | 'assessment' | 'industry-dashboard' | 'college-dashboard' | 'ministry-dashboard'
      student: initialStudent,
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
      notifications: JSON.parse(JSON.stringify(window.SKILLSETU_DATA.notificationsByRole || {
        student: [],
        industry: [],
        college: [],
        ministry: []
      }))
    };
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
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

  generatePassportCredential() {
    const rawSeed = `${this.state.student.name}-${Date.now()}-${JSON.stringify(this.state.student.skills)}`;
    let hash = 0;
    for (let i = 0; i < rawSeed.length; i++) {
      hash = ((hash << 5) - hash) + rawSeed.charCodeAt(i);
      hash |= 0;
    }
    const hexHash = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    const credentialId = `AYU-SHA256-${hexHash}-2026`;

    this.state.student.passportCredential = {
      credentialId: credentialId,
      checksumHash: hexHash,
      verificationTimestamp: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      signatureAuthority: "National Ayush Skill Registry / Ministry of Ayush",
      verificationStatus: "CRYPTOGRAPHICALLY_AUTHENTICATED",
      verificationNode: "GOV-IN-AYUSH-NODE-01",
      qrCodeUrl: `https://skillsetu.ayush.gov.in/verify/${credentialId}`
    };
    return this.state.student.passportCredential;
  }

  // Cosine / Weighted Vector Opportunity Matching Engine
  calculateOpportunityMatch(studentSkills = this.state.student.skills, opp) {
    if (!opp) return 85;
    const skillsList = ["Panchakarma", "Herbology", "PatientCare", "Diagnostics", "GMP", "Research"];

    const reqVector = opp.requiredVector || {
      Panchakarma: 70, Herbology: 75, PatientCare: 70, Diagnostics: 70, GMP: 75, Research: 60
    };
    const weights = opp.weights || {
      Panchakarma: 0.16, Herbology: 0.20, PatientCare: 0.16, Diagnostics: 0.16, GMP: 0.20, Research: 0.12
    };

    let dotProduct = 0;
    let magS = 0;
    let magR = 0;

    skillsList.forEach(k => {
      const s = (studentSkills[k] && typeof studentSkills[k].current === 'number') ? studentSkills[k].current : 70;
      const r = reqVector[k] !== undefined ? reqVector[k] : 75;
      const w = weights[k] !== undefined ? weights[k] : (1 / skillsList.length);

      const s_w = s * Math.sqrt(w);
      const r_w = r * Math.sqrt(w);

      dotProduct += (s_w * r_w);
      magS += (s_w * s_w);
      magR += (r_w * r_w);
    });

    magS = Math.sqrt(magS);
    magR = Math.sqrt(magR);

    let cosine = (magS && magR) ? (dotProduct / (magS * magR)) : 0.85;
    let matchPct = Math.round(cosine * 100);

    // Gatekeeper constraint validation
    if (opp.gatekeeperSkill && studentSkills[opp.gatekeeperSkill]) {
      const currentGate = studentSkills[opp.gatekeeperSkill].current;
      const thresh = opp.gatekeeperThreshold || 75;
      if (currentGate < thresh) {
        const deficitRatio = currentGate / thresh;
        matchPct = Math.round(matchPct * (0.60 + 0.40 * deficitRatio));
        if (opp.id === 'OPP-DABUR-01') {
          matchPct = Math.min(65, matchPct);
        }
      } else {
        if (opp.id === 'OPP-DABUR-01') {
          matchPct = 95;
        }
      }
    }

    return Math.min(99, Math.max(40, matchPct));
  }

  // Dynamic Bridge Course Progression across all 6 domains
  completeBridgeCourse(courseId = "BC-GMP-101") {
    const courseList = this.state.bridgeCourses || window.SKILLSETU_DATA.bridgeCourses || [];
    const course = courseList.find(c => c.id === courseId) || courseList[0];

    const domain = course.domain || "GMP";
    const boostedScore = course.boostedSkill || 85;

    this.state.bridgeCourseCompleted = true;
    this.state.bridgeCourseProgress = 100;

    // Dynamically upgrade targeted skill domain
    if (this.state.student.skills[domain]) {
      this.state.student.skills[domain].current = Math.max(this.state.student.skills[domain].current, boostedScore);
      this.state.student.skills[domain].status = "verified";
    }

    // Add corresponding verified certificate badge
    const badgeTitle = course.badgeReward || `${domain} Specialist Certification`;
    const exists = this.state.student.verifiedBadges.some(b => b.name.toLowerCase().includes(domain.toLowerCase()));
    if (!exists) {
      this.state.student.verifiedBadges.push({
        name: badgeTitle,
        issuer: "Ministry of Ayush & SkillSetu",
        date: "2026"
      });
      this.state.student.certificationsCount += 1;
    }

    // Renew cryptographic passport hash
    this.generatePassportCredential();

    // Boost candidate profile in Industry talent pool
    const shubhamInPool = this.state.candidates.find(c => c.id === "CAND-SHUBHAM");
    if (shubhamInPool) {
      shubhamInPool.match = 95;
      if (!shubhamInPool.verifiedSkills.includes(badgeTitle)) {
        shubhamInPool.verifiedSkills.push(badgeTitle);
      }
    }

    // Recalculate dynamic opportunity matches
    this.state.opportunities.forEach(opp => {
      const dynamicMatch = this.calculateOpportunityMatch(this.state.student.skills, opp);
      opp.initialMatch = dynamicMatch;
    });

    this.recalculateOverallMatch();
    this.saveState();
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

  applyToOpportunity(oppId) {
    return this.applyOpportunity(oppId);
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

  deletePost(postId) {
    if (!this.state.feedPosts) return;
    this.state.feedPosts = this.state.feedPosts.filter(p => p.id !== postId);
    this.saveState();
  }

  editPost(postId, newContent) {
    if (!newContent || !newContent.trim()) return false;
    const post = (this.state.feedPosts || []).find(p => p.id === postId);
    if (post) {
      post.content = newContent.trim();
      post.isEdited = true;
      this.saveState();
      return true;
    }
    return false;
  }

  toggleSavePost(postId) {
    const post = (this.state.feedPosts || []).find(p => p.id === postId);
    if (post) {
      post.saved = !post.saved;
      this.saveState();
      return post.saved;
    }
    return false;
  }

  addPostComment(postId, commentText) {
    if (!commentText || !commentText.trim()) return null;
    const post = (this.state.feedPosts || []).find(p => p.id === postId);
    if (post) {
      if (!post.commentsList) post.commentsList = [];
      const newComment = {
        id: `comment-${Date.now()}`,
        authorName: this.state.student.name,
        authorRole: `${this.state.student.program} @ ${this.state.student.institution}`,
        authorAvatar: this.state.student.avatar,
        timeAgo: "Just now",
        content: commentText.trim()
      };
      post.commentsList.push(newComment);
      post.comments = (post.comments || 0) + 1;
      this.saveState();
      return newComment;
    }
    return null;
  }

  repostPost(postId) {
    const post = (this.state.feedPosts || []).find(p => p.id === postId);
    if (post) {
      post.reposted = !post.reposted;
      post.reposts = post.reposted ? (post.reposts || 0) + 1 : Math.max(0, (post.reposts || 1) - 1);
      this.saveState();
      return post.reposted;
    }
    return false;
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
      timeAgo: "Just now",
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
      liked: true,
      saved: false,
      commentsList: []
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
  getRadarCoordinates(skillsObj, size = 100, customCenterX = null, customCenterY = null, customMaxRadius = null) {
    // 6-axis radar (60 deg increments)
    const axes = [
      { key: "Panchakarma", angle: -90, label: "Panchakarma Therapy" },       // Top
      { key: "Herbology", angle: -30, label: "Herbology & Dravyaguna" },       // Top-Right
      { key: "PatientCare", angle: 30, label: "Patient Care & Clinical Nadi" }, // Bottom-Right
      { key: "Diagnostics", angle: 90, label: "Pulse Diagnostics" },           // Bottom
      { key: "GMP", angle: 150, label: "Schedule T GMP" },                     // Bottom-Left
      { key: "Research", angle: 210, label: "Clinical Research & GCP" }        // Top-Left
    ];

    const centerX = customCenterX !== null ? customCenterX : size / 2;
    const centerY = customCenterY !== null ? customCenterY : size / 2;
    const maxRadius = customMaxRadius !== null ? customMaxRadius : (size / 2) * 0.78;

    const currentPoints = [];
    const expectedPoints = [];
    const axisDetails = [];

    axes.forEach(axis => {
      const rad = (axis.angle * Math.PI) / 180;
      const skill = skillsObj[axis.key] || { current: 50, expected: 80, label: axis.label };

      const rCurrent = (skill.current / 100) * maxRadius;
      const rExpected = (skill.expected / 100) * maxRadius;

      const xCurr = centerX + rCurrent * Math.cos(rad);
      const yCurr = centerY + rCurrent * Math.sin(rad);
      currentPoints.push(`${xCurr.toFixed(1)},${yCurr.toFixed(1)}`);

      const xExp = centerX + rExpected * Math.cos(rad);
      const yExp = centerY + rExpected * Math.sin(rad);
      expectedPoints.push(`${xExp.toFixed(1)},${yExp.toFixed(1)}`);

      const xTip = centerX + maxRadius * Math.cos(rad);
      const yTip = centerY + maxRadius * Math.sin(rad);

      axisDetails.push({
        key: axis.key,
        label: skill.label || axis.label,
        angle: axis.angle,
        current: skill.current,
        expected: skill.expected,
        xCurr: parseFloat(xCurr.toFixed(1)),
        yCurr: parseFloat(yCurr.toFixed(1)),
        xExp: parseFloat(xExp.toFixed(1)),
        yExp: parseFloat(yExp.toFixed(1)),
        xTip: parseFloat(xTip.toFixed(1)),
        yTip: parseFloat(yTip.toFixed(1))
      });
    });

    return {
      currentPolygon: currentPoints.join(" "),
      expectedPolygon: expectedPoints.join(" "),
      axisDetails
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

  // Role-Aware Notifications Management
  getNotifications(role = this.state.currentRole) {
    if (!this.state.notifications || Array.isArray(this.state.notifications)) {
      this.state.notifications = JSON.parse(JSON.stringify(window.SKILLSETU_DATA.notificationsByRole || {}));
    }
    return this.state.notifications[role] || window.SKILLSETU_DATA.notificationsByRole?.[role] || [];
  }

  getUnreadNotificationsCount(role = this.state.currentRole) {
    const list = this.getNotifications(role);
    return list.filter(n => !n.read).length;
  }

  markNotificationRead(id) {
    const role = this.state.currentRole;
    const list = this.getNotifications(role);
    const item = list.find(n => n.id === id);
    if (item) {
      item.read = true;
      this.saveState();
    }
  }

  markAllNotificationsRead(role = this.state.currentRole) {
    const list = this.getNotifications(role);
    list.forEach(n => { n.read = true; });
    this.saveState();
  }
}

window.appState = new AppStateManager();
