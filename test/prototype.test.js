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
assert(window.SKILLSETU_DATA.assessmentQuestions.length === 5, 'Assessment has exactly 5 questions');
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
  1: 0, // Correct
  2: 0, // Correct
  3: 0, // Correct
  4: 0, // Correct
  5: 1  // Wrong
};
const scorePct = stateMgr.submitAssessment(mockAnswers);
assert(scorePct === 80, `Assessment score calculated correctly (4/5 = 80%, got ${scorePct}%)`);
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

// 13. Demo Reset
stateMgr.resetDemo();
assert(stateMgr.state.student.skills.GMP.current === 42, 'Demo reset restored GMP skill to baseline 42%');
assert(stateMgr.state.assessment.completed === false, 'Demo reset restored assessment state');
assert(stateMgr.state.applications['OPP-DABUR-01'].applied === false, 'Demo reset restored applications');

console.log('--- All 13 Core Verification Tests Passed Successfully! ---');


