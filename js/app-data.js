/**
 * SkillSetu Centralized Mock Dataset
 * Ministry of Ayush - Smart India Hackathon 2026 (SIH26044)
 */

window.SKILLSETU_DATA = {
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

  defaultStudent: {
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

  assessmentQuestions: [
    {
      id: 1,
      domain: "Ayurvedic Principles (Tridosha Siddhanta)",
      question: "Which of the following physiological functions is primarily governed by the 'Vata' dosha in classical Ayurvedic physiology?",
      options: [
        { text: "Controls all bodily movements, neuromuscular signals, and cellular transportation.", correct: true },
        { text: "Regulates enzymatic digestion, thermogenesis, and cellular metabolic conversion.", correct: false },
        { text: "Provides structural cohesion, tissue lubrication, and musculoskeletal stability.", correct: false },
        { text: "Exclusively manages cardiac contraction without affecting neuro-sensory perception.", correct: false }
      ],
      skillDomain: "Diagnostics",
      explanation: "Vata (comprising Vayu and Akasha) is the prime mover ('Gati') governing kinetic energy, neural transmission, respiration, and peristalsis."
    },
    {
      id: 2,
      domain: "Dravyaguna & Herbology",
      question: "Which Ayurvedic drug is recognized in the Ayurvedic Pharmacopoeia of India (API) as having 'Rasayana' (rejuvenative), 'Medhya' (nootropic), and adaptogenic properties?",
      options: [
        { text: "Withania somnifera (Ashwagandha) and Bacopa monnieri (Brahmi)", correct: true },
        { text: "Commiphora mukul (Guggulu) and Ricinus communis (Eranda)", correct: false },
        { text: "Cassia angustifolia (Senna) and Operculina turpethum (Trivrit)", correct: false },
        { text: "Aconitum ferox (Vatsanabha) and Strychnos nux-vomica (Kupilu)", correct: false }
      ],
      skillDomain: "Herbology",
      explanation: "Ashwagandha and Brahmi are classical Medhya Rasayana herbs documented for cognitive enhancement, neuroprotection, and stress resilience."
    },
    {
      id: 3,
      domain: "Ayurvedic Pharmacology & Bhasma Science",
      question: "In the preparation of Herbo-mineral Bhasmas, what is the primary purpose of the 'Marana' process following 'Shodhana'?",
      options: [
        { text: "Thermal incineration with herbal juices to render metals non-toxic, nano-sized, and bio-assimilable ('Apunarbhava').", correct: true },
        { text: "Simply increasing the macroscopic weight of the mineral compound for shelf longevity.", correct: false },
        { text: "Acid-base precipitation to remove purely volatile aromatic hydrocarbons.", correct: false },
        { text: "Liquid extraction of water-soluble glycosides using alcohol reflux.", correct: false }
      ],
      skillDomain: "PatientCare",
      explanation: "Marana (calcination via Puta) achieves particle size reduction to nanoscale, eliminating raw metal toxicity and ensuring biological compatibility."
    },
    {
      id: 4,
      domain: "GMP Compliance (Schedule T) & Quality Assurance",
      question: "Under Schedule T of the Drugs and Cosmetics Rules for Ayurvedic formulation manufacturing, which parameter is mandatory for heavy metal limit validation in finished extracts?",
      options: [
        { text: "Quantitative testing for Lead (Pb), Cadmium (Cd), Mercury (Hg), and Arsenic (As) within API/WHO permissible limits.", correct: true },
        { text: "Visual color inspection only under natural daylight conditions.", correct: false },
        { text: "Single pH measurement without atomic absorption spectroscopy verification.", correct: false },
        { text: "Alcohol content testing solely without elemental screening.", correct: false }
      ],
      skillDomain: "GMP",
      explanation: "Schedule T mandates strict adherence to permissible limits for Lead (10 ppm), Arsenic (3 ppm), Cadmium (0.3 ppm), and Mercury (1 ppm) via AAS/ICP-MS."
    },
    {
      id: 5,
      domain: "Clinical Diagnostics & Nadi Pariksha",
      question: "During classical Radial Pulse Examination (Nadi Pariksha), a pulse movement resembling a serpent (Sarpa Gati) or leech (Jalauka Gati) indicates the predominance of which entity?",
      options: [
        { text: "Vata Dosha predominance characterized by rapid, irregular, and curved trajectory.", correct: true },
        { text: "Pitta Dosha predominance exhibiting jumpy, frog-like motion (Manduka Gati).", correct: false },
        { text: "Kapha Dosha predominance exhibiting slow, steady swan-like motion (Hamsa Gati).", correct: false },
        { text: "Complete physiological equilibrium with zero kinetic variation.", correct: false }
      ],
      skillDomain: "Diagnostics",
      explanation: "Sarpa Gati (snake-like) reflects Vata; Manduka Gati (frog-like) reflects Pitta; Hamsa/Gaja Gati (swan/elephant-like) reflects Kapha."
    }
  ],

  bridgeCourses: [
    {
      id: "BC-GMP-101",
      title: "GMP Compliance for Ayurvedic Formulation",
      category: "Industry Readiness & Manufacturing",
      duration: "4 Weeks (32 Hours)",
      skillImproved: "GMP Compliance & Quality Control",
      instructor: "Dr. Arvind Shrivastava (Ex-Quality Head, Dabur & Ayush Advisor)",
      rating: "4.9/5 (840 students)",
      status: "Recommended",
      targetGap: "GMP Compliance",
      initialSkill: 42,
      boostedSkill: 85,
      description: "Master Schedule T compliance, Ayush Premium Mark guidelines, batch manufacturing documentation, validation of herbal raw materials, and cleanroom protocols.",
      modules: [
        { title: "Module 1: Schedule T & Ayush Regulatory Framework", duration: "8 hrs", completed: true },
        { title: "Module 2: Standard Operating Procedures & Cleanroom Protocols", duration: "8 hrs", completed: false },
        { title: "Module 3: Heavy Metal, Pesticide & Microbial Limit Testing", duration: "8 hrs", completed: false },
        { title: "Module 4: Batch Manufacturing Records (BMR) & Audits", duration: "8 hrs", completed: false }
      ]
    },
    {
      id: "BC-QC-202",
      title: "Quality Control Analytics & Herbal HPTLC",
      category: "Laboratory & Standardization",
      duration: "3 Weeks (24 Hours)",
      skillImproved: "Quality Control & Phytochemistry",
      instructor: "Prof. Meenakshi Sundaram (NIA Jaipur)",
      rating: "4.8/5 (510 students)",
      status: "Available",
      targetGap: "Quality Control Analytics",
      initialSkill: 48,
      boostedSkill: 80,
      description: "Hands-on virtual simulation of High-Performance Thin-Layer Chromatography (HPTLC) fingerprinting, marker compound quantification, and pharmacopoeial assays.",
      modules: [
        { title: "Module 1: Phytochemical Extraction Protocols", duration: "6 hrs", completed: false },
        { title: "Module 2: HPTLC Instrumentation & Plate Development", duration: "10 hrs", completed: false },
        { title: "Module 3: Chromatographic Fingerprint Interpretation", duration: "8 hrs", completed: false }
      ]
    },
    {
      id: "BC-GCP-303",
      title: "Good Clinical Practice (GCP) for Ayush Trials",
      category: "Clinical Research",
      duration: "4 Weeks (30 Hours)",
      skillImproved: "Clinical Research & GCP",
      instructor: "Dr. Rajesh Kotecha (Senior Clinical Investigator)",
      rating: "4.9/5 (720 students)",
      status: "Available",
      targetGap: "Regulatory Affairs",
      initialSkill: 62,
      boostedSkill: 88,
      description: "CTRI registration, ethical committee approvals, adverse event reporting, and standardized clinical documentation for traditional medicine trials.",
      modules: [
        { title: "Module 1: ICMR & Ayush Ethical Guidelines", duration: "8 hrs", completed: false },
        { title: "Module 2: Protocol Design & Case Report Forms (CRF)", duration: "12 hrs", completed: false },
        { title: "Module 3: Data Safety Monitoring & CTRI Reporting", duration: "10 hrs", completed: false }
      ]
    }
  ],

  opportunities: [
    {
      id: "OPP-DABUR-01",
      company: "Dabur India Ltd",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAKXf5RIs3obOb73b6c4rjLc5JFhfLLmrcyt-WQNAo3cgjtNHdOhfG56HkPADSkHDSZxZuax3ggFou44Pejirf_fDG9I_W0T6SOVJdc3Cnzv1tKJ3ZI92ZB6U1tquegfMQZ1Qwe56874XTyTQ2gj9cykWnGhrYZ6rvZq7KnH8ZL3K7Z6vuGDnyjQLE7CZ-0w0tWV_-aeHMBTZ6p4TzNHHfjotR0-KSAdnlsmMLqH5ho6yfKtLYx_cIq",
      role: "Ayurvedic Formulation Intern",
      location: "Noida / Sahibabad R&D Center",
      type: "Internship (6 Months) with PPO",
      stipend: "₹28,000 / month",
      initialMatch: 82,
      boostedMatch: 95,
      requiredSkills: ["Herbology", "GMP Compliance", "Quality Control", "Standardisation"],
      description: "Collaborate with Dabur R&D formulation scientists on classical Asava-Arishta optimization and Schedule T compliant quality control testing.",
      posted: "2 days ago",
      applicantCount: 24
    },
    {
      id: "OPP-PATANJALI-02",
      company: "Patanjali Research Foundation",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpSc5Dm9fAtP4WPkavAEtPdrIvqfByPEsbYk6RUSXHkZYBuparVEQLei_2VKgGWYzMQcUI97DcEksgH0BYOnVu3Hhf8zx7Lfq5Us_MsJZAhSycQgHd9-pHeyCHeGtpJa5PVMeZz_cwuxEm96mbQluhVr_2pfViXyh8FIw9FkAZG62bcdvaoBiB_6TxZ3oKS2UXxg2nrVU31p1izmViOCtu8ljXefPnuJUpjDxiAJ2ClcRfp2Nl_ASS",
      role: "Clinical Trial Assistant",
      location: "Haridwar, Uttarakhand",
      type: "Full-time Placement",
      stipend: "₹4.8 LPA",
      initialMatch: 80,
      boostedMatch: 88,
      requiredSkills: ["Patient Care", "Diagnostics", "GCP Guidelines", "Clinical Research"],
      description: "Manage clinical observational studies, patient case documentation, and pulse parameter tracking in multidisciplinary Ayush hospital trials.",
      posted: "1 week ago",
      applicantCount: 42
    },
    {
      id: "OPP-KOTTAKKAL-03",
      company: "Kottakkal Arya Vaidya Sala",
      logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcWPXF2nyCTzSx1_FOXHikJyf0hqFaQplfsfwlzVaHEkuDjEGaMEVBZWz_QixVN6J2RjrwnBEuBjGgQ7hi_E9Xc0qF23GuKwhPzTn4xsMzpPj3DlXYWsGjiEvGFdy1px8cHlJbVPaAq81o7Qtc_aCRpMlKrzWgT5uqNkJhL3jiDHhrvqJewXrn_julX3cgtAyHnlpYASSpMICDufEghmDWCn2FtyGSzS3mYd1x8qHuqNwrgGHG6QCA",
      role: "Wellness Therapist Trainee",
      location: "Kottakkal / Kochi, Kerala",
      type: "Clinical Residency (1 Year)",
      stipend: "₹32,000 / month",
      initialMatch: 87,
      boostedMatch: 92,
      requiredSkills: ["Keraleeya Panchakarma", "Marma Therapy", "Patient Care"],
      description: "Direct clinical immersion in traditional Keraleeya Panchakarma procedures, Dhara, Pizhichil, and outpatient Ayurvedic consultations.",
      posted: "3 days ago",
      applicantCount: 18
    },
    {
      id: "OPP-HIMALAYA-04",
      company: "Himalaya Wellness Company",
      logo: "",
      role: "Research Associate - Phytochemistry",
      location: "Bengaluru, Karnataka",
      type: "Full-time Placement",
      stipend: "₹5.2 LPA",
      initialMatch: 65,
      boostedMatch: 78,
      requiredSkills: ["Herbology", "GMP Compliance", "Research"],
      description: "Screening of bioactive botanical extracts, HPLC assay development, and regulatory documentation for herbal wellness products.",
      posted: "3 days ago",
      applicantCount: 31
    }
  ],

  candidates: [
    {
      id: "CAND-SHUBHAM",
      name: "Shubham Rawal",
      education: "BAMS Final Year",
      institution: "National Institute of Ayurveda (NIA), Jaipur",
      discipline: "ayurveda",
      degree: "bams",
      match: 95,
      availability: "Available Now",
      status: "Applied - Under Review",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbPrD05LHLmlcpCryv0Da3BrdItjvbOr8qBAASeP1rhz9381htAj0oR72GTCo0XdGK-qr32ZRiODbxozXMjxKAV5BcPe7beGr7CUHRJgJPfGzL2XvG1vO1Mek5Ns9IeR9Y4QVMoe1w2ZeXcxJRq03Ls9Kj5hB_RiQUP6WTQdGN46N-1xrLBKu39cfvDAnQUDtBvKYCL-B4ECgrX3wXWBJPa4sK5nzWNhXMicC0MxtbO-kXR1IHunvT",
      verifiedSkills: ["Herbology", "GMP Certified", "Panchakarma Therapy", "Clinical Diagnosis"],
      shortlisted: false,
      gpa: "8.6 / 10",
      experience: "Clinical Internship at NIA Hospital (12 Mos)",
      email: "shubham.rawal@nia.edu.in",
      phone: "+91 98765 43210"
    },
    {
      id: "CAND-ADITI",
      name: "Dr. Aditi Sharma",
      education: "BAMS, MD (Ay)",
      institution: "All India Institute of Ayurveda (AIIA), New Delhi",
      discipline: "ayurveda",
      degree: "mday",
      match: 94,
      availability: "Available Now",
      status: "Available",
      avatar: "",
      verifiedSkills: ["Herbology", "GMP Certification", "Clinical Trial Mgt", "Dravyaguna"],
      shortlisted: true,
      gpa: "9.2 / 10",
      experience: "Postgraduate Clinical Research Fellow (2 Yrs)",
      email: "dr.aditi@aiia.gov.in",
      phone: "+91 98111 22334"
    },
    {
      id: "CAND-RAJEEV",
      name: "Rajeev Verma",
      education: "B.Sc Yoga Therapy",
      institution: "SVYASA Yoga University, Bengaluru",
      discipline: "yoga",
      degree: "bams",
      match: 88,
      availability: "In Discussion",
      status: "In Discussion",
      avatar: "",
      verifiedSkills: ["Asana Instruction", "Corporate Wellness", "Pranayama Therapy"],
      shortlisted: false,
      gpa: "8.4 / 10",
      experience: "Wellness Consultant (1 Yr)",
      email: "rajeev.yoga@svyasa.edu.in",
      phone: "+91 97222 33445"
    },
    {
      id: "CAND-SANA",
      name: "Dr. Sana Khan",
      education: "BUMS",
      institution: "National Institute of Unani Medicine (NIUM), Bengaluru",
      discipline: "unani",
      degree: "bums",
      match: 82,
      availability: "Available Now",
      status: "Available",
      avatar: "",
      verifiedSkills: ["Regimenal Therapy (Ilaj-bit-Tadbeer)", "Quality Control", "Unani Pharmacology"],
      shortlisted: false,
      gpa: "8.1 / 10",
      experience: "Hospital Resident (8 Mos)",
      email: "sana.khan@nium.edu.in",
      phone: "+91 96333 44556"
    }
  ],

  collegeMetrics: {
    institutionName: "National Institute of Ayurveda (Deemed University)",
    location: "Jaipur, Rajasthan",
    avgStudentReadiness: 76,
    industryDemandMatch: 62,
    activeStudents: 1248,
    semesterGrowth: "+12%",
    topSkillGaps: [
      { skill: "GMP Compliance", readiness: 35, deficit: 45, severity: "High" },
      { skill: "Quality Control Analytics", readiness: 48, deficit: 32, severity: "High" },
      { skill: "Regulatory Affairs", readiness: 62, deficit: 18, severity: "Medium" }
    ],
    recommendedActions: [
      { title: "Intro to GMP Standards (Schedule T)", reason: "Addresses the 45% gap in compliance knowledge for manufacturing placements." },
      { title: "Advanced QC Methods (HPTLC/AAS)", reason: "Partnership potential with local Ayush pharmaceutical manufacturing clusters." }
    ]
  },

  ministryAnalytics: {
    states: [
      { name: "Rajasthan", gapSeverity: "High", deficit: "42%", students: "6,420", colleges: "48", topDemand: "GMP Compliance" },
      { name: "Uttar Pradesh", gapSeverity: "High", deficit: "38%", students: "9,150", colleges: "72", topDemand: "Herbology & Extraction" },
      { name: "Maharashtra", gapSeverity: "Medium", deficit: "24%", students: "8,320", colleges: "64", topDemand: "Pharma QC" },
      { name: "Karnataka", gapSeverity: "Low", deficit: "14%", students: "5,840", colleges: "42", topDemand: "Clinical Research" },
      { name: "Kerala", gapSeverity: "Low", deficit: "9%", students: "4,980", colleges: "36", topDemand: "Keraleeya Panchakarma" },
      { name: "Gujarat", gapSeverity: "Medium", deficit: "21%", students: "4,210", colleges: "32", topDemand: "Ayurvedic Formulation" }
    ],
    topDemandSkills: [
      { name: "Panchakarma Therapy", demand: 92, status: "High Demand", icon: "spa" },
      { name: "GMP Quality Control", demand: 85, status: "Critical", icon: "science" },
      { name: "Herbology & Dravyaguna", demand: 76, status: "Stable", icon: "forest" },
      { name: "Clinical Research & GCP", demand: 68, status: "High Demand", icon: "biotech" },
      { name: "Ayurvedic Pharmacology", demand: 64, status: "Growing", icon: "medication" }
    ],
    placementTrends: [
      { quarter: "Q1 '23", value: "6.2k", height: 40, highlight: false },
      { quarter: "Q2 '23", value: "7.1k", height: 48, highlight: false },
      { quarter: "Q3 '23", value: "9.5k", height: 65, highlight: false },
      { quarter: "Q4 '23", value: "12.8k", height: 85, highlight: true }
    ]
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

  collegesDirectory: [
    {
      id: "COL-NIA-01",
      name: "National Institute of Ayurveda (NIA)",
      location: "Jaipur, Rajasthan",
      state: "Rajasthan",
      type: "Deemed University (Institute of National Importance)",
      accreditation: "NAAC A++ • Apex Institute",
      founded: "1976",
      dean: "Prof. Sanjeev Sharma",
      studentsCount: "1,450+ Enrolled",
      disciplines: ["Ayurveda (BAMS, MD/MS, Ph.D)", "Panchakarma", "Dravyaguna Herbology"],
      placementRate: "94% Campus Placed",
      bridgeAdoption: "98% Schedule T Certified",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?w=500&auto=format&fit=crop&q=80",
      highlights: ["300-Bed NABH Teaching Hospital", "Advanced HPTLC Phytochemistry Lab", "Dabur & Patanjali Research MoU"],
      contact: "admission@nia.edu.in • www.nia.nic.in"
    },
    {
      id: "COL-AIIA-02",
      name: "All India Institute of Ayurveda (AIIA)",
      location: "Sarita Vihar, New Delhi",
      state: "Delhi",
      type: "Autonomous Apex Institute (Ministry of Ayush)",
      accreditation: "NABH Accredited • AICTE Recognized",
      founded: "2015",
      dean: "Prof. Tanuja Nesari",
      studentsCount: "920+ Scholars",
      disciplines: ["Ayurveda (MD/MS, Ph.D)", "Integrative Clinical Oncology", "Kaumarbhritya"],
      placementRate: "96% Placed / Fellowships",
      bridgeAdoption: "95% GCP & Diagnostic Ready",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&auto=format&fit=crop&q=80",
      highlights: ["WHO Traditional Medicine Collaboration Center", "Bio-imaging & Clinical Genomics Hub", "Multi-specialty NABH Ayush Hospital"],
      contact: "academic@aiia.gov.in • www.aiia.gov.in"
    },
    {
      id: "COL-ITRA-03",
      name: "Institute of Teaching & Research in Ayurveda (ITRA)",
      location: "Jamnagar, Gujarat",
      state: "Gujarat",
      type: "Institute of National Importance (INI)",
      accreditation: "Parliamentary INI Act • NAAC A Grade",
      founded: "1952",
      dean: "Prof. Anup Thakar",
      studentsCount: "1,180+ Scholars",
      disciplines: ["Ayurveda (BAMS, MD, Ph.D)", "Rasa Shastra & Bhasma Standardization"],
      placementRate: "91% Campus Placed",
      bridgeAdoption: "92% Formulation Quality",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&auto=format&fit=crop&q=80",
      highlights: ["Botanical Garden with 850+ Medicinal Species", "Pharmaceutical Standardization Unit", "Pharma Campus Recruitment Ties"],
      contact: "director@itra.edu.in • www.itra.edu.in"
    },
    {
      id: "COL-BHU-04",
      name: "Faculty of Ayurveda, Banaras Hindu University (BHU)",
      location: "Varanasi, Uttar Pradesh",
      state: "Uttar Pradesh",
      type: "Central University Faculty",
      accreditation: "NIRF Top 5 • NAAC A++",
      founded: "1922",
      dean: "Prof. P. K. Goswami",
      studentsCount: "1,350+ Students",
      disciplines: ["BAMS, MD/MS (15 Specialities), Ph.D", "Shalya Tantra", "Kayachikitsa"],
      placementRate: "93% Placed / Hospital Practice",
      bridgeAdoption: "89% SkillSetu Integrated",
      image: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=500&auto=format&fit=crop&q=80",
      highlights: ["Sir Sunderlal Hospital (1,200 Beds)", "Center for Nadi Vigyan AI diagnostics", "Herbal Extraction Pilot Plant"],
      contact: "ayurveda@bhu.ac.in • www.bhu.ac.in"
    },
    {
      id: "COL-GAVC-05",
      name: "Government Ayurveda College & Hospital",
      location: "Thiruvananthapuram, Kerala",
      state: "Kerala",
      type: "State Premier Government College",
      accreditation: "KUHS Affiliated • Kerala Ayush Dept",
      founded: "1889",
      dean: "Dr. P. R. Saraswathy",
      studentsCount: "850+ Students",
      disciplines: ["BAMS, MD (Panchakarma Speciality)", "Keraleeya Chikitsa & Marma"],
      placementRate: "97% Placed / Global Wellness",
      bridgeAdoption: "94% Marma & Wellness Certified",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=80",
      highlights: ["Global Medical Tourism Hub", "Kottakkal & Vaidyaratnam Training MoUs", "Traditional Dhara & Pizhichil Wards"],
      contact: "principal@gavctvm.ac.in • www.gavctvm.ac.in"
    },
    {
      id: "COL-NIUM-06",
      name: "National Institute of Unani Medicine (NIUM)",
      location: "Bengaluru, Karnataka",
      state: "Karnataka",
      type: "Autonomous Apex Institute (Ministry of Ayush)",
      accreditation: "RGUHS Affiliated • Ministry of Ayush",
      founded: "2004",
      dean: "Prof. Abdul Wadud",
      studentsCount: "640+ Postgraduates",
      disciplines: ["Unani (BUMS, MD Unani, Ph.D)", "Ilaj-bit-Tadbeer (Regimental Therapy)"],
      placementRate: "89% Placed",
      bridgeAdoption: "91% Standardized Formulations",
      image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=500&auto=format&fit=crop&q=80",
      highlights: ["Advanced Unani Pharmacopoeia Testing Lab", "180-Bed Research Hospital", "Hamdard & Rex Remedies Placement Ties"],
      contact: "director@nium.in • www.nium.in"
    }
  ],

  ministryInsights: {
    nationalSummary: {
      activeInstitutes: 352,
      registeredStudents: "42,850+",
      verifiedRecruiters: "1,240+",
      averageStipend: "₹3.8 - ₹6.5 LPA",
      nationalPlacementRate: "88.4%",
      gmpComplianceSurge: "+42% YoY"
    },
    topHighGrowthSkills: [
      { skill: "Schedule T GMP Manufacturing & SOPs", demand: "96% High Demand", avgSalary: "₹5.8 LPA", growth: "+44%" },
      { skill: "HPTLC Phytochemical Standardization", demand: "92% High Demand", avgSalary: "₹5.2 LPA", growth: "+38%" },
      { skill: "Clinical Trial Documentation & GCP", demand: "89% High Demand", avgSalary: "₹4.8 LPA", growth: "+31%" },
      { skill: "Keraleeya Panchakarma Protocol & Marma", demand: "86% High Demand", avgSalary: "₹4.5 LPA", growth: "+29%" }
    ],
    governmentScholarships: [
      {
        title: "National Ayush Mission (NAM) Industrial Fellowship",
        grantAmount: "₹25,000 / month for 6 Months",
        eligibility: "BAMS / MD students scoring 80%+ on SkillSetu Clinical Diagnostic",
        deadline: "30 Sept 2026",
        sponsor: "Ministry of Ayush, Govt of India"
      },
      {
        title: "Ayush Aahar & Phytochemistry Research Grant",
        grantAmount: "₹3.5 Lakh Seed Funding",
        eligibility: "Final-year PG Scholars with verified formulation bridge certificates",
        deadline: "15 Oct 2026",
        sponsor: "Pharmacopoeia Commission for Indian Medicine (PCIM&H)"
      },
      {
        title: "Schedule T Modernization Apprenticeship Scheme",
        grantAmount: "100% Industry Bridge Course Subsidy + ₹15k Stipend Support",
        eligibility: "All undergraduate interns at recognized Ayush colleges",
        deadline: "Open All Year",
        sponsor: "National Skill Development Corporation (NSDC) & Ministry of Ayush"
      }
    ]
  },

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
        message: "National Ayush Skill Registry has updated clinical benchmark standards for 2026. Take the 5-question diagnostic quiz.",
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



