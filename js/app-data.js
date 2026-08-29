/**
 * SkillSetu Centralized Data Layer & Orchestrator
 * Ministry of Ayush - National Ayush Mission (SIH26044)
 * Modular Data Architecture with Dedicated JSON Collections
 */

(function (global) {
  'use strict';

  // Environment-Aware Data Loader
  let studentsData, collegesData, industriesData, opportunitiesData, bridgeCoursesData, facultyData, questionsData, ministryData;

  if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
    // Node.js environment (Automated Unit Tests & SSR)
    try {
      studentsData = require('../data/students.json');
      collegesData = require('../data/colleges.json');
      industriesData = require('../data/industries.json');
      opportunitiesData = require('../data/opportunities.json');
      bridgeCoursesData = require('../data/bridge-courses.json');
      facultyData = require('../data/faculty.json');
      questionsData = require('../data/questions.json');
      ministryData = require('../data/ministry-data.json');
    } catch (e) {
      console.warn('[AppData] Node require fallback to inline definitions:', e.message);
    }
  }

  // Fallback defaults if not loaded via Node require
  if (!studentsData) studentsData = [];
  if (!collegesData) collegesData = [];
  if (!industriesData) industriesData = [];
  if (!opportunitiesData) opportunitiesData = [];
  if (!bridgeCoursesData) bridgeCoursesData = [];
  if (!facultyData) facultyData = [];
  if (!questionsData) questionsData = [];
  if (!ministryData) ministryData = { nationalSummary: {}, states: [], topDemandSkills: [], placementTrends: [], topHighGrowthSkills: [], governmentScholarships: [] };

  const AppData = {
    isLoaded: false,
    _data: {
      students: studentsData,
      colleges: collegesData,
      industries: industriesData,
      opportunities: opportunitiesData,
      bridgeCourses: bridgeCoursesData,
      faculty: facultyData,
      questions: questionsData,
      ministry: ministryData
    },

    // Indexed lookup caches for O(1) retrieval
    _indexes: {
      studentsById: {},
      collegesById: {},
      industriesById: {},
      opportunitiesById: {},
      bridgeCoursesById: {},
      facultyById: {},
      questionsById: {}
    },

    rebuildIndexes() {
      this._indexes.studentsById = {};
      this._data.students.forEach(s => { this._indexes.studentsById[s.id] = s; });

      this._indexes.collegesById = {};
      this._data.colleges.forEach(c => { this._indexes.collegesById[c.id] = c; });

      this._indexes.industriesById = {};
      this._data.industries.forEach(i => { this._indexes.industriesById[i.id] = i; });

      this._indexes.opportunitiesById = {};
      this._data.opportunities.forEach(o => { this._indexes.opportunitiesById[o.id] = o; });

      this._indexes.bridgeCoursesById = {};
      this._data.bridgeCourses.forEach(b => { this._indexes.bridgeCoursesById[b.id] = b; });

      this._indexes.facultyById = {};
      this._data.faculty.forEach(f => { this._indexes.facultyById[f.id] = f; });

      this._indexes.questionsById = {};
      this._data.questions.forEach(q => { this._indexes.questionsById[q.id] = q; });

      // Fast Direct Entity Map Accessors
      this.studentsMap = this._indexes.studentsById;
      this.collegesMap = this._indexes.collegesById;
      this.industriesMap = this._indexes.industriesById;
      this.opportunitiesMap = this._indexes.opportunitiesById;
      this.coursesMap = this._indexes.bridgeCoursesById;
      this.facultyMap = this._indexes.facultyById;
      this.questionsMap = this._indexes.questionsById;
    },

    // Asynchronous JSON Loader for Web Browser Environment
    async init() {
      if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
        try {
          const [
            studentsRes,
            collegesRes,
            industriesRes,
            oppsRes,
            bridgeRes,
            facultyRes,
            questionsRes,
            ministryRes
          ] = await Promise.all([
            fetch('./data/students.json').then(r => r.ok ? r.json() : null).catch(() => null),
            fetch('./data/colleges.json').then(r => r.ok ? r.json() : null).catch(() => null),
            fetch('./data/industries.json').then(r => r.ok ? r.json() : null).catch(() => null),
            fetch('./data/opportunities.json').then(r => r.ok ? r.json() : null).catch(() => null),
            fetch('./data/bridge-courses.json').then(r => r.ok ? r.json() : null).catch(() => null),
            fetch('./data/faculty.json').then(r => r.ok ? r.json() : null).catch(() => null),
            fetch('./data/questions.json').then(r => r.ok ? r.json() : null).catch(() => null),
            fetch('./data/ministry-data.json').then(r => r.ok ? r.json() : null).catch(() => null)
          ]);

          if (studentsRes) this._data.students = studentsRes;
          if (collegesRes) this._data.colleges = collegesRes;
          if (industriesRes) this._data.industries = industriesRes;
          if (oppsRes) this._data.opportunities = oppsRes;
          if (bridgeRes) this._data.bridgeCourses = bridgeRes;
          if (facultyRes) this._data.faculty = facultyRes;
          if (questionsRes) this._data.questions = questionsRes;
          if (ministryRes) this._data.ministry = ministryRes;
        } catch (err) {
          console.warn('[AppData] Live fetch error, using pre-aggregated dataset:', err);
        }
      }

      this.rebuildIndexes();
      this.syncLegacyNamespace();
      this.isLoaded = true;
      return this._data;
    },

    // Clean Getters
    getStudents() { return this._data.students; },
    getStudentById(id) { return this._indexes.studentsById[id] || null; },

    getColleges() { return this._data.colleges; },
    getCollegeById(id) { return this._indexes.collegesById[id] || null; },

    getIndustries() { return this._data.industries; },
    getIndustryById(id) { return this._indexes.industriesById[id] || null; },

    getOpportunities() { return this._data.opportunities; },
    getOpportunityById(id) { return this._indexes.opportunitiesById[id] || null; },

    getBridgeCourses() { return this._data.bridgeCourses; },
    getBridgeCourseById(id) { return this._indexes.bridgeCoursesById[id] || null; },

    getFaculty() { return this._data.faculty; },
    getFacultyById(id) { return this._indexes.facultyById[id] || null; },

    getQuestions() { return this._data.questions; },
    getQuestionById(id) { return this._indexes.questionsById[id] || null; },

    getMinistryData() { return this._data.ministry; },

    // Synchronize to global.SKILLSETU_DATA for seamless backward compatibility
    syncLegacyNamespace() {
      const d = this._data;
      const legacy = {
        stats: {
          registeredStudents: "42,850+",
          industryPartners: "1,240+",
          avgSkillMatch: "78.4%",
          skillGapsResolved: "14,200+",
          ayushColleges: "350+",
          placementRate: "68.4%",
          totalEnrolledNational: "1.2M",
          activePrograms: "342"
        },
        defaultStudent: d.students.find(s => s.id === 'CAND-SHUBHAM') || {
          id: "STU-2024-8921",
          name: "Shubham Rawal",
          cohort: "BAMS Cohort 2024",
          program: "BAMS Final Year",
          institution: "National Institute of Ayurveda (NIA), Jaipur",
          expectedGraduation: "2025",
          avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbPrD05LHLmlcpCryv0Da3BrdItjvbOr8qBAASeP1rhz9381htAj0oR72GTCo0XdGK-qr32ZRiODbxozXMjxKAV5BcPe7beGr7CUHRJgJPfGzL2XvG1vO1Mek5Ns9IeR9Y4QVMoe1w2ZeXcxJRq03Ls9Kj5hB_RiQUP6WTQdGN46N-1xrLBKu39cfvDAnQUDtBvKYCL-B4ECgrX3wXWBJPa4sK5nzWNhXMicC0MxtbO-kXR1IHunvT",
          overallMatch: 82,
          certificationsCount: 3,
          coursesCompleted: 12,
          hoursLogged: 140,
          skills: {
            "Panchakarma": { current: 85, expected: 90, label: "Panchakarma Therapy" },
            "Herbology": { current: 80, expected: 85, label: "Herbology & Dravyaguna" },
            "PatientCare": { current: 88, expected: 85, label: "Patient Care & Clinical Practice" },
            "Diagnostics": { current: 75, expected: 80, label: "Pulse Diagnosis (Nadi Pariksha)" },
            "GMP": { current: 42, expected: 78, label: "GMP Compliance & Quality Control" },
            "Research": { current: 65, expected: 75, label: "Clinical Research & GCP" }
          },
          verifiedBadges: [
            { name: "Panchakarma Specialist", issuer: "CCRAS Certified", date: "2024" },
            { name: "Herbology & Extract Analysis", issuer: "NIA Verified", date: "2024" },
            { name: "Pulse Diagnosis (Nadi Pariksha)", issuer: "Ayush Skill Council", date: "2023" }
          ]
        },
        assessmentQuestions: d.questions,
        bridgeCourses: d.bridgeCourses,
        opportunities: d.opportunities,
        candidates: d.students,
        collegesDirectory: d.colleges,
        enterprises: d.industries,
        facultyMentors: d.faculty,
        collegeMetrics: {
          institutionName: "National Institute of Ayurveda (Deemed University)",
          location: "Jaipur, Rajasthan",
          avgStudentReadiness: 76,
          industryDemandMatch: 62,
          activeStudents: 1450,
          semesterGrowth: "+14%",
          topSkillGaps: [
            { skill: "Schedule T Industrial GMP", readiness: 42, deficit: 36, severity: "High" },
            { skill: "HPTLC Phytochemical Standardization", readiness: 54, deficit: 26, severity: "Medium" },
            { skill: "Clinical GCP & CTRI Protocol", readiness: 62, deficit: 18, severity: "Medium" }
          ],
          recommendedActions: [
            { title: "Schedule T Industrial GMP (BC-GMP-101)", reason: "Resolves the 36% compliance deficit for Dabur and Baidyanath placement drives." },
            { title: "HPTLC Phytochemical Assay (BC-HERB-102)", reason: "Enhances campus eligibility for Himalaya and Patanjali analytical research fellows." }
          ]
        },
        ministryAnalytics: {
          states: d.ministry.states || [],
          topDemandSkills: d.ministry.topDemandSkills || [],
          placementTrends: d.ministry.placementTrends || []
        },
        ministryInsights: {
          nationalSummary: d.ministry.nationalSummary || { activeInstitutes: 352, registeredStudents: "42,850+", verifiedRecruiters: "1,240+", averageStipend: "₹3.8 - ₹6.5 LPA", nationalPlacementRate: "88.4%", gmpComplianceSurge: "+42% YoY" },
          topHighGrowthSkills: d.ministry.topHighGrowthSkills || [],
          governmentScholarships: d.ministry.governmentScholarships || []
        },
        feedPosts: [
          {
            id: "post-1",
            authorType: "company",
            authorName: "Dabur India Ltd",
            authorRole: "Ayush Healthcare & Pharma Enterprise • 240k followers",
            authorAvatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&auto=format&fit=crop&q=80",
            authorBadge: "Verified Recruiter",
            timeAgo: "2h",
            content: "<strong>We are hiring 15 Ayurvedic Formulation & Quality Control Interns</strong> for our flagship Sahibabad GMP Manufacturing Facility!\n\nCandidates will gain hands-on training in <strong>Schedule T GMP batch processing, HPTLC standardization, and API extract validation</strong>. Eligible: Final Year BAMS / MD Scholars with SkillSetu verified benchmarks.",
            hasOpportunity: true,
            opportunityData: {
              id: "OPP-DABUR-01",
              title: "Ayurvedic Formulation & QC Intern",
              company: "Dabur India Ltd",
              location: "Sahibabad / NCR (Hybrid)",
              stipend: "₹28,000 / month",
              duration: "6 Months",
              matchRequired: "Schedule T GMP (75%+)"
            },
            likes: 142,
            comments: 38,
            reposts: 19,
            liked: false
          },
          {
            id: "post-2",
            authorType: "student",
            authorName: "Dr. Priya Sharma",
            authorRole: "BAMS Resident @ All India Institute of Ayurveda (AIIA), New Delhi",
            authorAvatar: "https://images.unsplash.com/photo-1594824813501-4890d23b3780?w=120&auto=format&fit=crop&q=80",
            authorBadge: "Verified Student Scholar",
            timeAgo: "4h",
            content: "Thrilled to share that I just completed the <strong>National Ayush Diagnostic Assessment</strong> on SkillSetu and scored <strong>88% in Clinical Logic & Herbology</strong>!\n\nAlso wrapped up the 2-week <em>Schedule T GMP Compliance Bridge Module</em>. Huge thank you to the Ministry of Ayush and our NIA mentors for creating this direct bridge to industry.",
            hasBadge: true,
            badgeData: {
              title: "Schedule T GMP & Clinical Diagnostics Certified",
              score: "88% Verified Score",
              issuer: "Ministry of Ayush • SkillSetu Credential #AYU-8921"
            },
            likes: 218,
            comments: 42,
            reposts: 14,
            liked: false
          },
          {
            id: "post-3",
            authorType: "company",
            authorName: "Patanjali Research Foundation",
            authorRole: "Herbal Drug Discovery & Phytochemistry • 180k followers",
            authorAvatar: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=120&auto=format&fit=crop&q=80",
            authorBadge: "Verified Research Partner",
            timeAgo: "1d",
            content: "<strong>Applications Open: Clinical Herbology & Metabolomics Research Fellowships</strong>\n\nJoin our Haridwar R&D team working on clinical validation of Rasayana formulations. High-stipend fellowship with direct pre-placement offers (PPO) for top performers on SkillSetu.",
            hasOpportunity: true,
            opportunityData: {
              id: "OPP-PATANJALI-02",
              title: "Clinical Herbology Research Fellow",
              company: "Patanjali Research Foundation",
              location: "Haridwar, Uttarakhand",
              stipend: "₹35,000 / month",
              duration: "1 Year Fellowship",
              matchRequired: "Dravyaguna & Research (80%+)"
            },
            likes: 310,
            comments: 64,
            reposts: 45,
            liked: false
          },
          {
            id: "post-4",
            authorType: "college",
            authorName: "National Institute of Ayurveda (NIA)",
            authorRole: "Deemed to be University • Ministry of Ayush • Jaipur",
            authorAvatar: "https://images.unsplash.com/photo-1562774053-701939374585?w=120&auto=format&fit=crop&q=80",
            authorBadge: "Accredited National Institute",
            timeAgo: "2d",
            content: "<strong>Proud Institutional Milestone:</strong> 48 BAMS final-year scholars from NIA Jaipur have cleared verified industry interviews at Dabur, Himalaya, and Kottakkal Arya Vaidya Sala this quarter!\n\nBy integrating SkillSetu's bridge modules into semester training, cohort industry-readiness increased from 52% to 84%.",
            hasMetrics: true,
            metricsData: {
              placed: "48 Students Placed",
              avgPackage: "₹6.4 LPA Average Stipend / CTC",
              topRecruiters: "Dabur, Himalaya, Kottakkal"
            },
            likes: 495,
            comments: 73,
            reposts: 58,
            liked: false
          }
        ],
        trendingNews: [
          { title: "Ministry of Ayush allocates ₹450 Cr for Industry Bridge Internships", readers: "6,240 readers • 2h ago" },
          { title: "Schedule T GMP compliance skills see 42% hiring surge across pharma", readers: "4,120 readers • 5h ago" },
          { title: "Kottakkal opens 25 Kerala Panchakarma Clinical Fellowships", readers: "3,890 readers • 1d ago" },
          { title: "WHO Global Centre for Traditional Medicine expands India research intake", readers: "2,940 readers • 2d ago" }
        ],
        notificationsByRole: {
          student: [
            {
              id: "notif-s-1",
              type: "job",
              title: "Dabur India Ltd viewed your verified skill profile",
              message: "Your 95% compatibility match for the Ayurvedic Formulation QC role in Sahibabad was reviewed by the talent acquisition team.",
              avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&auto=format&fit=crop&q=80",
              author: "Dabur India Ltd",
              timeAgo: "15m ago",
              read: false,
              actionLabel: "View Opportunity",
              actionView: "student-dashboard"
            },
            {
              id: "notif-s-2",
              type: "grant",
              title: "New Ministry Research Fellowship Grant Live",
              message: "National Ayush Mission (NAM) announced ₹25,000/mo fellowship for BAMS scholars with Schedule T GMP certification.",
              avatar: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=80&auto=format&fit=crop&q=80",
              author: "Ministry of Ayush",
              timeAgo: "2h ago",
              read: false,
              actionLabel: "View Grants",
              actionView: "ministry-insights"
            },
            {
              id: "notif-s-3",
              type: "assessment",
              title: "Schedule T GMP Diagnostic Ready",
              message: "National Ayush Skill Registry has updated clinical benchmark standards for 2026. Take the 12-question diagnostic quiz.",
              avatar: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=80&auto=format&fit=crop&q=80",
              author: "SkillSetu Benchmark Engine",
              timeAgo: "1d ago",
              read: true,
              actionLabel: "Take Assessment",
              actionView: "assessment"
            },
            {
              id: "notif-s-4",
              type: "college",
              title: "National Institute of Ayurveda campus drive scheduled",
              message: "Patanjali Research & Himalaya Wellness campus placements drive scheduled for next month. Check participating companies.",
              avatar: "https://images.unsplash.com/photo-1562774053-701939374585?w=80&auto=format&fit=crop&q=80",
              author: "NIA Placement Cell",
              timeAgo: "2d ago",
              read: true,
              actionLabel: "Explore Colleges",
              actionView: "colleges"
            }
          ],
          industry: [
            {
              id: "notif-i-1",
              type: "candidate",
              title: "New verified candidate applied: Shubham Rawal",
              message: "Shubham Rawal (BAMS, 95% Match, Schedule T GMP Verified) submitted application for Ayurvedic Formulation QC.",
              avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbPrD05LHLmlcpCryv0Da3BrdItjvbOr8qBAASeP1rhz9381htAj0oR72GTCo0XdGK-qr32ZRiODbxozXMjxKAV5BcPe7beGr7CUHRJgJPfGzL2XvG1vO1Mek5Ns9IeR9Y4QVMoe1w2ZeXcxJRq03Ls9Kj5hB_RiQUP6WTQdGN46N-1xrLBKu39cfvDAnQUDtBvKYCL-B4ECgrX3wXWBJPa4sK5nzWNhXMicC0MxtbO-kXR1IHunvT",
              author: "Shubham Rawal",
              timeAgo: "20m ago",
              read: false,
              actionLabel: "Review Candidate",
              actionView: "industry-dashboard"
            },
            {
              id: "notif-i-2",
              type: "college",
              title: "Campus recruitment drive confirmed with NIA Jaipur",
              message: "National Institute of Ayurveda accepted your request for on-campus batch interviews for 45 final year scholars.",
              avatar: "https://images.unsplash.com/photo-1562774053-701939374585?w=80&auto=format&fit=crop&q=80",
              author: "NIA Jaipur Placement Cell",
              timeAgo: "3h ago",
              read: false,
              actionLabel: "View Colleges",
              actionView: "colleges"
            },
            {
              id: "notif-i-3",
              type: "system",
              title: "Schedule T GMP Compliance Subsidy notification",
              message: "Ministry of Ayush released 50% modernization reimbursement guidelines for pharmaceutical partner factories.",
              avatar: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=80&auto=format&fit=crop&q=80",
              author: "Ministry Secretariat",
              timeAgo: "1d ago",
              read: true,
              actionLabel: "View Standards",
              actionView: "ministry-insights"
            }
          ],
          college: [
            {
              id: "notif-c-1",
              type: "system",
              title: "18 students completed Schedule T GMP Bridge Module",
              message: "Cohort readiness score for NIA Jaipur batch increased from 74% to 84% following bridge module completion.",
              avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80",
              author: "Curriculum Analytics Engine",
              timeAgo: "1h ago",
              read: false,
              actionLabel: "View Cohort",
              actionView: "college-dashboard"
            },
            {
              id: "notif-c-2",
              type: "industry",
              title: "Dabur India Ltd requested on-campus placement drive",
              message: "Corporate recruiter submitted drive request for 15 formulation QC openings. Placement officer action required.",
              avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&auto=format&fit=crop&q=80",
              author: "Dabur India Ltd",
              timeAgo: "4h ago",
              read: false,
              actionLabel: "View Directory",
              actionView: "colleges"
            }
          ],
          ministry: [
            {
              id: "notif-m-1",
              type: "system",
              title: "Rajasthan Ayush Directorate submitted Q3 workforce audit",
              message: "State deficit in Ayurvedic quality manufacturing narrowed by 14% with 1,840 certified students placed.",
              avatar: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=80&auto=format&fit=crop&q=80",
              author: "State Governance Portal",
              timeAgo: "30m ago",
              read: false,
              actionLabel: "View Heatmap",
              actionView: "ministry-dashboard"
            },
            {
              id: "notif-m-2",
              type: "grant",
              title: "NAM fellowship grant disbursal batch ready",
              message: "128 verified clinical scholars qualified for Central Govt monthly fellowship stipends.",
              avatar: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=80&auto=format&fit=crop&q=80",
              author: "National Ayush Mission",
              timeAgo: "5h ago",
              read: false,
              actionLabel: "View National Insights",
              actionView: "ministry-insights"
            }
          ]
        }
      };

      global.SKILLSETU_DATA = legacy;
    }
  };

  // Initial index build and global assignment
  AppData.rebuildIndexes();
  AppData.syncLegacyNamespace();

  global.AppData = AppData;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppData;
  }
})(typeof window !== 'undefined' ? window : global);
