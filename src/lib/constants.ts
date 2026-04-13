// Colleges and Institutes
export const COLLEGES = [
  "College of Business and Financial Management",
  "College of Continuing Advanced and Professional Studies",
  "College of Construction Sciences and Engineering",
  "College of Computing and Information Sciences",
  "College of Engineering Technology",
  "College of Governance and Public Policy",
  "College of Human Kinetics",
  "College of Innovative Teacher Education",
  "CITE-Higher School ng UMak",
  "College of Tourism and Hospitality Management",
  "Institute of Arts and Design",
  "Institute of Disaster and Emergency Management",
  "Institutes of Imaging Health Sciences",
  "Institute of Accountancy",
  "Institutes of Nursing",
  "Institutes of Pharmacy",
  "Institute of Psychology",
  "Institute of Social Works",
  "School of Law",
  "Other",
];

// Year Levels
export const YEAR_LEVELS = [
  "Grade 11",
  "Grade 12",
  "First Year Level",
  "Second Year Level",
  "Third Year Level",
  "Fourth Year Level",
  "Fifth Year Level",
];

// GMC Purposes
export const GMC_PURPOSES = [
  "Employment",
  "Graduate School",
  "Scholarship",
  "Transfer",
  "Board Exam",
  "Agency",
  "Other",
];

// GMC Classifications
export const GMC_CLASSIFICATIONS = [
  { value: "Currently Enrolled", label: "Currently Enrolled Student" },
  { value: "Graduate", label: "Graduate / Alumni" },
  { value: "Non-Completer", label: "Non-Completer (Left without graduating)" },
];

// Request Types
export const REQUEST_TYPES = {
  GMC: "Good Moral Certificate",
  UER: "Uniform Exemption Request",
  CDC: "Cross-Dressing Clearance",
  CAC: "Child Admission Clearance",
};

// Request Status
export const REQUEST_STATUS = {
  NEW: { label: "New", color: "blue" },
  PROCESSING: { label: "Processing", color: "amber" },
  ISSUED: { label: "Issued", color: "emerald" },
  HOLD: { label: "On Hold", color: "slate" },
  REJECTED: { label: "Rejected", color: "red" },
};

// Complaint Categories
export const COMPLAINT_CATEGORIES = [
  { value: "MAJOR", label: "Major Offense", color: "red" },
  { value: "MINOR", label: "Minor Offense", color: "orange" },
  { value: "OTHER", label: "Other", color: "amber" },
];

// Complaint Types
export const COMPLAINT_TYPES = [
  "Academic Dishonesty",
  "Harassment",
  "Uniform Violation",
  "Disrespect to Faculty/Staff",
  "Vandalism",
  "Theft",
  "Physical Altercation",
  "Verbal Abuse",
  "Cyberbullying",
  "Substance Abuse",
  "Other",
];

// Minor Violations
export const MINOR_VIOLATIONS = [
  "Not wearing ID",
  "Not wearing prescribed school uniform",
  "Wearing of incomplete uniform",
  "Cross Dressing (for gays/lesbians)",
  "Wearing non-prescribed shoes",
  "Wearing of slippers",
  "Wearing of miniskirts and shorts",
  "Make-Up (for males)",
  "Exhibiting rough behavior",
  "Using of vulgar/abusive/obscene language",
  "Loitering",
  "Littering",
  "Careless/unauthorized use of school property",
  "Hair Color",
  "Unauthorized posting of announcements",
  "Violation of traffic rules/Jaywalking",
  "Male dress code violations (earrings, cap inside classrooms, etc.)",
  "Female dress code violations (multiple earrings, sleeveless, etc.)",
  "General conduct violations",
];

// Major Violations
export const MAJOR_VIOLATIONS = [
  "Writing/Putting feet on tables/chairs/walls",
  "Gambling",
  "Shouting/creating noise",
  "Using/lending another person's ID/COR",
  "Using fake IDs/CORs",
  "Cheating during examination",
  "Oral defamation",
  "Vandalism",
  "Plagiarism",
  "Convictions by court",
  "Immoral/sex-related acts/abortion",
  "Serious physical injury",
  "Theft",
  "Negligence of Duty",
  "Grave Act of Disrespect",
  "Serious Dishonesty",
  "Damaging university property",
  "Illegal assembly",
  "Possession/distribution of pornographic material",
  "Possession/smoking of cigarettes",
  "Tampering of student ID",
  "Unauthorized possession of exam materials",
  "Public Display of Affection",
  "Entering campus under influence",
  "Having someone take exam for another",
  "Bribing/receiving bribes",
  "Misappropriation of organization funds",
  "Hazing",
  "Involvement in rumble/fist fighting/armed combat",
  "Unauthorized collection/extortion",
  "Carrying/possession of firearms",
  "Membership in unrecognized organizations",
  "Drug law violations",
  "Gross Negligence",
  "Indiscriminate use of musical instruments/gadgets",
  "Portrayal of untoward behavior",
  "Grave disrespect to university officials",
  "Direct physical assault",
  "Anti-Hazing Act violations",
  "Exhibiting/exposing nude or half-naked content",
  "Forging/falsifying academic records",
  "Actions dishonoring the university",
  "Faculty Evaluation violations",
  "Wearing unauthorized lanyards (Unofficial)",
  "Wearing unauthorized fraternity insignia (Unofficial)",
];

// User Roles
export const USER_ROLES = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  STAFF: "CSFD Staff",
  ADMIN: "Administrator",
  SUPER_ADMIN: "Super Admin",
};

// Office Hours
export const DEFAULT_OFFICE_HOURS = {
  start: "08:00",
  end: "17:00",
  days: [1, 2, 3, 4, 5], // Monday to Friday
};

// File Types
export const ALLOWED_FILE_TYPES = {
  documents: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"],
  evidence: [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".mp4", ".mov", ".mp3", ".wav"],
};

// Max file sizes
export const MAX_FILE_SIZES = {
  document: 10 * 1024 * 1024, // 10MB
  evidence: 100 * 1024 * 1024, // 100MB
};

// Certificate validity
export const CERTIFICATE_VALIDITY_MONTHS = 6;
