export enum PedagogicalPractice {
  INQUIRY = "Inquiry-Discovery Learning",
  PJBL = "PjBL (Project Based Learning)",
  PROBLEM_SOLVING = "Problem Based Learning",
  GAME_BASED = "Game Based Learning",
  STATION = "Station Learning"
}

export enum GraduateDimension {
  IMTAQ = "Keimanan & Ketakwaan",
  KEWARGAAN = "Kewargaan",
  PENALARAN = "Penalaran Kritis",
  KREATIVITAS = "Kreativitas",
  KOLABORASI = "Kolaborasi",
  KEMANDIRIAN = "Kemandirian",
  KESEHATAN = "Kesehatan",
  KOMUNIKASI = "Komunikasi"
}

export interface LearningStep {
  opening: { steps: string; duration: string };
  understand: { type: string; steps: string; duration: string };
  apply: { type: string; steps: string; duration: string };
  reflect: { type: string; steps: string; duration: string };
  closing: { steps: string; duration: string };
}

export interface AssessmentDetail {
  technique: string;
  instrument: string;
  rubric: string;
}

export interface FormativeQuestion {
  question: string;
  options: { a: string; b: string; c: string; d: string };
  answer: string;
}

export interface LKPDTask {
  no: number;
  activity: string;
  instruction: string;
}

export interface LKPDContent {
  title: string;
  objective: string;
  instructions: string[];
  tasks: LKPDTask[];
}

export interface GeneratedRPMContent {
  students: string | {
    priorKnowledge: string;
    interests: string;
    needs: string;
  };
  interdisciplinary: string;
  partnership: string;
  environment: string;
  digitalTools: string;
  summary: string;
  pedagogy: string;
  dimensions: string | {
    dimension: string;
    elements: string;
  }[];
  meetings: LearningStep[];
  assessments: {
    initial: AssessmentDetail;
    process: AssessmentDetail;
    final: AssessmentDetail;
  };
  lkpd: string;
  formativeQuestions: FormativeQuestion[];
  enrichment: string;
  remedial: string;
  reflectionTeacher: string;
  reflectionStudent: string;
}

export interface ProtaEntry {
  material: string;
  hours: number;
  semester: number;
}

export interface PromesEntry {
  material: string;
  hours: number;
  weeks: string[]; // e.g. ["Jan-1", "Jan-2"]
}

export interface RPMFormData {
  schoolName: string;
  teacherName: string;
  teacherNip: string;
  principalName: string;
  principalNip: string;
  grade: string;
  academicYear: string;
  subject: string;
  chapter: string;
  chapterTitle: string;
  cp: string;
  tp: string;
  material: string;
  meetingCount: number;
  duration: string;
  pedagogy: PedagogicalPractice[];
  dimensions: GraduateDimension[];
}

export interface LibraryEntry {
  id: string;
  timestamp: string;
  formData: RPMFormData;
  generatedContent: GeneratedRPMContent;
  generatedImageUrl: string | null;
  themeIndex?: number;
}

export interface RPMState {
  formData: RPMFormData;
  generatedContent: GeneratedRPMContent | null;
  generatedImageUrl: string | null;
  isGenerating: boolean;
  isPrefilling: boolean;
  error: string | null;
}

export const SD_SUBJECTS = [
  "Bahasa Indonesia",
  "Matematika",
  "Ilmu Pengetahuan Alam dan Sosial (IPAS)",
  "Pendidikan Pancasila",
  "Seni Rupa",
  "Seni Musik",
  "Bahasa Inggris",
  "PJOK"
];