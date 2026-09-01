/**
 * UI Rendering Verification for all SkillSetu Views
 */

// Setup simulated DOM
let lastInsertedHTML = '';
global.window = global;
global.document = {
  getElementById: (id) => ({
    innerHTML: lastInsertedHTML,
    appendChild: () => {},
    remove: () => {}
  }),
  body: {
    appendChild: () => {},
    insertAdjacentHTML: (pos, html) => {
      lastInsertedHTML = html;
    }
  },
  addEventListener: () => {},
  scrollTo: () => {}
};
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

require('../js/app-data.js');
require('../js/app-state.js');
require('../js/app-ui.js');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✓ PASSED: ${message}`);
  }
}

console.log('--- Starting SkillSetu UI Render Tests ---');

const ui = window.AppUI;
const state = window.appState.state;

// 1. Test Navbar HTML
const navHTML = ui.getNavbarHTML(state);
assert(navHTML.includes('SkillSetu') && navHTML.includes('Ministry of Ayush') && navHTML.includes('public-mobile-drawer'), 'Navbar rendered with branding and responsive mobile drawer');

// 2. Test Landing Page HTML
const landingHTML = ui.getLandingHTML(state);
assert(landingHTML.includes('Ayush') && landingHTML.includes('42,850+'), 'Landing page rendered with hero & stats');
assert(landingHTML.includes('hero_ayush_biotech.jpg'), 'Landing page rendered with 4K Ayush Biotech Hero Image');
assert(!landingHTML.includes('Take 10-Min Diagnostic'), 'Landing page successfully removed student-only diagnostic button');
assert(landingHTML.includes('faq-card-1') && landingHTML.includes('faq-card-10'), 'Landing page rendered all 10 expanded FAQ items with category badges');
assert(landingHTML.includes('precision_manufacturing') && landingHTML.includes('radar') && landingHTML.includes('account_balance'), 'Landing page FAQ rendered with custom stakeholder logos');

// 3. Test Roles HTML
const rolesHTML = ui.getRolesHTML(state);
assert(rolesHTML.includes('Select Your Portal') && rolesHTML.includes('Student') && rolesHTML.includes('Company') && rolesHTML.includes('Faculty') && rolesHTML.includes('College') && rolesHTML.includes('Admin'), 'Roles page rendered with 5 stakeholder cards');

// 4. Test Login HTML
const loginHTML = ui.getLoginHTML(state);
assert(loginHTML.includes('Sign In') && loginHTML.includes('shubham.rawal@nia.edu.in'), 'Login page rendered');

// 5. Test Student Dashboard HTML
const studentHTML = ui.getStudentDashboardHTML(state);
assert(studentHTML.includes('Welcome back, Shubham Rawal') && studentHTML.includes('Panchakarma') && studentHTML.includes('Dabur India Ltd'), 'Student dashboard rendered with radar & opportunities');

// 6. Test Assessment HTML
const assessHTML = ui.getAssessmentHTML(state);
assert(assessHTML.includes('Question 1 of 12') && assessHTML.includes('Vata'), 'Assessment rendered with questions & options');

// 7. Test Industry Dashboard HTML
const indHTML = ui.getIndustryDashboardHTML(state);
assert(indHTML.includes('Find Skill-Ready Ayush Talent') && indHTML.includes('Shubham Rawal') && indHTML.includes('Dr. Aditi Sharma'), 'Industry dashboard rendered with candidate pool');

// 8. Test College Dashboard HTML
const colHTML = ui.getCollegeDashboardHTML(state);
assert(colHTML.includes('College & Faculty Portal') && colHTML.includes('Schedule T Industrial GMP'), 'College dashboard rendered with deficit analytics');

// 9. Test Ministry Admin HTML
const minHTML = ui.getMinistryDashboardHTML(state);
assert(minHTML.includes('National Skill Impact Analytics') && minHTML.includes('Rajasthan') && minHTML.includes('Panchakarma Therapy'), 'Ministry dashboard rendered with regional state heatmap & demand list');

// 10. Test LinkedIn Home Feed HTML
const feedHTML = ui.getFeedHTML(state);
assert(feedHTML.includes('Dabur India Ltd') && feedHTML.includes('Dr. Priya Sharma') && feedHTML.includes('SkillSetu News'), 'LinkedIn Home Feed rendered with student and company internship posts');

// 11. Test Colleges Directory HTML (Student & Industry perspective)
const collegesHTML = ui.getCollegesHTML(state);
assert(collegesHTML.includes('National Institute of Ayurveda') && collegesHTML.includes('All India Institute of Ayurveda'), 'Colleges Directory rendered with apex institutions');

// 12. Test Ministry Insights HTML
const insightsHTML = ui.getMinistryInsightsHTML(state);
assert(insightsHTML.includes('National Ayush Mission') && insightsHTML.includes('Schedule T GMP'), 'Ministry Insights rendered with high-growth competencies and scholarship grants');

// 13. Test Notifications Screen HTML (Accessible across all sections)
const notifsHTML = ui.getNotificationsHTML(state);
assert(notifsHTML.includes('Notifications & System Alerts') && notifsHTML.includes('Dabur India Ltd viewed your verified skill profile') && notifsHTML.includes('Filter Notifications'), 'Notifications screen rendered with real-time alert streams & filtering');

// 14. Test Internship Detail & Match Score Modal
ui.openInternshipDetailModal('OPP-DABUR-01');
assert(lastInsertedHTML.includes('Dabur India Ltd') && lastInsertedHTML.includes('Verified Competency Breakdown') && lastInsertedHTML.includes('1-Click Submit Application'), 'Internship modal renders match score and skill breakdown');

// 15. Test Full-Screen LinkedIn-Style Dedicated Profile View
ui.activeProfileQuery = 'me';
const myProfileHTML = ui.getProfileHTML(state);
assert(myProfileHTML.includes('Shubham Rawal') && myProfileHTML.includes('Analytics & Benchmark Metrics') && myProfileHTML.includes('Clinical Experience & Internships') && myProfileHTML.includes('Education & Qualifications'), 'Full-screen dedicated LinkedIn profile page rendered for student');

// 16. Test Bridge Courses Remediation Hub View
const bridgeCoursesHTML = ui.getBridgeCoursesHTML(state);
assert(bridgeCoursesHTML.includes('Ayush Bridge Course Directory') && bridgeCoursesHTML.includes('Schedule T GMP'), 'Bridge Courses Remediation Hub view rendered');

// 17. Test Verified Opportunities Match View
const oppsHTML = ui.getOpportunitiesHTML(state);
assert(oppsHTML.includes('Verified Industry Placements') && oppsHTML.includes('1-Click Apply'), 'Opportunities Match view rendered');

// 18. Test Verifiable Digital Skill Passport View
const passportHTML = ui.getSkillPassportHTML(state);
assert(passportHTML.includes('Digital Skill Passport') && passportHTML.includes('AYU-SHA256-'), 'Verifiable Digital Skill Passport view rendered');

// 19. Test Job Manager & Threshold Console
const jobManagerHTML = ui.getJobManagerHTML(state);
assert(jobManagerHTML.includes('Job & Internship Vacancy Manager') && jobManagerHTML.includes('Gatekeeper'), 'Job Manager view rendered');

// 20. Test Applicants ATS Kanban Pipeline
const atsHTML = ui.getApplicantsATSHTML(state);
assert(atsHTML.includes('Applicants ATS Kanban Board') && atsHTML.includes('Applied') && atsHTML.includes('Screening'), 'Applicants ATS Kanban Board view rendered');

// 21. Test Industry Insights & Supply Index
const indInsightsHTML = ui.getIndustryInsightsHTML(state);
assert(indInsightsHTML.includes('Industry Hiring Insights') && indInsightsHTML.includes('Schedule T Industrial GMP'), 'Industry Insights view rendered');

// 22. Test Faculty Course Builder Console
const courseBuilderHTML = ui.getCourseBuilderHTML(state);
assert(courseBuilderHTML.includes('Micro-Course Authoring Builder') && courseBuilderHTML.includes('Publish Bridge Module'), 'Faculty Course Builder view rendered');

// 23. Test Faculty Batch Tracker Console
const batchTrackerHTML = ui.getBatchTrackerHTML(state);
assert(batchTrackerHTML.includes('Pre vs Post Remediation Batch Tracker') && batchTrackerHTML.includes('140 Scholars'), 'Faculty Batch Tracker view rendered');

// 24. Test Faculty Mentorship Desk
const mentorshipHTML = ui.getMentorshipDeskHTML(state);
assert(mentorshipHTML.includes('Student Remedial Task Allocation') && mentorshipHTML.includes('Shubham Rawal'), 'Faculty Mentorship Desk view rendered');

// 25. Test Institution Hub
const instHubHTML = ui.getInstitutionHubHTML(state);
assert(instHubHTML.includes('National Institute of Ayurveda') && instHubHTML.includes('A++'), 'College Institution Hub view rendered');

// 26. Test Placement Console & MoUs
const placementHTML = ui.getPlacementConsoleHTML(state);
assert(placementHTML.includes('Campus Placement & MoU Console') && placementHTML.includes('Dabur India Ltd'), 'College Placement Console view rendered');

// 27. Test Accreditation Reports & NEP Compliance
const accredHTML = ui.getAccreditationReportsHTML(state);
assert(accredHTML.includes('NAAC & NCISM Skill Integration Reports') && accredHTML.includes('NEP 2020'), 'Accreditation Reports view rendered');

// 28. Test Faculty Mapping Directory
const facultyMapHTML = ui.getFacultyMappingHTML(state);
assert(facultyMapHTML.includes('Faculty Mentor Allocations') && facultyMapHTML.includes('Prof. Meenakshi Sundaram'), 'Faculty Mapping view rendered');

// 29. Test National Reports & Modernization Grants
const natReportsHTML = ui.getNationalReportsHTML(state);
assert(natReportsHTML.includes('National Ayush Skill Gap Index') && natReportsHTML.includes('₹450 Cr'), 'National Reports view rendered');

// 30. Test User Management & RBAC Administration
const userMgmtHTML = ui.getUserManagementHTML(state);
assert(userMgmtHTML.includes('Stakeholder Access Control') && userMgmtHTML.includes('Shubham Rawal'), 'User Management view rendered');

// 31. Test System Governance & Blockchain Node Health
const sysGovHTML = ui.getSystemGovernanceHTML(state);
assert(sysGovHTML.includes('Digital Skill Passport Node Governance') && sysGovHTML.includes('GOV-IN-AYUSH-NODE-01'), 'System Governance view rendered');

console.log('--- All 31 Full-Screen Views & Pages Rendered Successfully without Errors! ---');


