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
  }
};
