/**
 * UI Rendering Verification for all SkillSetu Views
 */

// Setup simulated DOM
global.window = global;
global.document = {
  getElementById: (id) => ({
    innerHTML: '',
    appendChild: () => {},
    remove: () => {}
  }),
  body: {
    appendChild: () => {},
    insertAdjacentHTML: () => {}
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
assert(navHTML.includes('SkillSetu') && navHTML.includes('Ministry of Ayush'), 'Navbar rendered with branding');

// 2. Test Landing Page HTML
const landingHTML = ui.getLandingHTML(state);
assert(landingHTML.includes('Bridging Ayush Education with') && landingHTML.includes('42,850+'), 'Landing page rendered with hero & stats');

// 3. Test Roles HTML
const rolesHTML = ui.getRolesHTML(state);
assert(rolesHTML.includes('Select Your Portal') && rolesHTML.includes('Student') && rolesHTML.includes('Industry'), 'Roles page rendered with 4 stakeholder cards');

// 4. Test Login HTML
const loginHTML = ui.getLoginHTML(state);
assert(loginHTML.includes('Sign In') && loginHTML.includes('shubham.rawal@nia.edu.in'), 'Login page rendered');

// 5. Test Student Dashboard HTML
const studentHTML = ui.getStudentDashboardHTML(state);
assert(studentHTML.includes('Welcome back, Shubham Rawal') && studentHTML.includes('Panchakarma') && studentHTML.includes('Dabur India Ltd'), 'Student dashboard rendered with radar & opportunities');

// 6. Test Assessment HTML
const assessHTML = ui.getAssessmentHTML(state);
assert(assessHTML.includes('Question 1 of 5') && assessHTML.includes('Vata'), 'Assessment rendered with questions & options');

// 7. Test Industry Dashboard HTML
const indHTML = ui.getIndustryDashboardHTML(state);
assert(indHTML.includes('Find Skill-Ready Ayush Talent') && indHTML.includes('Shubham Rawal') && indHTML.includes('Dr. Aditi Sharma'), 'Industry dashboard rendered with candidate pool');

// 8. Test College Dashboard HTML
const colHTML = ui.getCollegeDashboardHTML(state);
assert(colHTML.includes('College & Faculty Portal') && colHTML.includes('GMP Compliance') && colHTML.includes('45% Deficit'), 'College dashboard rendered with deficit analytics');

// 9. Test Ministry Admin HTML
const minHTML = ui.getMinistryDashboardHTML(state);
assert(minHTML.includes('National Skill Impact Analytics') && minHTML.includes('Rajasthan') && minHTML.includes('Panchakarma Therapy'), 'Ministry dashboard rendered with regional state heatmap & demand list');

console.log('--- All 9 UI Views Rendered Successfully without Errors! ---');
