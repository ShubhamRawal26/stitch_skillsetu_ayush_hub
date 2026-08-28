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
  setRole(role) {
    this.state.currentRole = role;
    if (role === 'student') this.state.currentView = 'student-dashboard';
    else if (role === 'industry') this.state.currentView = 'industry-dashboard';
    else if (role === 'college') this.state.currentView = 'college-dashboard';
    else if (role === 'ministry') this.state.currentView = 'ministry-dashboard';
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
}

window.appState = new AppStateManager();
