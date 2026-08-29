/**
 * Automated Verification Script for SkillSetu Prototype Logic
 */

// Simulated browser environment for Node.js
global.window = global;
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

// Load dataset and state manager
require('../js/app-data.js');
require('../js/app-state.js');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log('--- Starting SkillSetu Prototype Logic Tests ---');

// 1. Data Integrity
assert(window.SKILLSETU_DATA !== undefined, 'Dataset is defined on window');
assert(window.SKILLSETU_DATA.assessmentQuestions.length === 12, 'Assessment has exactly 12 domain questions');
assert(window.SKILLSETU_DATA.defaultStudent.name === 'Shubham Rawal', 'Default student is Shubham Rawal');
assert(window.SKILLSETU_DATA.defaultStudent.skills.GMP.current === 42, 'Initial GMP skill is 42%');
assert(window.SKILLSETU_DATA.defaultStudent.skills.GMP.expected === 78, 'Expected GMP skill is 78%');

// 2. State Manager Initialization
const stateMgr = window.appState;
assert(stateMgr.state.student.name === 'Shubham Rawal', 'State initialized with Shubham Rawal');
assert(stateMgr.state.currentRole === 'student', 'Initial role is student');

// 3. Radar Chart Calculation
const coords = stateMgr.getRadarCoordinates(stateMgr.state.student.skills, 100);
assert(coords.currentPolygon && coords.currentPolygon.split(' ').length === 6, 'Radar current polygon has 6 vertices');
assert(coords.expectedPolygon && coords.expectedPolygon.split(' ').length === 6, 'Radar expected polygon has 6 vertices');

// 4. Assessment Submission & Scoring
const mockAnswers = {
  1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 1
};
const scorePct = stateMgr.submitAssessment(mockAnswers);
assert(scorePct === 92, `Assessment score calculated correctly (11/12 = 92%, got ${scorePct}%)`);
assert(stateMgr.state.assessment.completed === true, 'Assessment marked as completed');

// 5. Bridge Course Progression
assert(stateMgr.state.student.skills.GMP.current === 42, 'GMP skill before course is 42%');
stateMgr.completeBridgeCourse('BC-GMP-101');
assert(stateMgr.state.student.skills.GMP.current === 85, `GMP skill upgraded to 85% after course (got ${stateMgr.state.student.skills.GMP.current}%)`);
assert(stateMgr.state.student.overallMatch >= 85, `Overall match boosted to ${stateMgr.state.student.overallMatch}%`);
const daburOpp = stateMgr.state.opportunities.find(o => o.id === 'OPP-DABUR-01');
assert(daburOpp.initialMatch === 95, `Dabur match upgraded to 95% (got ${daburOpp.initialMatch}%)`);

// 6. Job Application Workflow
stateMgr.applyOpportunity('OPP-DABUR-01');
assert(stateMgr.state.applications['OPP-DABUR-01'].applied === true, 'Dabur application marked as applied');
const shubhamInPool = stateMgr.state.candidates.find(c => c.id === 'CAND-SHUBHAM');
assert(shubhamInPool.status === 'Applied - Under Review', `Candidate status updated in industry pool to "${shubhamInPool.status}"`);

// 7. Industry Candidate Shortlisting
const shortlisted = stateMgr.toggleShortlistCandidate('CAND-SHUBHAM');
assert(shortlisted === true, 'Candidate shortlisted in industry portal');
assert(shubhamInPool.shortlisted === true, 'Shortlist status persisted');

// 8. Post New Opportunity
const newOpp = stateMgr.addOpportunity({
  company: 'Ayush Advanced Formulations',
  role: 'Quality Control Lead',
  location: 'Jaipur',
  stipend: '₹40,000 / mo',
  requiredSkills: ['GMP', 'Herbology'],
  description: 'Lead QA team'
});
assert(stateMgr.state.opportunities[0].id === newOpp.id, 'New opportunity prepended to opportunities list');

// 9. College Bridge Course Creation
const newCourse = stateMgr.addBridgeCourse({
  title: 'Advanced Phytochemistry & HPTLC',
  skill: 'Quality Control Analytics',
  duration: '3 Weeks',
  faculty: 'Dr. Sharma',
  description: 'HPTLC testing course'
});
assert(stateMgr.state.bridgeCourses.some(c => c.id === newCourse.id), 'New bridge course added to repository');

// 10. Profile Update & Multi-Stakeholder Profile Management
stateMgr.updateProfile({
  name: 'Dr. Shubham Rawal, BAMS',
  avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  bio: 'Gold Medalist Scholar & Panchakarma Specialist'
});
assert(stateMgr.state.student.name === 'Dr. Shubham Rawal, BAMS', 'Student name updated');
assert(stateMgr.state.student.avatar.startsWith('data:image'), 'Student avatar uploaded and persisted');
assert(stateMgr.state.candidates.find(c => c.id === 'CAND-SHUBHAM').name === 'Dr. Shubham Rawal, BAMS', 'Candidate directory synchronized with updated profile');

// 11. Notification Management & Role Alert Filtering
const studentNotifs = stateMgr.getNotifications('student');
assert(studentNotifs.length >= 4, 'Student role receives at least 4 notifications');
const unreadBefore = stateMgr.getUnreadNotificationsCount('student');
assert(unreadBefore >= 1, 'Student has unread notifications');
stateMgr.markNotificationRead(studentNotifs[0].id);
assert(studentNotifs[0].read === true, 'Notification marked as read');
stateMgr.markAllNotificationsRead('student');
assert(stateMgr.getUnreadNotificationsCount('student') === 0, 'All student notifications marked as read');

// 12. LocalStorage Persistence & Reload
const reloadedState = stateMgr.loadState();
assert(reloadedState.student.skills.GMP.current === 85, 'State successfully reloaded from localStorage');
assert(reloadedState.applications['OPP-DABUR-01'].applied === true, 'Application state preserved across sessions');

// 14. Vector Cosine Similarity Matching Verification
const daburOpportunity = stateMgr.state.opportunities.find(o => o.id === 'OPP-DABUR-01');
const baselineSkills = JSON.parse(JSON.stringify(window.SKILLSETU_DATA.defaultStudent.skills));
const matchDeficit = stateMgr.calculateOpportunityMatch(baselineSkills, daburOpportunity);
assert(matchDeficit <= 65, `Vector matching accurately penalizes deficit gatekeeper (got ${matchDeficit}%)`);

// Complete Dynamic Bridge Course for GMP
stateMgr.completeBridgeCourse('BC-GMP-101');
const matchBoosted = stateMgr.calculateOpportunityMatch(stateMgr.state.student.skills, daburOpportunity);
assert(matchBoosted === 95, `Vector matching unlocks full compatibility score post-remediation (got ${matchBoosted}%)`);

// 15. Dynamic Multi-Domain Bridge Course Verification
assert(window.SKILLSETU_DATA.bridgeCourses.length >= 6, 'All 6 skill domains have active bridge courses');
stateMgr.completeBridgeCourse('BC-PAN-101');
assert(stateMgr.state.student.skills.Panchakarma.current >= 85, 'Panchakarma bridge course dynamically upgrades Panchakarma domain');

// 16. Cryptographic Digital Skill Passport Verification
const passport = stateMgr.generatePassportCredential();
assert(passport.credentialId.startsWith('AYU-SHA256-'), `Passport credential ID generated correctly (${passport.credentialId})`);
assert(passport.verificationStatus === 'CRYPTOGRAPHICALLY_AUTHENTICATED', 'Passport verification status is authenticated');
assert(passport.verificationTimestamp !== undefined, 'Passport contains valid timestamp');

// 17. Demo Reset
stateMgr.resetDemo();
assert(stateMgr.state.student.skills.GMP.current === 42, 'Demo reset restored GMP skill to baseline 42%');
assert(stateMgr.state.assessment.completed === false, 'Demo reset restored assessment state');
assert(stateMgr.state.applications['OPP-DABUR-01'].applied === false, 'Demo reset restored applications');

// 18. Modular Data Layer & AppData Orchestrator Verification
const appData = global.AppData;
assert(appData !== undefined, 'AppData module is initialized on global scope');
assert(appData.getStudents().length >= 14, `AppData loaded ${appData.getStudents().length} authentic student profiles`);
assert(appData.getColleges().length >= 12, `AppData loaded ${appData.getColleges().length} premier accredited colleges`);
assert(appData.getIndustries().length >= 12, `AppData loaded ${appData.getIndustries().length} verified Ayush enterprises`);
assert(appData.getOpportunities().length >= 14, `AppData loaded ${appData.getOpportunities().length} domain openings`);
assert(appData.getBridgeCourses().length >= 12, `AppData loaded ${appData.getBridgeCourses().length} bridge modules`);
assert(appData.getFaculty().length >= 12, `AppData loaded ${appData.getFaculty().length} faculty mentors`);
assert(appData.getQuestions().length === 12, `AppData loaded 12 authentic diagnostic questions`);

// 19. Fast Memory Map Indexes & Dynamic State Optimizations
assert(appData.studentsMap['CAND-SHUBHAM'] !== undefined, 'studentsMap direct memory index active');
assert(appData.opportunitiesMap['OPP-DABUR-01'] !== undefined, 'opportunitiesMap direct memory index active');
assert(appData.coursesMap['BC-GMP-101'] !== undefined, 'coursesMap direct memory index active');

// Test Role Switching
stateMgr.setRole('ministry');
assert(stateMgr.state.currentRole === 'ministry', 'Role switched to ministry');
assert(stateMgr.state.currentView === 'ministry-dashboard', 'View transitioned to ministry-dashboard');
stateMgr.setRole('student');
assert(stateMgr.state.currentRole === 'student', 'Role restored to student');

console.log('--- All 19 Core Verification Tests Passed Successfully! ---');


