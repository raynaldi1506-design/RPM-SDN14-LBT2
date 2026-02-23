
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  RPMFormData, 
  PedagogicalPractice, 
  GraduateDimension, 
  RPMState, 
  SD_SUBJECTS,
  LibraryEntry,
  ProtaEntry,
  PromesEntry,
  LKPDContent,
  FormativeQuestion
} from './types';
import { 
  generateRPMContent, 
  generateRPMImage, 
  pregenerateCPandTP, 
  getAITopics,
  generateProta,
  generatePromes,
  generateLKPD,
  generateQuestionBank,
  ChapterInfo
} from './services/geminiService';
import { 
  Printer, 
  Loader2, 
  BookOpen, 
  Sparkles,
  Download, 
  CheckCircle2,
  School,
  UserCircle,
  Layout,
  FileDown,
  AlertCircle,
  Library,
  Search,
  Zap,
  Save,
  ChevronRight,
  Trash2,
  Calendar,
  ClipboardList,
  ChevronDown,
  Plus,
  CheckSquare,
  Square,
  Info,
  PenTool,
  BookMarked,
  Eye,
  FileText,
  UserPlus,
  Clock,
  FolderOpen,
  FileQuestion
} from 'lucide-react';

const TEACHERS = [
  "Nasriwanto, S.Pd",
  "Raynaldi, S.Pd",
  "Randi Maikel, S.Or",
  "Nilam Melani Putri, S.Pd",
  "Lelis Mawati, S.Pd",
  "Raflinda Roza, S.Pd",
  "Sarwenda, S.PdI"
];

const SD_GRADES = [
  "Kelas 1",
  "Kelas 2",
  "Kelas 3",
  "Kelas 4",
  "Kelas 5",
  "Kelas 6"
];

const MEETING_THEMES = [
  { header: "#e3f2fd", accent: "#1565c0", text: "#0d47a1", name: "Biru" },
  { header: "#e8f5e9", accent: "#2e7d32", text: "#1b5e20", name: "Hijau" },
  { header: "#fff3e0", accent: "#ef6c00", text: "#e65100", name: "Oranye" },
  { header: "#f3e5f5", accent: "#7b1fa2", text: "#4a148c", name: "Ungu" },
  { header: "#fce4ec", accent: "#c2185b", text: "#880e4f", name: "Merah Muda" },
  { header: "#e0f2f1", accent: "#00796b", text: "#004d40", name: "Toska" },
];

const SUBJECT_THEME_MAP: Record<string, number> = {
  "Bahasa Indonesia": 4, // Pink
  "Matematika": 0, // Blue
  "Ilmu Pengetahuan Alam dan Sosial (IPAS)": 1, // Green
  "Pendidikan Pancasila": 2, // Orange
  "Seni Rupa": 3, // Purple
  "Seni Musik": 5, // Teal
  "Bahasa Inggris": 0, // Blue
  "PJOK": 1, // Green
};

const SEMESTER_2_MONTHS = [
  { name: "Januari", code: "Jan" },
  { name: "Februari", code: "Feb" },
  { name: "Maret", code: "Mar" },
  { name: "April", code: "Apr" },
  { name: "Mei", code: "Mei" },
  { name: "Juni", code: "Jun" }
];

const INITIAL_FORM: RPMFormData = {
  schoolName: "SDN 14 Lubuak Tarok",
  teacherName: TEACHERS[0],
  teacherNip: "19XXXXXXXXXXXXX",
  principalName: "Drs. H. Ahmad",
  principalNip: "19XXXXXXXXXXXXX",
  grade: "Kelas 1",
  academicYear: "2025/2026",
  subject: "Bahasa Indonesia",
  chapter: "",
  chapterTitle: "",
  cp: "",
  tp: "",
  material: "",
  meetingCount: 2,
  duration: "2 x 35 menit",
  pedagogy: [],
  dimensions: []
};

declare const html2pdf: any;

// --- REUSABLE RPM DOCUMENT COMPONENT ---
const RPMDocument = ({ entry, themeIndex, id }: { entry: LibraryEntry, themeIndex?: number, id?: string }) => {
  const { formData, generatedContent, generatedImageUrl } = entry;
  
  // Use provided themeIndex or derive from subject
  const activeThemeIndex = themeIndex !== undefined 
    ? themeIndex 
    : (SUBJECT_THEME_MAP[formData.subject] ?? 4);
  
  const docTheme = MEETING_THEMES[activeThemeIndex % MEETING_THEMES.length];

  return (
    <div id={id} className="rpm-document-wrapper">
      {/* PAGE 1: INFORMASI UMUM */}
      <div className="f4-page leading-none">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black uppercase underline decoration-4 underline-offset-8 mb-2" style={{ textDecorationColor: docTheme.accent }}>Rencana Pembelajaran Mendalam (RPM)</h2>
          <p className="font-bold text-lg uppercase tracking-widest">Kurikulum Merdeka - Semester Genap 2026</p>
        </div>

        <div className="border-[1.5pt] border-black text-center font-bold uppercase p-3 mb-6" style={{ backgroundColor: docTheme.header }}>A. IDENTITAS MODUL</div>
        <table className="table-spreadsheet mb-6">
          <tbody>
            <tr><td className="col-key">Satuan Pendidikan</td><td className="font-bold uppercase">{formData.schoolName}</td></tr>
            <tr><td className="col-key">Mata Pelajaran</td><td className="font-bold uppercase" style={{ color: docTheme.text }}>{formData.subject}</td></tr>
            {formData.chapter && (
              <tr><td className="col-key">Bab / Unit</td><td className="font-bold uppercase">{formData.chapter} {formData.chapterTitle ? `: ${formData.chapterTitle}` : ''}</td></tr>
            )}
            <tr><td className="col-key">Kelas / Fase</td><td className="font-bold">{formData.grade} / Fase {formData.grade.includes('1') || formData.grade.includes('2') ? 'A' : formData.grade.includes('3') || formData.grade.includes('4') ? 'B' : 'C'}</td></tr>
            <tr><td className="col-key">Alokasi Waktu</td><td className="font-bold">{formData.meetingCount} Pertemuan ({formData.duration})</td></tr>
          </tbody>
        </table>

        <div className="border-[1.5pt] border-black text-center font-bold uppercase p-3 mb-6" style={{ backgroundColor: docTheme.header }}>B. IDENTITAS MURID</div>
        <table className="table-spreadsheet mb-6">
          <tbody>
            {typeof generatedContent.students === 'string' ? (
              <tr><td className="col-key">Profil Murid</td><td className="text-justify leading-none">{generatedContent.students}</td></tr>
            ) : (
              <>
                <tr><td className="col-key">Pengetahuan Awal</td><td className="text-justify leading-none">{generatedContent.students.priorKnowledge}</td></tr>
                <tr><td className="col-key">Minat Belajar</td><td className="text-justify leading-none">{generatedContent.students.interests}</td></tr>
                <tr><td className="col-key">Kebutuhan Belajar</td><td className="text-justify leading-none">{generatedContent.students.needs}</td></tr>
              </>
            )}
          </tbody>
        </table>

        <div className="border-[1.5pt] border-black text-center font-bold uppercase p-3 mb-6" style={{ backgroundColor: docTheme.header }}>C. MATERI PELAJARAN</div>
        <table className="table-spreadsheet mb-6">
          <tbody>
            <tr><td className="col-key">Materi Pokok</td><td className="font-bold uppercase" style={{ color: docTheme.text }}>{formData.material}</td></tr>
            {generatedImageUrl && (
              <tr>
                <td className="col-key">Visualisasi</td>
                <td className="p-4 text-center bg-white">
                   <img 
                     src={generatedImageUrl} 
                     alt="Visual Materi" 
                     style={{ 
                       maxHeight: '200px', 
                       maxWidth: '100%', 
                       objectFit: 'contain', 
                       borderRadius: '12px',
                       margin: '0 auto',
                       display: 'block',
                       border: '1px solid #e2e8f0'
                     }} 
                   />
                </td>
              </tr>
            )}
            <tr>
              <td className="col-key">Ringkasan Materi</td>
              <td className="p-6 text-justify leading-none">
                <div className="markdown-body">
                  <Markdown>{generatedContent.summary}</Markdown>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="border-[1.5pt] border-black text-center font-bold uppercase p-3 mb-6" style={{ backgroundColor: docTheme.header }}>D. DIMENSI PROFIL LULUSAN</div>
        <table className="table-spreadsheet mb-6">
          <tbody>
            {Array.isArray(generatedContent.dimensions) ? (
              generatedContent.dimensions.map((dim, dIdx) => (
                <tr key={dIdx}>
                  <td className="col-key">{dim.dimension}</td>
                  <td className="text-sm leading-tight italic">{dim.elements}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="col-key">Dimensi P5</td>
                <td className="font-bold">{generatedContent.dimensions}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGE 2: DESAIN PEMBELAJARAN */}
      <div className="f4-page leading-none">
        <div className="border-[1.5pt] border-black text-center font-bold uppercase p-3 mb-6" style={{ backgroundColor: docTheme.header }}>E. DESAIN PEMBELAJARAN</div>
        <table className="table-spreadsheet">
          <tbody>
            <tr><td className="col-key">Capaian Pembelajaran</td><td className="text-justify leading-none">{formData.cp}</td></tr>
            <tr><td className="col-key">Tujuan Pembelajaran</td><td className="text-justify leading-none font-bold">{formData.tp}</td></tr>
            <tr><td className="col-key">Praktik Pedagogis</td><td className="font-bold italic" style={{ color: docTheme.accent }}>{generatedContent.pedagogy}</td></tr>
            <tr><td className="col-key">Lintas Disiplin Ilmu</td><td className="text-justify leading-none">{generatedContent.interdisciplinary}</td></tr>
            <tr><td className="col-key">Pemanfaatan Digital</td><td className="text-justify leading-none">{generatedContent.digitalTools}</td></tr>
          </tbody>
        </table>
        
        <div className="mt-10 text-center p-10 border-2 border-dashed border-slate-200 rounded-3xl">
          <p className="text-slate-400 italic text-sm">Halaman ini berisi ringkasan desain instruksional. Rincian pertemuan dimulai pada halaman berikutnya.</p>
        </div>
      </div>

      {/* PAGE 3+: PENGALAMAN BELAJAR (One Meeting per Page for F4 consistency) */}
      {generatedContent.meetings.map((meeting, idx) => {
        const theme = MEETING_THEMES[(activeThemeIndex + idx) % MEETING_THEMES.length];
        return (
          <div key={idx} className="f4-page leading-none">
            {idx === 0 && (
              <div className="border-[1.5pt] border-black text-center font-bold uppercase p-3 mb-6" style={{ backgroundColor: docTheme.header }}>F. PENGALAMAN BELAJAR (RINCIAN PER PERTEMUAN)</div>
            )}
            
            <div className="mb-6 border-2 border-indigo-900/10 rounded-3xl p-6 bg-white shadow-sm overflow-hidden" style={{ borderColor: theme.accent + '20' }}>
              <div className="flex items-center justify-between mb-6 border-b pb-4">
                <div className="meeting-badge !m-0" style={{ backgroundColor: theme.accent }}>PERTEMUAN KE-{idx + 1}</div>
                <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.accent }}>Deep Learning Session</div>
              </div>
              
              <table className="table-spreadsheet !m-0" style={{ borderColor: theme.accent }}>
                <tbody>
                  <tr>
                    <td colSpan={2} className="p-8 leading-none whitespace-pre-line text-justify">
                      <div className="font-bold uppercase mb-4 text-center py-3 border-b-2" style={{ backgroundColor: theme.header, color: theme.text, borderColor: theme.accent }}>
                        1. KEGIATAN AWAL ({meeting.opening.duration})
                      </div>
                      {meeting.opening.steps}
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="p-0 border-t-2" style={{ borderColor: theme.accent }}>
                      <div className="font-bold uppercase text-center py-3 border-b-2" style={{ backgroundColor: theme.header, color: theme.text, borderColor: theme.accent }}>
                        2. KEGIATAN INTI ({meeting.understand.duration} + {meeting.apply.duration} + {meeting.reflect.duration})
                      </div>
                      <div className="p-6 space-y-6">
                        <div className="whitespace-pre-line text-justify leading-none">
                          <div className="font-bold italic mb-2 text-indigo-900" style={{ color: theme.accent }}>A. Understand (Memahami)</div>
                          {meeting.understand.steps}
                        </div>
                        <div className="whitespace-pre-line text-justify leading-none border-t border-dashed pt-4" style={{ borderColor: theme.accent + '40' }}>
                          <div className="font-bold italic mb-2 text-indigo-900" style={{ color: theme.accent }}>B. Apply (Menerapkan)</div>
                          {meeting.apply.steps}
                        </div>
                        <div className="whitespace-pre-line text-justify leading-none border-t border-dashed pt-4" style={{ borderColor: theme.accent + '40' }}>
                          <div className="font-bold italic mb-2 text-indigo-900" style={{ color: theme.accent }}>C. Reflect (Refleksi)</div>
                          {meeting.reflect.steps}
                        </div>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={2} className="p-8 leading-none whitespace-pre-line text-justify border-t-2" style={{ borderColor: theme.accent }}>
                      <div className="font-bold uppercase mb-4 text-center py-3 border-b-2" style={{ backgroundColor: theme.header, color: theme.text, borderColor: theme.accent }}>
                        3. KEGIATAN AKHIR ({meeting.closing.duration})
                      </div>
                      {meeting.closing.steps}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* PAGE N: ASESMEN, PENGAYAAN, REMEDIAL */}
      <div className="f4-page leading-none">
        <div className="border-[1.5pt] border-black text-center font-bold uppercase p-3 mb-6" style={{ backgroundColor: docTheme.header }}>G. ASESMEN PEMBELAJARAN</div>
        <table className="table-spreadsheet">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="text-center" style={{width: '20%'}}>Komponen</th>
              <th className="text-center" style={{width: '25%'}}>Teknik Penilaian</th>
              <th className="text-center" style={{width: '25%'}}>Instrumen Penilaian</th>
              <th className="text-center">Rubrik / Kriteria</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-bold text-center bg-slate-50">Awal (Diagnostik)</td>
              <td className="text-center">{generatedContent.assessments.initial.technique}</td>
              <td>{generatedContent.assessments.initial.instrument}</td>
              <td className="text-justify text-sm leading-none">{generatedContent.assessments.initial.rubric}</td>
            </tr>
            <tr>
              <td className="font-bold text-center bg-slate-50">Proses (Formatif)</td>
              <td className="text-center">{generatedContent.assessments.process.technique}</td>
              <td>{generatedContent.assessments.process.instrument}</td>
              <td className="text-justify text-sm leading-none">{generatedContent.assessments.process.rubric}</td>
            </tr>
            <tr>
              <td className="font-bold text-center bg-slate-50">Akhir (Sumatif)</td>
              <td className="text-center">{generatedContent.assessments.final.technique}</td>
              <td>{generatedContent.assessments.final.instrument}</td>
              <td className="text-justify text-sm leading-none">{generatedContent.assessments.final.rubric}</td>
            </tr>
          </tbody>
        </table>

        <div className="border-[1.5pt] border-black text-center font-bold uppercase p-3 mb-6 mt-10" style={{ backgroundColor: docTheme.header }}>H. PENGAYAAN DAN REMEDIAL</div>
        <table className="table-spreadsheet">
          <tbody>
            <tr>
              <td className="col-key">Pengayaan</td>
              <td className="p-6 text-justify leading-none">{generatedContent.enrichment}</td>
            </tr>
            <tr>
              <td className="col-key">Remedial</td>
              <td className="p-6 text-justify leading-none">{generatedContent.remedial}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PAGE N+1: REFLEKSI & TANDA TANGAN */}
      <div className="f4-page leading-none">
        <div className="border-[1.5pt] border-black text-center font-bold uppercase p-3 mb-6" style={{ backgroundColor: docTheme.header }}>I. REFLEKSI & PENGESAHAN</div>
        
        <div className="mb-10">
          <h3 className="font-bold text-lg mb-6">Refleksi diri peserta didik dan pendidik</h3>
          <table className="table-spreadsheet">
            <tbody>
              <tr>
                <td className="col-key">Refleksi Pendidik</td>
                <td className="p-6 text-justify leading-none whitespace-pre-line italic">{generatedContent.reflectionTeacher}</td>
              </tr>
              <tr>
                <td className="col-key">Refleksi Peserta Didik</td>
                <td className="p-6 text-justify leading-none whitespace-pre-line italic">{generatedContent.reflectionStudent}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-20">
          <table className="table-signatures mt-6 mb-10">
            <tbody>
              <tr>
                <td>
                  <p className="mb-2">Mengetahui,</p>
                  <p className="font-bold mb-24 uppercase">Kepala Sekolah</p>
                  <p className="font-bold underline text-lg">{formData.principalName}</p>
                  <p className="text-sm">NIP. {formData.principalNip}</p>
                </td>
                <td>
                  <p className="mb-2">Lubuak Tarok, .................... 2026</p>
                  <p className="font-bold mb-24 uppercase">Guru Kelas</p>
                  <p className="font-bold underline text-lg">{formData.teacherName}</p>
                  <p className="text-sm">NIP. {formData.teacherNip}</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [state, setState] = useState<RPMState>({
    formData: INITIAL_FORM,
    generatedContent: null,
    generatedImageUrl: null,
    isGenerating: false,
    isPrefilling: false,
    error: null
  });

  const [aiTopics, setAiTopics] = useState<ChapterInfo[]>([]);
  const [isFetchingTopics, setIsFetchingTopics] = useState(false);
  const [topicSearchQuery, setTopicSearchQuery] = useState("");
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const comboboxRef = useRef<HTMLDivElement>(null);
  
  const [library, setLibrary] = useState<LibraryEntry[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);

  const [protaData, setProtaData] = useState<ProtaEntry[] | null>(null);
  const [promesData, setPromesData] = useState<PromesEntry[] | null>(null);
  const [lkpdData, setLkpdData] = useState<LKPDContent | null>(null);
  const [questionsData, setQuestionsData] = useState<FormativeQuestion[] | null>(null);
  const [isGeneratingExtra, setIsGeneratingExtra] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("topik");
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<string[]>([]);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState<number | null>(null);
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);

  // Load form data draft
  useEffect(() => {
    const savedFormData = localStorage.getItem('rpm_form_data');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        setState(prev => ({ ...prev, formData: { ...INITIAL_FORM, ...parsed } }));
      } catch (e) {}
    }
  }, []);

  // Save form data draft
  useEffect(() => {
    localStorage.setItem('rpm_form_data', JSON.stringify(state.formData));
  }, [state.formData]);

  // Load Library from LocalStorage
  useEffect(() => {
    const savedLibrary = localStorage.getItem('rpm_library');
    if (savedLibrary) {
      try {
        setLibrary(JSON.parse(savedLibrary));
      } catch (e) {
        console.error("Failed to parse library", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchDefaultTopics = async () => {
      setIsFetchingTopics(true);
      try {
        const topics = await getAITopics(state.formData.subject, state.formData.grade);
        setAiTopics(topics);
      } catch (err) {
        setAiTopics([]);
      } finally {
        setIsFetchingTopics(false);
      }
    };
    fetchDefaultTopics();
  }, [state.formData.subject, state.formData.grade]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsComboboxOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const triggerPrefill = async () => {
      if (state.formData.material && state.formData.subject) {
        setState(prev => ({ ...prev, isPrefilling: true, error: null }));
        try {
          const result = await pregenerateCPandTP(state.formData.subject, state.formData.material, state.formData.grade);
          
          const allDimensions = Object.values(GraduateDimension);
          const autoDimensions = (result.dimensions || []).map((d: string) => {
            return allDimensions.find(v => 
              v.toLowerCase().includes(d.toLowerCase()) || 
              d.toLowerCase().includes(v.toLowerCase())
            );
          }).filter(Boolean) as GraduateDimension[];

          const allPedagogies = Object.values(PedagogicalPractice);
          const autoPedagogy = (result.suggestedPedagogy || []).map((p: string) => {
            return allPedagogies.find(v => 
              v.toLowerCase().includes(p.toLowerCase()) || 
              p.toLowerCase().includes(v.toLowerCase())
            );
          }).filter(Boolean) as PedagogicalPractice[];

          setState(prev => ({
            ...prev,
            formData: {
              ...prev.formData,
              cp: result.cp || prev.formData.cp,
              tp: result.tp ? (result.tp || []).map((t: string, i: number) => `${i + 1}. ${t}`).join("\n") : prev.formData.tp,
              dimensions: autoDimensions.length > 0 ? autoDimensions : prev.formData.dimensions,
              pedagogy: autoPedagogy.length > 0 ? autoPedagogy : prev.formData.pedagogy,
            },
            isPrefilling: false
          }));
        } catch (err: any) {
          setState(prev => ({ ...prev, isPrefilling: false, error: "Gagal sinkronisasi otomatis." }));
        }
      }
    };
    
    // Only trigger if CP/TP are empty (new selection)
    const isActuallyEmpty = !state.formData.cp && !state.formData.tp;
    if (isActuallyEmpty && state.formData.material) {
       triggerPrefill();
    }
  }, [state.formData.material, state.formData.subject, state.formData.grade]);

  const handleGenerateNewTopics = async () => {
    if (!topicSearchQuery.trim()) return;
    setIsFetchingTopics(true);
    try {
      const newTopics = await getAITopics(state.formData.subject, state.formData.grade, topicSearchQuery);
      setAiTopics(newTopics);
      setIsComboboxOpen(true);
    } catch (err) {
      alert("Gagal menghasilkan topik baru.");
    } finally {
      setIsFetchingTopics(false);
    }
  };

  const filteredTopics = useMemo(() => {
    if (!topicSearchQuery) return aiTopics;
    const query = topicSearchQuery.toLowerCase();
    return aiTopics.map(chap => ({
      ...chap,
      materials: chap.materials.filter(m => m.title.toLowerCase().includes(query))
    })).filter(chap => chap.materials.length > 0 || chap.title.toLowerCase().includes(query));
  }, [aiTopics, topicSearchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue: any = value;

    if (name === 'meetingCount') {
      const num = parseInt(value);
      if (isNaN(num)) finalValue = 1;
      else if (num < 1) finalValue = 1;
      else if (num > 10) finalValue = 10;
      else finalValue = num;
    }

    if (name === 'chapter') {
      const matchedTopic = aiTopics.find(t => t.chapter.toLowerCase() === value.toLowerCase());
      if (matchedTopic && !state.formData.chapterTitle) {
        setState(prev => ({
          ...prev,
          formData: { 
            ...prev.formData, 
            chapter: value,
            chapterTitle: matchedTopic.title 
          }
        }));
        return;
      }
    }

    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, [name]: finalValue }
    }));
  };

  const toggleCheckbox = (type: 'pedagogy' | 'dimensions', value: any) => {
    setState(prev => {
      const current = [...prev.formData[type]];
      const index = current.indexOf(value);
      if (index > -1) current.splice(index, 1);
      else current.push(value);
      return { ...prev, formData: { ...prev.formData, [type]: current } };
    });
  };

  const handleTopicSelect = (material: string, meetings: number, chapter: string, chapterTitle: string) => {
    setState(prev => ({
      ...prev,
      formData: { 
        ...prev.formData, 
        material, 
        meetingCount: meetings,
        chapter,
        chapterTitle,
        cp: "", 
        tp: "" 
      }
    }));
    setTopicSearchQuery(material);
    setIsComboboxOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.formData.material) return;
    setState(prev => ({ ...prev, isGenerating: true, error: null }));
    try {
      const [content, imageUrl] = await Promise.all([
        generateRPMContent(state.formData),
        generateRPMImage(state.formData.material)
      ]);
      setState(prev => ({ ...prev, generatedContent: content, generatedImageUrl: imageUrl, isGenerating: false }));
    } catch (err) {
      setState(prev => ({ ...prev, isGenerating: false, error: "Gagal menghasilkan konten RPM." }));
    }
  };

  const handleSaveToLibrary = () => {
    if (!state.generatedContent || !state.formData.material) return;
    
    const newEntry: LibraryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      formData: state.formData,
      generatedContent: state.generatedContent,
      generatedImageUrl: state.generatedImageUrl,
      themeIndex: selectedThemeIndex !== null ? selectedThemeIndex : undefined
    };

    const newLibrary = [newEntry, ...library];
    setLibrary(newLibrary);
    localStorage.setItem('rpm_library', JSON.stringify(newLibrary));
    alert("RPM berhasil disimpan ke Pustaka!");
  };

  const handleLoadFromLibrary = (entry: LibraryEntry) => {
    setState(prev => ({
      ...prev,
      formData: entry.formData,
      generatedContent: entry.generatedContent,
      generatedImageUrl: entry.generatedImageUrl,
      error: null
    }));
    setSelectedThemeIndex(entry.themeIndex !== undefined ? entry.themeIndex : null);
    setTopicSearchQuery(entry.formData.material);
    setShowLibrary(false);
  };

  const handleDeleteFromLibrary = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus arsip RPM ini?")) {
      const newLibrary = library.filter(item => item.id !== id);
      setLibrary(newLibrary);
      localStorage.setItem('rpm_library', JSON.stringify(newLibrary));
    }
  };

  const handleGenProta = async () => {
    setIsGeneratingExtra(true);
    try {
      const data = await generateProta(state.formData.subject, state.formData.grade);
      setProtaData(data);
    } catch (e) { alert("Gagal"); }
    finally { setIsGeneratingExtra(false); }
  };

  const handleGenPromes = async () => {
    setIsGeneratingExtra(true);
    try {
      const data = await generatePromes(state.formData.subject, state.formData.grade, 2);
      setPromesData(data);
    } catch (e) { alert("Gagal"); }
    finally { setIsGeneratingExtra(false); }
  };

  const handleGenLKPD = async () => {
    if (!state.formData.material) {
      alert("Pilih materi terlebih dahulu!");
      return;
    }
    setIsGeneratingExtra(true);
    try {
      const data = await generateLKPD(state.formData.subject, state.formData.grade, state.formData.material);
      setLkpdData(data);
    } catch (e) { alert("Gagal menghasilkan LKPD."); }
    finally { setIsGeneratingExtra(false); }
  };

  const handleGenQuestions = async () => {
    if (!state.formData.material) {
      alert("Pilih materi terlebih dahulu!");
      return;
    }
    setIsGeneratingExtra(true);
    try {
      const data = await generateQuestionBank(state.formData.subject, state.formData.grade, state.formData.material);
      setQuestionsData(data);
    } catch (e) { alert("Gagal menghasilkan Bank Soal."); }
    finally { setIsGeneratingExtra(false); }
  };

  const handleBatchDownload = (type: 'pdf' | 'word') => {
    if (selectedLibraryIds.length === 0) {
      alert("Pilih minimal satu RPM untuk diekspor!");
      return;
    }
    
    // We'll use a temporary container for batch export
    const containerId = "batch-export-container";
    downloadDocument(containerId, `Batch_RPM_${new Date().getTime()}`, type);
  };

  const toggleLibrarySelection = (id: string) => {
    setSelectedLibraryIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllLibrary = () => {
    if (selectedLibraryIds.length === library.length) {
      setSelectedLibraryIds([]);
    } else {
      setSelectedLibraryIds(library.map(e => e.id));
    }
  };

  const resetForm = () => {
    if (confirm("Reset data form?")) {
      localStorage.removeItem('rpm_form_data');
      setState(prev => ({ ...prev, formData: INITIAL_FORM, generatedContent: null, generatedImageUrl: null }));
    }
  };

  const handleUpdateQuestion = (index: number, field: keyof FormativeQuestion | 'options', value: any, optionKey?: 'a' | 'b' | 'c' | 'd') => {
    if (!questionsData) return;
    const newQuestions = [...questionsData];
    if (field === 'options' && optionKey) {
      newQuestions[index].options = { ...newQuestions[index].options, [optionKey]: value };
    } else {
      (newQuestions[index] as any)[field] = value;
    }
    setQuestionsData(newQuestions);
  };

  const handleAddQuestion = () => {
    const newQuestion: FormativeQuestion = {
      question: "Tulis pertanyaan HOTS di sini...",
      options: { a: "Pilihan A", b: "Pilihan B", c: "Pilihan C", d: "Pilihan D" },
      answer: "a"
    };
    setQuestionsData(prev => prev ? [...prev, newQuestion] : [newQuestion]);
  };

  const handleDeleteQuestion = (index: number) => {
    if (confirm("Hapus soal ini?")) {
      setQuestionsData(prev => prev ? prev.filter((_, i) => i !== index) : null);
    }
  };

  const downloadDocument = (elementId: string, filename: string, type: 'pdf' | 'word' | 'preview') => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const opt = {
      margin: 0,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 3, 
        useCORS: true, 
        letterRendering: true,
        backgroundColor: '#ffffff',
        logging: false
      },
      jsPDF: { unit: 'mm', format: [215, 330], orientation: 'portrait', compress: true },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    if (type === 'preview') {
      html2pdf().from(element).set(opt).output('bloburl').then((url: string) => {
        window.open(url, '_blank');
      });
    } else if (type === 'pdf') {
      html2pdf().from(element).set(opt).save();
    } else {
      const activeThemeIndex = selectedThemeIndex !== null 
        ? selectedThemeIndex 
        : (SUBJECT_THEME_MAP[state.formData.subject] ?? 4);
      const docTheme = MEETING_THEMES[activeThemeIndex];

      const contentHtml = element.innerHTML;
      const htmlHeader = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Export Word</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
              <w:Compatibility>
                <w:BreakWrappedTables/>
                <w:SnapToGridInCell/>
                <w:WrapTextWithPunct/>
                <w:UseAsianBreakRules/>
                <w:DontGrowAutofit/>
              </w:Compatibility>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @font-face {
              font-family: 'Arial Narrow';
              panose-1: 2 11 5 6 2 2 2 3 2 4;
              mso-font-charset: 0;
              mso-generic-font-family: sans-serif;
              mso-font-pitch: variable;
              mso-font-signature: 647 0 0 0 159 0;
            }
            @page WordSection1 {
              size: 210mm 297mm;
              margin: 20mm;
              mso-header-margin: 35.4pt;
              mso-footer-margin: 35.4pt;
              mso-paper-source: 0;
            }
            div.WordSection1 {
              page: WordSection1;
            }
            body {
              font-family: 'Arial Narrow', Arial, sans-serif;
              font-size: 10pt;
              line-height: 1.0;
              mso-line-height-rule: exactly;
              color: black;
            }
            p, div, li {
              margin: 0in;
              margin-bottom: .0001pt;
              mso-pagination: widow-orphan;
              font-size: 10pt;
              font-family: 'Arial Narrow', Arial, sans-serif;
            }
            table {
              border-collapse: collapse;
              width: 100%;
              border: 1.5pt solid black;
              mso-border-alt: solid black 1.5pt;
              margin-bottom: 10pt;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
              mso-table-anchor-vertical: paragraph;
              mso-table-anchor-horizontal: column;
              mso-table-left: center;
              mso-padding-alt: 0in 5.4pt 0in 5.4pt;
            }
            td, th {
              border: 1pt solid black;
              mso-border-alt: solid black 1pt;
              padding: 4pt 6pt;
              vertical-align: top;
              font-size: 10pt;
              font-family: 'Arial Narrow', Arial, sans-serif;
            }
            .table-header-pink {
              background-color: ${docTheme.header} !important;
              font-weight: bold;
              text-align: center;
              mso-shading: ${docTheme.header};
              text-transform: uppercase;
            }
            .col-key {
              background-color: #f8fafc !important;
              font-weight: bold;
              mso-shading: #f8fafc;
              width: 120pt;
            }
            .text-center { text-align: center; }
            .text-justify { text-align: justify; }
            .font-bold { font-weight: bold; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .underline { text-decoration: underline; }
            .italic { font-style: italic; }
            .whitespace-pre-line { white-space: pre-line; }
            .leading-relaxed { line-height: 1.0; }
            .leading-none { line-height: 1.0; }
            
            /* Meeting Badge approximation */
            .meeting-badge {
              background-color: ${docTheme.accent};
              color: white;
              padding: 4pt 10pt;
              font-weight: bold;
              display: inline-block;
              mso-shading: ${docTheme.accent};
              border-radius: 4pt;
              font-size: 9pt;
            }
            
            /* Section Headers */
            .bg-\\[\\#fce4ec\\] {
              background-color: ${docTheme.header} !important;
              mso-shading: ${docTheme.header};
            }
            
            /* Page Break */
            .page-break { 
              page-break-before: always;
              mso-special-character: page-break;
            }

            /* HOTS Questions Styling */
            .bg-slate-50\\/30 { background-color: #f8fafc !important; mso-shading: #f8fafc; }
            .bg-indigo-600 { background-color: #4f46e5 !important; mso-shading: #4f46e5; }
            .bg-indigo-900 { background-color: #1e1b4b !important; mso-shading: #1e1b4b; }
            .bg-indigo-100 { background-color: #e0e7ff !important; mso-shading: #e0e7ff; }
            .bg-rose-100 { background-color: #ffe4e6 !important; mso-shading: #ffe4e6; }
            .text-white { color: white !important; }
            .text-indigo-600 { color: #4f46e5 !important; }
            .text-indigo-700 { color: #4338ca !important; }
            .text-indigo-900 { color: #1e1b4b !important; }
            .text-rose-700 { color: #be123c !important; }
            
            .rounded-3xl { border-radius: 15pt; }
            .rounded-2xl { border-radius: 10pt; }
            .rounded-full { border-radius: 50%; }
            
            .p-6 { padding: 15pt; }
            .p-10 { padding: 25pt; }
            .mb-8 { margin-bottom: 20pt; }
            .mb-10 { margin-bottom: 25pt; }
            .mt-10 { margin-top: 25pt; }
            .mt-16 { margin-top: 40pt; }
            
            /* Grid approximation for Word */
            .grid { display: block; }
            .grid-cols-5 > div { width: 18%; display: inline-block; margin: 1%; vertical-align: top; }
            .grid-cols-1.md\\:grid-cols-2 > div { width: 45%; display: inline-block; margin: 2%; vertical-align: top; }
            
            .flex { display: block; }
            .flex-col { display: block; }
            .items-center { vertical-align: middle; }
            .justify-center { text-align: center; }
            
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <div class='WordSection1'>
            ${contentHtml}
          </div>
        </body>
        </html>`;

      const blob = new Blob(['\ufeff', htmlHeader], { type: 'application/msword' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.doc`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <header className="bg-indigo-950 text-white py-5 px-6 no-print shadow-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-indigo-600/30 p-2.5 rounded-2xl border border-indigo-500/30 shadow-inner">
              <Sparkles className="text-yellow-400 drop-shadow-glow" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter leading-none uppercase">Generator RPM</h1>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Deep Learning Specialist</p>
            </div>
          </div>
          <div className="marquee-container flex-1 bg-black/40 rounded-2xl py-2.5 overflow-hidden border border-white/5 shadow-inner">
            <div className="animate-marquee inline-block whitespace-nowrap px-8">
              <span className="text-sm font-bold text-indigo-300 uppercase tracking-wide">
                SDN 14 LUBUAK TAROK • PERENCANAAN PEMBELAJARAN MENDALAM (DEEP LEARNING) KURIKULUM MERDEKA 2025 • ADMINISTRASI OTOMATIS GURU SD
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={resetForm} className="flex items-center gap-2 px-6 py-3 bg-rose-700/50 hover:bg-rose-600 rounded-2xl font-black text-xs transition-all border border-rose-500/30">
              <Trash2 size={16} /> RESET DATA
            </button>
            <button onClick={() => setShowLibrary(true)} className="flex items-center gap-2 px-8 py-3 bg-indigo-700 hover:bg-indigo-600 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 group">
              <Library size={18} className="group-hover:rotate-12 transition-transform" /> PUSTAKA ({library.length})
            </button>
          </div>
        </div>
      </header>

      {/* LIBRARY MODAL */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-indigo-950/80 backdrop-blur-md p-4 no-print"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white w-full max-w-6xl h-[85vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
             >
              <div className="bg-indigo-900 p-8 flex flex-col md:flex-row justify-between items-center text-white shrink-0 gap-6">
                  <div className="flex items-center gap-4">
                     <Library size={32} className="text-indigo-300"/>
                     <div>
                       <h3 className="text-2xl font-black uppercase tracking-tight">Pustaka RPM Tersimpan</h3>
                       <p className="text-indigo-300 text-xs">Arsip Perencanaan Pembelajaran SDN 14 Lubuak Tarok</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {library.length > 0 && (
                      <div className="flex bg-white/10 p-1 rounded-2xl border border-white/10">
                        <button 
                          onClick={selectAllLibrary}
                          className="px-4 py-2 text-[10px] font-black uppercase hover:bg-white/10 rounded-xl transition-colors"
                        >
                          {selectedLibraryIds.length === library.length ? "Batal Semua" : "Pilih Semua"}
                        </button>
                        <div className="w-px bg-white/10 mx-1 my-2"></div>
                        <button 
                          onClick={() => handleBatchDownload('word')}
                          disabled={selectedLibraryIds.length === 0}
                          className="px-4 py-2 text-[10px] font-black uppercase hover:bg-blue-500 rounded-xl transition-colors disabled:opacity-30 flex items-center gap-2"
                        >
                          <Download size={12}/> Word ({selectedLibraryIds.length})
                        </button>
                        <button 
                          onClick={() => handleBatchDownload('pdf')}
                          disabled={selectedLibraryIds.length === 0}
                          className="px-4 py-2 text-[10px] font-black uppercase hover:bg-rose-500 rounded-xl transition-colors disabled:opacity-30 flex items-center gap-2"
                        >
                          <FileDown size={12}/> PDF ({selectedLibraryIds.length})
                        </button>
                      </div>
                    )}
                    <button onClick={() => setShowLibrary(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white font-bold text-xs uppercase px-6">
                      Tutup
                    </button>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-10 bg-slate-50 custom-scrollbar">
                 {library.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {library.map((entry) => {
                        const isSelected = selectedLibraryIds.includes(entry.id);
                        const entryTheme = entry.themeIndex !== undefined 
                          ? MEETING_THEMES[entry.themeIndex % MEETING_THEMES.length] 
                          : MEETING_THEMES[(SUBJECT_THEME_MAP[entry.formData.subject] ?? 4) % MEETING_THEMES.length];
                        
                        return (
                          <div 
                            key={entry.id} 
                            onClick={() => toggleLibrarySelection(entry.id)}
                            className={`bg-white p-6 rounded-3xl border-2 transition-all group relative overflow-hidden cursor-pointer ${isSelected ? 'border-indigo-600 shadow-indigo-100 shadow-xl' : 'border-slate-200 shadow-md hover:shadow-lg'}`}
                          >
                             <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: entryTheme.accent }}></div>
                             <div className="absolute top-4 right-4 z-20">
                               {isSelected ? (
                                 <CheckSquare className="text-indigo-600" size={24} />
                               ) : (
                                 <Square className="text-slate-200 group-hover:text-slate-300" size={24} />
                               )}
                             </div>
                             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <BookMarked className="text-indigo-900 transform rotate-12 scale-150" size={80} />
                             </div>
                             <div className="relative z-10 pl-2">
                                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase mb-3" style={{ backgroundColor: entryTheme.header, color: entryTheme.text }}>
                                  {entry.formData.grade} • {entry.formData.subject}
                                </span>
                                <h4 className="font-bold text-lg text-slate-800 mb-2 leading-tight line-clamp-2 h-14">{entry.formData.material}</h4>
                                <p className="text-slate-400 text-xs mb-6 flex items-center gap-2">
                                  <Clock size={12} /> Disimpan: {entry.timestamp}
                                </p>
                                
                                <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
                                   <button onClick={() => handleLoadFromLibrary(entry)} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-indigo-700 flex items-center justify-center gap-2">
                                     <FolderOpen size={14} /> BUKA
                                   </button>
                                   <button onClick={() => handleDeleteFromLibrary(entry.id)} className="px-4 bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-colors">
                                     <Trash2 size={16} />
                                   </button>
                                </div>
                             </div>
                          </div>
                        );
                      })}
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center h-full opacity-50">
                      <Library size={64} className="mb-4 text-slate-400" />
                      <p className="font-bold text-slate-500">Belum ada RPM yang disimpan.</p>
                   </div>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODALS for PROTA/PROMES/LKPD/QUESTIONS */}
      <AnimatePresence>
        {(protaData || promesData || lkpdData || questionsData) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-indigo-950/80 backdrop-blur-md p-4 no-print"
          >
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
             >
            <div className="bg-indigo-900 p-8 flex justify-between items-center text-white">
               <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                 {protaData && <><ClipboardList size={28} /> Program Tahunan</>}
                 {promesData && <><Calendar size={28} /> Program Semester</>}
                 {lkpdData && <><BookOpen size={28} /> Lembar Kerja Peserta Didik</>}
                 {questionsData && <><FileQuestion size={28} /> Bank Soal HOTS</>}
               </h3>
               <button onClick={() => { setProtaData(null); setPromesData(null); setLkpdData(null); setQuestionsData(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors"><Trash2 size={24} /></button>
            </div>
            <div className="flex-1 overflow-auto p-10 bg-slate-100">
               <div id="extra-print-area" className="bg-white p-12 shadow-md border border-slate-200 mx-auto max-w-[210mm]">
                  {protaData && (
                    <>
                      <h2 className="text-center text-xl font-bold underline mb-8 uppercase">PROGRAM TAHUNAN (PROTA) 2025/2026</h2>
                      <table className="table-spreadsheet">
                        <thead><tr className="table-header-pink"><th className="text-center">No</th><th className="text-center">Semester</th><th>Materi Pokok</th><th className="text-center">Alokasi JP</th></tr></thead>
                        <tbody>{protaData.map((item, idx) => (
                          <tr key={idx}><td className="text-center font-bold">{idx + 1}</td><td className="text-center">SMT {item.semester}</td><td>{item.material}</td><td className="text-center">{item.hours} JP</td></tr>
                        ))}</tbody>
                      </table>
                    </>
                  )}
                  {promesData && (
                    <>
                      <h2 className="text-center text-xl font-bold underline mb-8 uppercase">PROGRAM SEMESTER (PROMES) GENAP 2026</h2>
                      <table className="table-spreadsheet">
                        <thead>
                          <tr className="bg-indigo-900 text-white text-center">
                            <th rowSpan={2} className="w-[40px]">No</th><th rowSpan={2}>Materi Pokok</th><th rowSpan={2} className="w-[60px]">JP</th>
                            {SEMESTER_2_MONTHS.map(m => <th key={m.code} colSpan={4}>{m.name}</th>)}
                          </tr>
                          <tr className="bg-indigo-800 text-white text-[8pt] text-center">
                            {SEMESTER_2_MONTHS.map(m => <React.Fragment key={m.code}><th>1</th><th>2</th><th>3</th><th>4</th></React.Fragment>)}
                          </tr>
                        </thead>
                        <tbody>{promesData.map((item, idx) => (
                          <tr key={idx}><td className="text-center font-bold">{idx + 1}</td><td>{item.material}</td><td className="text-center">{item.hours}</td>
                            {SEMESTER_2_MONTHS.map(m => <React.Fragment key={m.code}>{[1,2,3,4].map(w => (
                              <td key={w} className="text-center">{item.weeks.some(sw => sw.includes(m.code) && sw.includes(w.toString())) ? '●' : ''}</td>
                            ))}</React.Fragment>)}
                          </tr>
                        ))}</tbody>
                      </table>
                    </>
                  )}
                  {lkpdData && (
                    <div className="f4-page">
                      <h2 className="text-center text-xl font-bold underline mb-8 uppercase">{lkpdData.title}</h2>
                      
                      <table className="table-spreadsheet mb-8">
                        <tbody>
                          <tr><td className="col-key">Nama Siswa</td><td className="border-b border-dashed">................................................</td></tr>
                          <tr><td className="col-key">Kelas / No. Absen</td><td className="border-b border-dashed">................................................</td></tr>
                          <tr><td className="col-key">Mata Pelajaran</td><td>{state.formData.subject}</td></tr>
                          <tr><td className="col-key">Topik</td><td className="font-bold">{state.formData.material}</td></tr>
                        </tbody>
                      </table>

                      <div className="mb-6">
                        <h4 className="font-bold underline mb-2">A. Tujuan Pembelajaran:</h4>
                        <p className="text-sm italic">{lkpdData.objective}</p>
                      </div>

                      <div className="mb-8">
                        <h4 className="font-bold underline mb-2">B. Petunjuk Pengerjaan:</h4>
                        <ul className="list-disc ml-6 text-sm">
                          {lkpdData.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                        </ul>
                      </div>

                      <h4 className="font-bold underline mb-4">C. Aktivitas Eksplorasi:</h4>
                      <table className="table-spreadsheet">
                        <thead className="table-header-pink">
                          <tr>
                            <th className="text-center" style={{width: '40px'}}>No</th>
                            <th className="text-center" style={{width: '35%'}}>Aktivitas / Pertanyaan</th>
                            <th className="text-center">Hasil Eksplorasi / Jawaban Siswa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lkpdData.tasks.map((task, idx) => (
                            <tr key={idx}>
                              <td className="text-center font-bold" style={{verticalAlign: 'middle'}}>{task.no}</td>
                              <td className="p-4 bg-slate-50/50">
                                <p className="font-bold text-sm mb-2">{task.activity}</p>
                                <p className="text-[10px] text-slate-600 leading-tight italic">{task.instruction}</p>
                              </td>
                              <td className="h-32" style={{backgroundColor: '#fff'}}></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="mt-12 text-[10px] text-slate-400 italic text-right">
                        Dicetak otomatis oleh Generator RPM SDN 14 Lubuak Tarok - Deep Learning Kurikulum Merdeka
                      </div>
                    </div>
                  )}
                  {questionsData && (
                    <div className="f4-page">
                       <div className="text-center mb-6 border-b-4 border-double border-black pb-4">
                          <h2 className="text-xl font-black uppercase tracking-wide">PENILAIAN HARIAN (FORMATIF)</h2>
                          <h3 className="text-lg font-bold uppercase tracking-wider">{state.formData.schoolName}</h3>
                          <p className="text-sm font-bold mt-1">TAHUN PELAJARAN {state.formData.academicYear}</p>
                       </div>

                       <table className="table-spreadsheet mb-6">
                        <tbody>
                          <tr><td className="col-key">Mata Pelajaran</td><td>: {state.formData.subject}</td><td className="col-key">Hari / Tanggal</td><td>: ...................................</td></tr>
                          <tr><td className="col-key">Kelas / Semester</td><td>: {state.formData.grade} / 2 (Genap)</td><td className="col-key">Waktu</td><td>: 60 Menit</td></tr>
                          <tr><td className="col-key">Materi Pokok</td><td colSpan={3}>: {state.formData.material}</td></tr>
                        </tbody>
                      </table>

                      <div className="mb-6 border-b-2 border-black pb-2">
                        <p className="font-bold text-sm uppercase mb-1">Petunjuk Umum:</p>
                        <ul className="list-decimal ml-5 text-sm space-y-1">
                          <li>Berdoalah sebelum mengerjakan soal.</li>
                          <li>Tulis identitas pada lembar jawaban yang tersedia.</li>
                          <li>Pilihlah satu jawaban yang paling benar dengan memberikan tanda silang (X) pada huruf A, B, C, atau D.</li>
                        </ul>
                      </div>
                      
                      <table style={{width: '100%', border: 'none', borderCollapse: 'collapse'}}>
                        <tbody>
                          {questionsData.map((q, idx) => (
                            <tr key={idx} style={{pageBreakInside: 'avoid'}}>
                              <td style={{width: '30px', verticalAlign: 'top', paddingBottom: '12pt', border: 'none', fontWeight: 'bold'}}>{idx + 1}.</td>
                              <td style={{verticalAlign: 'top', paddingBottom: '12pt', border: 'none'}}>
                                  <div style={{textAlign: 'justify', marginBottom: '4pt'}}>{q.question}</div>
                                  <table style={{width: '100%', border: 'none', borderCollapse: 'collapse'}}>
                                      <tbody>
                                        <tr>
                                          <td style={{width: '25px', verticalAlign: 'top', border: 'none', padding: '0'}}>a.</td>
                                          <td style={{width: '45%', verticalAlign: 'top', border: 'none', padding: '0'}}>{q.options.a}</td>
                                          <td style={{width: '25px', verticalAlign: 'top', border: 'none', padding: '0'}}>c.</td>
                                          <td style={{width: '45%', verticalAlign: 'top', border: 'none', padding: '0'}}>{q.options.c}</td>
                                        </tr>
                                        <tr>
                                          <td style={{width: '25px', verticalAlign: 'top', border: 'none', padding: '0'}}>b.</td>
                                          <td style={{width: '45%', verticalAlign: 'top', border: 'none', padding: '0'}}>{q.options.b}</td>
                                          <td style={{width: '25px', verticalAlign: 'top', border: 'none', padding: '0'}}>d.</td>
                                          <td style={{width: '45%', verticalAlign: 'top', border: 'none', padding: '0'}}>{q.options.d}</td>
                                        </tr>
                                      </tbody>
                                  </table>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="page-break"></div>
                      
                      <div className="text-center mb-8 border-b-2 border-black pb-4 pt-4">
                          <h2 className="text-xl font-black uppercase">KUNCI JAWABAN</h2>
                          <p className="text-sm">Bank Soal Formatif - {state.formData.subject} - {state.formData.material}</p>
                       </div>

                      <table className="table-spreadsheet" style={{textAlign: 'center'}}>
                        <thead>
                           <tr className="table-header-pink">
                             <th className="text-center w-12">No</th>
                             <th className="text-center w-24">Jawaban</th>
                             <th className="text-center w-12">No</th>
                             <th className="text-center w-24">Jawaban</th>
                             <th className="text-center w-12">No</th>
                             <th className="text-center w-24">Jawaban</th>
                             <th className="text-center w-12">No</th>
                             <th className="text-center w-24">Jawaban</th>
                             <th className="text-center w-12">No</th>
                             <th className="text-center w-24">Jawaban</th>
                           </tr>
                        </thead>
                        <tbody>
                             {Array.from({length: 5}).map((_, rowIndex) => (
                               <tr key={rowIndex}>
                                 <td className="text-center font-bold bg-slate-50">{rowIndex + 1}</td>
                                 <td className="text-center font-black text-lg">{questionsData[rowIndex]?.answer.toUpperCase()}</td>
                                 <td className="text-center font-bold bg-slate-50">{rowIndex + 6}</td>
                                 <td className="text-center font-black text-lg">{questionsData[rowIndex + 5]?.answer.toUpperCase()}</td>
                                 <td className="text-center font-bold bg-slate-50">{rowIndex + 11}</td>
                                 <td className="text-center font-black text-lg">{questionsData[rowIndex + 10]?.answer.toUpperCase()}</td>
                                 <td className="text-center font-bold bg-slate-50">{rowIndex + 16}</td>
                                 <td className="text-center font-black text-lg">{questionsData[rowIndex + 15]?.answer.toUpperCase()}</td>
                                 <td className="text-center font-bold bg-slate-50">{rowIndex + 21}</td>
                                 <td className="text-center font-black text-lg">{questionsData[rowIndex + 20]?.answer.toUpperCase()}</td>
                               </tr>
                             ))}
                        </tbody>
                      </table>

                      <div className="mt-8 border-2 border-black p-4 bg-slate-50">
                         <h4 className="font-bold underline mb-2">Pedoman Penilaian:</h4>
                         <p className="text-sm mb-1">Setiap jawaban benar mendapat skor 4.</p>
                         <p className="text-sm font-bold">Nilai Akhir = (Jumlah Jawaban Benar x 4)</p>
                         <p className="text-sm mt-2 italic">Contoh: Benar 20 soal x 4 = Nilai 80</p>
                      </div>
                    </div>
                  )}
               </div>
            </div>
            <div className="p-8 border-t bg-white flex justify-end gap-4">
               <button onClick={() => downloadDocument('extra-print-area', lkpdData ? 'LKPD' : (questionsData ? 'BankSoal' : 'Administrasi'), 'word')} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2"><Download size={16}/> WORD</button>
               <button onClick={() => downloadDocument('extra-print-area', lkpdData ? 'LKPD' : (questionsData ? 'BankSoal' : 'Administrasi'), 'pdf')} className="bg-rose-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg flex items-center gap-2"><Printer size={16}/> PDF</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      <div className="no-print mx-auto max-w-[1700px] w-full px-6 mt-4">
        <div className="marquee-container bg-red-600 rounded-2xl py-3 border-4 border-white shadow-2xl overflow-hidden">
          <div className="animate-marquee inline-block whitespace-nowrap px-8">
            <span className="text-lg font-black text-white uppercase tracking-[0.2em] drop-shadow-md">
              okok sabatang, adm siap....nan ibuk-ibuk walid bulie isok okok lo sambie kojo
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-[1700px] mx-auto w-full px-6 mt-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <section className="lg:col-span-4 xl:col-span-4 no-print space-y-8 pb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden sticky top-32"
          >
            <div className="bg-indigo-800 px-10 py-8 border-b border-indigo-900/10 flex justify-between items-center">
              <h2 className="text-xl font-black text-white uppercase flex items-center gap-3">
                <PenTool size={24} className="text-indigo-300" /> Input Data RPM
              </h2>
              {isGeneratingExtra && <Loader2 className="animate-spin text-white" size={20}/>}
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
              {/* SECTION 1: IDENTITAS GURU & SEKOLAH */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all">
                <button 
                  type="button"
                  onClick={() => setActiveSection(activeSection === "identitas" ? "" : "identitas")}
                  className={`w-full px-6 py-5 flex items-center justify-between transition-colors ${activeSection === "identitas" ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  <div className="flex items-center gap-3">
                    <UserCircle size={20} className={activeSection === "identitas" ? "text-indigo-600" : "text-slate-400"} />
                    <span className="font-black text-xs uppercase tracking-wider">Identitas Guru & Sekolah</span>
                  </div>
                  <ChevronDown size={18} className={`transition-transform duration-300 ${activeSection === "identitas" ? "rotate-180" : ""}`} />
                </button>
                
                {activeSection === "identitas" && (
                  <div className="p-6 space-y-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Nama Sekolah</label>
                        <input type="text" name="schoolName" value={state.formData.schoolName} onChange={handleInputChange} className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold text-sm bg-slate-50 focus:border-indigo-500 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Mata Pelajaran</label>
                          <select name="subject" value={state.formData.subject} onChange={handleInputChange} className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold text-sm bg-slate-50 focus:border-indigo-500 outline-none">
                            {SD_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Kelas</label>
                          <select name="grade" value={state.formData.grade} onChange={handleInputChange} className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold text-sm bg-slate-50 focus:border-indigo-500 outline-none">
                            {SD_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Nama Guru</label>
                          <input type="text" name="teacherName" value={state.formData.teacherName} onChange={handleInputChange} className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold text-sm bg-slate-50 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">NIP Guru</label>
                          <input type="text" name="teacherNip" value={state.formData.teacherNip} onChange={handleInputChange} className="w-full p-4 border-2 border-slate-200 rounded-2xl text-sm bg-slate-50 focus:border-indigo-500 outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Kepala Sekolah</label>
                          <input type="text" name="principalName" value={state.formData.principalName} onChange={handleInputChange} className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold text-sm bg-slate-50 focus:border-indigo-500 outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">NIP Kepala Sekolah</label>
                          <input type="text" name="principalNip" value={state.formData.principalNip} onChange={handleInputChange} className="w-full p-4 border-2 border-slate-200 rounded-2xl text-sm bg-slate-50 focus:border-indigo-500 outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: TOPIK & MATERI */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all">
                <button 
                  type="button"
                  onClick={() => setActiveSection(activeSection === "topik" ? "" : "topik")}
                  className={`w-full px-6 py-5 flex items-center justify-between transition-colors ${activeSection === "topik" ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  <div className="flex items-center gap-3">
                    <BookMarked size={20} className={activeSection === "topik" ? "text-indigo-600" : "text-slate-400"} />
                    <span className="font-black text-xs uppercase tracking-wider">Topik & Materi Pokok</span>
                  </div>
                  <ChevronDown size={18} className={`transition-transform duration-300 ${activeSection === "topik" ? "rotate-180" : ""}`} />
                </button>

                {activeSection === "topik" && (
                  <div className="p-6 space-y-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4" ref={comboboxRef}>
                      <label className="text-[10px] font-black text-indigo-700 uppercase flex items-center gap-2">
                        Pilih Bab & Materi Pokok {isFetchingTopics && <Loader2 className="animate-spin" size={12}/>}
                      </label>
                      <div className="relative">
                          <div className="flex items-center border-2 border-indigo-200 rounded-2xl bg-indigo-50/30 overflow-hidden focus-within:border-indigo-500 transition-all shadow-sm">
                             <Search className="ml-4 text-indigo-400" size={18} />
                             <input 
                               type="text" placeholder="Cari materi pokok..." 
                               value={topicSearchQuery}
                               onChange={(e) => { setTopicSearchQuery(e.target.value); setIsComboboxOpen(true); }}
                               onFocus={() => setIsComboboxOpen(true)}
                               className="flex-1 p-4 font-bold outline-none bg-transparent text-sm"
                             />
                          </div>
                          {isComboboxOpen && (
                            <div className="absolute z-[60] left-0 right-0 mt-3 bg-white border-2 border-indigo-200 rounded-3xl shadow-2xl max-h-[300px] overflow-y-auto custom-scrollbar">
                              {filteredTopics.length > 0 ? filteredTopics.map((chap, i) => (
                                <div key={i} className="border-b border-indigo-50 last:border-0">
                                   <div className="bg-indigo-900/5 px-6 py-3 font-black text-indigo-900 text-[10px] uppercase flex items-center gap-2">
                                      <BookMarked size={12}/> {chap.chapter}: {chap.title}
                                   </div>
                                   <div className="py-1">
                                     {chap.materials.map((mat, j) => (
                                       <div 
                                         key={j} 
                                         onClick={() => handleTopicSelect(mat.title, mat.meetings, chap.chapter, chap.title)}
                                         className="px-8 py-3 hover:bg-indigo-50 cursor-pointer text-xs font-bold text-slate-700 flex items-center justify-between gap-3 transition-colors group"
                                       >
                                         <div className="flex items-center gap-3">
                                            <FileText size={14} className="text-slate-400 group-hover:text-indigo-500" /> 
                                            {mat.title}
                                         </div>
                                         <span className="text-[9px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold group-hover:bg-indigo-100 group-hover:text-indigo-700">
                                            {mat.meetings} JP
                                         </span>
                                       </div>
                                     ))}
                                   </div>
                                </div>
                              )) : (
                                <div className="p-10 text-center space-y-4">
                                   <p className="text-xs font-bold text-slate-400 uppercase">Materi tidak ditemukan</p>
                                   <button type="button" onClick={handleGenerateNewTopics} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase shadow-md">Buat Rincian Khusus</button>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Bab / Unit</label>
                        <input type="text" name="chapter" value={state.formData.chapter} onChange={handleInputChange} className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:border-indigo-500 outline-none text-sm" placeholder="Contoh: Bab 1" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Judul Bab</label>
                        <input type="text" name="chapterTitle" value={state.formData.chapterTitle} onChange={handleInputChange} className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:border-indigo-500 outline-none text-sm" placeholder="Judul Bab" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Jml Pertemuan</label>
                        <div className="relative">
                          <input type="number" name="meetingCount" value={state.formData.meetingCount} onChange={handleInputChange} className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:border-indigo-500 outline-none pl-10 text-sm" min="1" max="10"/>
                          <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Alokasi Waktu</label>
                        <div className="relative">
                          <input type="text" name="duration" value={state.formData.duration} onChange={handleInputChange} placeholder="2 x 35 menit" className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold bg-slate-50 focus:border-indigo-500 outline-none pl-10 text-sm"/>
                          <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <button type="button" onClick={handleGenProta} disabled={isGeneratingExtra} className="py-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl font-black text-[10px] flex flex-col items-center justify-center gap-1 hover:bg-amber-100 transition-colors shadow-sm disabled:opacity-50">
                        {isGeneratingExtra ? <Loader2 className="animate-spin" size={20}/> : <ClipboardList size={20}/>} PROTA
                      </button>
                      <button type="button" onClick={handleGenPromes} disabled={isGeneratingExtra} className="py-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl font-black text-[10px] flex flex-col items-center justify-center gap-1 hover:bg-emerald-100 transition-colors shadow-sm disabled:opacity-50">
                        {isGeneratingExtra ? <Loader2 className="animate-spin" size={20}/> : <Calendar size={20}/>} PROMES
                      </button>
                      <button type="button" onClick={handleGenLKPD} disabled={isGeneratingExtra} className="py-4 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-2xl font-black text-[10px] flex flex-col items-center justify-center gap-1 hover:bg-indigo-100 transition-colors shadow-sm disabled:opacity-50">
                        {isGeneratingExtra ? <Loader2 className="animate-spin" size={20}/> : <BookOpen size={20}/>} LKPD
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: DESAIN PEMBELAJARAN */}
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm transition-all">
                <button 
                  type="button"
                  onClick={() => setActiveSection(activeSection === "desain" ? "" : "desain")}
                  className={`w-full px-6 py-5 flex items-center justify-between transition-colors ${activeSection === "desain" ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-700"}`}
                >
                  <div className="flex items-center gap-3">
                    <Layout size={20} className={activeSection === "desain" ? "text-indigo-600" : "text-slate-400"} />
                    <span className="font-black text-xs uppercase tracking-wider">Desain Pembelajaran</span>
                  </div>
                  <ChevronDown size={18} className={`transition-transform duration-300 ${activeSection === "desain" ? "rotate-180" : ""}`} />
                </button>

                {activeSection === "desain" && (
                  <div className="p-6 space-y-6 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
                    {state.isPrefilling ? (
                      <div className="p-10 bg-indigo-50 rounded-3xl text-center border-2 border-indigo-100 animate-pulse">
                        <Loader2 className="animate-spin mx-auto text-indigo-600 mb-4" size={32} />
                        <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest leading-relaxed">Menyelaraskan dengan Capaian Pembelajaran...</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Capaian Pembelajaran (CP)</label>
                          <textarea name="cp" value={state.formData.cp} onChange={handleInputChange} className="w-full p-4 border-2 border-slate-200 rounded-2xl text-xs h-24 bg-slate-50 resize-none focus:border-indigo-500 outline-none"></textarea>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Tujuan Pembelajaran (TP)</label>
                          <textarea name="tp" value={state.formData.tp} onChange={handleInputChange} className="w-full p-4 border-2 border-slate-200 rounded-2xl text-xs h-24 bg-slate-50 resize-none focus:border-indigo-500 outline-none"></textarea>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase block">Praktik Pedagogis</label>
                          <div className="grid grid-cols-1 gap-2">
                            {Object.values(PedagogicalPractice).map(p => (
                              <button key={p} type="button" onClick={() => toggleCheckbox('pedagogy', p)} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left text-[10px] font-bold ${state.formData.pedagogy.includes(p) ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                                {state.formData.pedagogy.includes(p) ? <CheckSquare size={14} className="shrink-0" /> : <Square size={14} className="shrink-0" />} {p}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase block">Profil Pelajar Pancasila</label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.values(GraduateDimension).map(d => (
                              <button key={d} type="button" onClick={() => toggleCheckbox('dimensions', d)} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left text-[9px] font-bold ${state.formData.dimensions.includes(d) ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                                {state.formData.dimensions.includes(d) ? <CheckSquare size={12} className="shrink-0" /> : <Square size={12} className="shrink-0" />} {d}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-3">
                <motion.button 
                  type="submit" 
                  disabled={state.isGenerating || !state.formData.material} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-6 bg-indigo-700 text-white rounded-[2rem] font-black text-lg shadow-2xl hover:bg-indigo-800 disabled:bg-slate-300 transition-all relative overflow-hidden group"
                >
                  <span className="relative z-10">{state.isGenerating ? <Loader2 className="animate-spin mx-auto" size={28} /> : "HASILKAN RPM LENGKAP"}</span>
                  <motion.div 
                    className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={false}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </motion.button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={handleGenQuestions} 
                    disabled={state.isGenerating || isGeneratingExtra || !state.formData.material} 
                    className="py-4 bg-teal-600 text-white rounded-[1.5rem] font-black text-[10px] shadow-xl hover:bg-teal-700 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {isGeneratingExtra ? <Loader2 className="animate-spin" size={18} /> : <><FileQuestion size={18}/> GENERATE SOAL</>}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowQuestionEditor(true)}
                    disabled={state.isGenerating || isGeneratingExtra}
                    className="py-4 bg-slate-800 text-white rounded-[1.5rem] font-black text-[10px] shadow-xl hover:bg-slate-900 disabled:bg-slate-300 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <PenTool size={18}/> KUSTOMISASI SOAL
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </section>

        <section className="lg:col-span-8 xl:col-span-8 space-y-10">
          <AnimatePresence mode="wait">
            {state.generatedContent ? (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-wrap items-center justify-between p-8 bg-indigo-950 rounded-[3rem] shadow-2xl border border-white/10 gap-6 no-print">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/20 p-3 rounded-2xl border border-emerald-500/30">
                    <CheckCircle2 className="text-emerald-400" size={32}/>
                  </div>
                  <div>
                    <span className="text-white font-black text-xl block">RPM Berhasil Dibuat</span>
                    <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">Otomatis & Terstruktur</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleSaveToLibrary} className="bg-white/10 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/20"><Save size={18} /> SIMPAN</button>
                  <button onClick={() => downloadDocument('rpm-document-content', 'RPM_' + state.formData.material, 'pdf')} className="bg-rose-600 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 hover:bg-rose-500"><FileDown size={18} /> PDF</button>
                  <button onClick={() => downloadDocument('rpm-document-content', 'RPM_' + state.formData.material, 'word')} className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 hover:bg-blue-500"><Download size={18} /> WORD</button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 p-6 bg-indigo-950 rounded-[2rem] border border-white/10 no-print">
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mr-2">Tema Dokumen:</span>
                {MEETING_THEMES.map((theme, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedThemeIndex(idx)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${selectedThemeIndex === idx ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    style={{ backgroundColor: theme.accent }}
                    title={theme.name}
                  />
                ))}
                <button
                  onClick={() => setSelectedThemeIndex(null)}
                  className={`ml-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${selectedThemeIndex === null ? 'bg-white text-indigo-950 border-white' : 'bg-transparent text-white border-white/20 opacity-50'}`}
                >
                  Otomatis (Mapel)
                </button>
              </div>

              <div className="f4-preview-wrapper shadow-2xl rounded-[3rem] p-12 bg-slate-300/50">
                <div id="rpm-page-container" className="f4-page-container">
                  <RPMDocument 
                    id="rpm-document-content"
                    entry={{
                      id: 'current',
                      timestamp: new Date().toLocaleString(),
                      formData: state.formData,
                      generatedContent: state.generatedContent,
                      generatedImageUrl: state.generatedImageUrl
                    }} 
                    themeIndex={selectedThemeIndex !== null ? selectedThemeIndex : undefined}
                  />
                </div>
              </div>
            </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full min-h-[600px] text-center p-12 bg-white rounded-[3rem] shadow-xl border-2 border-dashed border-slate-200"
              >
                 <div className="bg-indigo-50 p-8 rounded-[3rem] mb-8 animate-bounce">
                   <Layout className="text-indigo-600" size={80} strokeWidth={1}/>
                 </div>
                 <h3 className="text-3xl font-black text-slate-800 mb-4">Belum Ada RPM</h3>
                 <p className="text-slate-500 max-w-lg mx-auto text-lg">Pilih materi pokok kurikulum merdeka semester 2 di sebelah kiri untuk memulai.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
      {/* BATCH EXPORT CONTAINER (HIDDEN) */}
      <div id="batch-export-container" className="fixed -left-[10000px] top-0 w-[210mm] bg-white">
         {library.filter(e => selectedLibraryIds.includes(e.id)).map((entry, idx) => (
           <div key={entry.id} className={idx > 0 ? "page-break" : ""}>
              <RPMDocument entry={entry} themeIndex={entry.themeIndex} />
           </div>
         ))}
      </div>

      {/* QUESTION EDITOR MODAL */}
      <AnimatePresence>
        {showQuestionEditor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-indigo-950/90 backdrop-blur-xl p-4 no-print"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-5xl h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="bg-slate-900 p-8 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-500 p-3 rounded-2xl">
                    <PenTool size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Kustomisasi Soal HOTS</h3>
                    <p className="text-slate-400 text-xs">Edit, Tambah, atau Hapus Soal secara Manual</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleAddQuestion}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 transition-colors"
                  >
                    <Plus size={16} /> TAMBAH SOAL
                  </button>
                  <button 
                    onClick={() => setShowQuestionEditor(false)}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-2xl font-black text-xs transition-colors"
                  >
                    SELESAI
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-slate-50 custom-scrollbar">
                {questionsData && questionsData.length > 0 ? (
                  <div className="space-y-6">
                    {questionsData.map((q, idx) => (
                      <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative group">
                        <button 
                          onClick={() => handleDeleteQuestion(idx)}
                          className="absolute top-6 right-6 p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={20} />
                        </button>
                        
                        <div className="flex gap-6">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 space-y-6">
                            <div>
                              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Pertanyaan</label>
                              <textarea 
                                value={q.question}
                                onChange={(e) => handleUpdateQuestion(idx, 'question', e.target.value)}
                                className="w-full p-4 border-2 border-slate-100 rounded-2xl text-sm font-bold bg-slate-50 focus:border-indigo-500 outline-none min-h-[100px]"
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                                <div key={opt}>
                                  <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block flex items-center gap-2">
                                    Opsi {opt.toUpperCase()}
                                    {q.answer === opt && <span className="text-emerald-500 font-black text-[8px] bg-emerald-50 px-2 py-0.5 rounded-full">KUNCI JAWABAN</span>}
                                  </label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text"
                                      value={q.options[opt]}
                                      onChange={(e) => handleUpdateQuestion(idx, 'options', e.target.value, opt)}
                                      className="flex-1 p-3 border-2 border-slate-100 rounded-xl text-xs bg-slate-50 focus:border-indigo-500 outline-none"
                                    />
                                    <button 
                                      onClick={() => handleUpdateQuestion(idx, 'answer', opt)}
                                      className={`px-4 rounded-xl font-black text-[10px] transition-all ${q.answer === opt ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                    >
                                      SET KUNCI
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <FileQuestion size={80} className="text-slate-300 mb-6" />
                    <h4 className="text-xl font-black text-slate-400 uppercase">Belum Ada Soal</h4>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2">Gunakan tombol Generate atau Tambah Soal secara manual untuk memulai.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {(state.isGenerating || isGeneratingExtra) && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-indigo-950/90 backdrop-blur-xl text-white p-10">
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
            <Loader2 className="animate-spin text-indigo-400 relative z-10" size={100} strokeWidth={1.5} />
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 animate-bounce text-center">
            {state.isGenerating ? "Membangun RPM..." : "Menyiapkan Administrasi..."}
          </h2>
          <p className="text-indigo-300 font-bold uppercase tracking-widest text-sm text-center max-w-md leading-relaxed">
            {state.isGenerating 
              ? "Kecerdasan Buatan sedang merancang pembelajaran mendalam yang bermakna untuk siswa Anda. Mohon tunggu sejenak."
              : "Sedang menyusun dokumen administrasi guru (Prota/Promes/LKPD/Soal) secara otomatis. Harap bersabar."}
          </p>
        </div>
      )}
    </div>
  );
}

