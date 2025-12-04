import React, { useState, useRef, useEffect } from 'react';
import { 
  Leaf, 
  ChevronRight, 
  ChevronLeft,
  Utensils, 
  Building, 
  Car, 
  Plane,
  Shirt,
  Smartphone,
  CreditCard,
  Trash2,
  Recycle,
  UserCircle,
  Download,
  Globe,
  Zap,
  HelpCircle,
  MapPin,
  Package,
  BrickWall,
  Users,
  Lightbulb,
  Bus,
  Beef,
  Info,
  MousePointerClick,
  X,
  FileText,
  Edit3,
  Printer,
  Smartphone as PhoneIcon
} from 'lucide-react';
import { QUESTIONS, COURSE_NAME, PROFESSOR_NAME, REFLECTIVE_QUESTIONS, METRIC_EXPLANATIONS, CATEGORY_DESCRIPTIONS } from './constants';
import { QuizState, CalculationResult, Category, StudentProfile } from './types';
import { calculateFootprint } from './utils/calculator';
import MatrixTable from './components/MatrixTable';
import { getAiRecommendations } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, PieChart, Pie, Tooltip } from 'recharts';

// Helper to map Question IDs to Specific Icons
const getQuestionIcon = (id: string) => {
  const icons: Record<string, React.ReactNode> = {
    'food_diet_frequency': <Utensils size={32} />,
    'food_meat_type': <Beef size={32} />,
    'food_origin': <MapPin size={32} />,
    'food_processed': <Package size={32} />,
    'housing_type': <Building size={32} />,
    'housing_material': <BrickWall size={32} />,
    'housing_people': <Users size={32} />,
    'housing_electricity': <Lightbulb size={32} />,
    'transport_distance': <Car size={32} />,
    'transport_mode': <Bus size={32} />,
    'transport_carpool': <Users size={32} />,
    'transport_flights': <Plane size={32} />,
    'goods_clothing': <Shirt size={32} />,
    'goods_electronics': <Smartphone size={32} />,
    'goods_spending': <CreditCard size={32} />,
    'services_trash': <Trash2 size={32} />,
    'services_recycling': <Recycle size={32} />,
  };
  return icons[id] || <HelpCircle size={32} />;
};

// --- COMPONENT: Interactive Slide-Up Card ---
interface InteractiveMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext: string;
  icon: React.ReactNode;
  colorClass: string;
  explanationKey: keyof typeof METRIC_EXPLANATIONS;
}

const InteractiveMetricCard: React.FC<InteractiveMetricCardProps> = ({ title, value, unit, subtext, icon, colorClass, explanationKey }) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div 
      className={`relative h-64 w-full rounded-3xl bg-white shadow-xl border border-slate-100 overflow-hidden group cursor-pointer ${isActive ? 'card-active' : ''}`}
      onClick={() => setIsActive(!isActive)}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      {/* Main Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
           <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
             {icon}
           </div>
           <div className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
             <Info size={12} /> Info
           </div>
        </div>
        
        <div>
           <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</h4>
           <div className="flex items-baseline gap-2 flex-wrap">
             <span className={`text-4xl font-extrabold ${colorClass} tracking-tight`}>{value}</span>
             {unit && <span className="text-slate-500 font-medium">{unit}</span>}
           </div>
           <p className="text-xs text-slate-500 mt-2 font-medium">{subtext}</p>
        </div>
      </div>

      {/* Slide Up Overlay */}
      <div className="card-slide-overlay z-20">
         <div className="text-center text-white">
            <h5 className="font-bold text-lg mb-3 text-cyan-300">{title}</h5>
            <p className="text-sm leading-relaxed text-slate-300 font-light">
               {METRIC_EXPLANATIONS[explanationKey]}
            </p>
         </div>
      </div>
    </div>
  );
};

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="custom-tooltip-label">{label}</p>
        <p className="custom-tooltip-item" style={{ color: payload[0].fill }}>
          {`${payload[0].name}: ${payload[0].value} gha`}
        </p>
      </div>
    );
  }
  return null;
};

// Helper to clean Markdown for PDF
const cleanMarkdownForPdf = (text: string) => {
  if (!text) return '';
  let cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1');
  cleaned = cleaned.replace(/#{1,6}\s/g, '');
  return cleaned;
};

// Helper to Render Markdown with Bolds for Screen
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const paragraphs = text.split('\n');
  return (
    <div className="space-y-4">
      {paragraphs.map((p, idx) => {
        if (!p.trim()) return null;
        if (p.trim().startsWith('#')) {
           const content = p.replace(/#{1,6}\s/, '');
           return <h4 key={idx} className="text-lg font-bold text-cyan-300 mt-4">{content}</h4>;
        }
        const parts = p.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={idx} className="text-slate-300 leading-relaxed text-sm font-light">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
};

function App() {
  const [viewState, setViewState] = useState<'WELCOME' | 'FORM' | 'QUIZ' | 'RESULTS' | 'PDF_PREVIEW'>('WELCOME');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizState>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({ name: '', studentCode: '', courseCycle: '', professionalSchool: 'Biología' });
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [activeChartCategory, setActiveChartCategory] = useState<string | null>(null);
  const [reflectiveAnswers, setReflectiveAnswers] = useState<Record<number, string>>({});
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const questionCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewState === 'QUIZ' && questionCardRef.current) {
      questionCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentQuestionIndex, viewState]);

  // Install Prompt Listener
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    });
  }, []);

  const handleStart = () => setViewState('FORM');

  // Install App Handler
  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  // Enhanced Manual Print Handler
  const handlePrint = () => {
    try {
      // Set a nice filename for the save dialog
      document.title = `Huella_Carbono_${studentProfile.name.replace(/\s+/g, '_')}_UNSAAC`;
      window.print();
    } catch (error) {
      alert("La función de impresión automática fue bloqueada. Por favor presione Ctrl + P (o Cmd + P en Mac) para guardar el PDF.");
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studentProfile.name && studentProfile.studentCode) {
      setViewState('QUIZ');
    }
  };

  const handleAnswer = (value: number) => {
    const currentQ = QUESTIONS[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestionIndex(prev => prev + 1), 150);
    } else {
      finishQuiz(newAnswers);
    }
  };

  const handleReflectiveAnswerChange = (index: number, text: string) => {
    setReflectiveAnswers(prev => ({ ...prev, [index]: text }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const finishQuiz = async (finalAnswers: QuizState) => {
    const calculatedResult = calculateFootprint(finalAnswers);
    setResult(calculatedResult);
    setViewState('RESULTS');
    setLoadingAi(true);
    const advice = await getAiRecommendations(calculatedResult, studentProfile);
    setAiAdvice(advice);
    setLoadingAi(false);
  };

  const resetQuiz = () => {
    setViewState('WELCOME');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setReflectiveAnswers({});
    setResult(null);
    setAiAdvice(null);
    setStudentProfile({ name: '', studentCode: '', courseCycle: '', professionalSchool: 'Biología' });
  };

  const barData = result ? [
    { name: 'Perú', value: 1.6, fill: '#10b981' }, 
    { name: 'Mundo', value: 2.7, fill: '#f59e0b' },
    { name: 'Tú', value: result.totalGha, fill: result.totalGha > 2.7 ? '#ef4444' : '#8b5cf6' },
  ] : [];

  const pieData = result ? Object.entries(result.breakdown).map(([key, value]) => ({ name: key, value })) : [];
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  // --- RENDER FUNCTIONS ---

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12 animate-fadeIn">
      <div className="relative group">
        <div className="absolute -inset-10 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full opacity-30 blur-2xl animate-pulse"></div>
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl relative z-10 text-slate-900 border border-slate-100">
          <Globe size={80} className="text-violet-600" />
        </div>
      </div>
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight font-tech">
          Calculadora de <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-violet-600">Huella de Carbono</span>
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed font-light">
          UNSAAC - Ecología y Medio Ambiente
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <button onClick={handleStart} className="px-10 py-5 bg-slate-900 text-white text-lg font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 border border-slate-700 hover:bg-black transition-all">
          <span className="font-tech">INICIAR EVALUACIÓN</span>
          <ChevronRight className="text-cyan-400" />
        </button>
        
        {deferredPrompt && (
          <button onClick={handleInstallClick} className="px-6 py-3 bg-white text-violet-600 text-sm font-bold rounded-2xl shadow-sm border border-violet-100 flex items-center justify-center gap-2 hover:bg-violet-50 transition-all">
            <PhoneIcon size={18} />
            <span>INSTALAR APP EN DISPOSITIVO</span>
          </button>
        )}
      </div>
    </div>
  );

  const renderStudentForm = () => (
    <div className="max-w-xl mx-auto w-full py-10 animate-slideIn">
      <div className="glass-panel p-8 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-100">
          <div className="bg-violet-600 p-3 rounded-2xl text-white shadow-lg"><UserCircle size={28} /></div>
          <div><h2 className="text-2xl font-bold font-tech text-slate-900">Perfil del Estudiante</h2><p className="text-slate-500 text-sm">UNSAAC - Registro de Datos</p></div>
        </div>
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Nombre Completo</label>
            <input required type="text" className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none font-medium" 
              value={studentProfile.name} onChange={(e) => setStudentProfile({...studentProfile, name: e.target.value})} placeholder="Ej. Juan Pérez" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Código</label>
              <input required type="text" className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none font-medium"
                value={studentProfile.studentCode} onChange={(e) => setStudentProfile({...studentProfile, studentCode: e.target.value})} placeholder="Ej. 20231050" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Ciclo</label>
              <input required type="text" className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none font-medium"
                value={studentProfile.courseCycle} onChange={(e) => setStudentProfile({...studentProfile, courseCycle: e.target.value})} placeholder="Ej. 2024-I" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-slate-500 mb-1 ml-1">Escuela Profesional</label>
            <input required type="text" className="w-full p-4 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-violet-500 outline-none font-medium"
              value={studentProfile.professionalSchool} onChange={(e) => setStudentProfile({...studentProfile, professionalSchool: e.target.value})} placeholder="Ej. Biología" />
          </div>
          <button type="submit" className="w-full mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
            <span className="font-tech">CONTINUAR</span><ChevronRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );

  const renderQuiz = () => {
    const question = QUESTIONS[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;
    return (
      <div className="max-w-4xl mx-auto w-full py-6" ref={questionCardRef}>
        <div className="mb-8 px-2">
          <div className="flex justify-between items-end text-sm font-bold text-slate-400 mb-3 font-tech uppercase tracking-widest">
            <span>Progreso</span><span className="text-violet-600">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 to-violet-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border border-slate-100 animate-slideIn relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
             <div className="flex-shrink-0 bg-slate-50 text-violet-600 p-6 rounded-2xl shadow-inner border border-slate-200 hidden md:flex items-center justify-center">
                {getQuestionIcon(question.id)}
             </div>
             <div className="flex-grow w-full">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-cyan-50 text-cyan-600 text-xs font-bold uppercase tracking-wider rounded-lg border border-cyan-100">{question.category}</span>
                  <span className="text-slate-300 text-xs font-tech">#{currentQuestionIndex + 1} / {QUESTIONS.length}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8 leading-tight">{question.question}</h2>
                <div className="space-y-4">
                  {question.options.map((opt, idx) => (
                    <button key={idx} onClick={() => handleAnswer(opt.value)} className="w-full text-left p-5 rounded-2xl border-2 border-slate-100 hover:border-violet-500 hover:bg-violet-50 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 group-hover:border-violet-500 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="font-medium text-slate-700 group-hover:text-slate-900 text-lg">{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
             </div>
          </div>
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between">
             <button onClick={handlePrevious} disabled={currentQuestionIndex === 0} className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${currentQuestionIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-violet-600'}`}>
               <ChevronLeft size={18} /> Atrás
             </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="max-w-6xl mx-auto w-full py-8 space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-tech font-bold text-slate-900">Resultados</h2>
        <div className="flex gap-3">
          <button onClick={() => setViewState('PDF_PREVIEW')} className="bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:-translate-y-1 transition-transform">
            <Printer size={20} className="text-cyan-400" /> <span>Imprimir / Guardar PDF</span>
          </button>
          <button onClick={resetQuiz} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-3 rounded-xl font-bold shadow-sm transition-all">
             Reiniciar
          </button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-sm flex items-start gap-3">
         <MousePointerClick className="flex-shrink-0" size={20} />
         <p><strong>Interactividad:</strong> Pasa el mouse o haz clic sobre las tarjetas para descubrir qué significa cada métrica académica.</p>
      </div>

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <InteractiveMetricCard title="Huella Ecológica" value={result.totalGha} unit="gha" subtext="Media Global: 2.7 gha" icon={<Globe className="text-violet-600" size={28} />} colorClass="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600" explanationKey="gha" />
           <InteractiveMetricCard title="Planetas Necesarios" value={result.numberEarths} unit="🌎" subtext="Consumo de recursos" icon={<Zap className="text-yellow-500" size={28} />} colorClass="text-slate-900" explanationKey="earths" />
           <InteractiveMetricCard title="Emisiones CO2" value={result.carbonFootprint} unit="t/año" subtext="Impacto Climático" icon={<Car className="text-red-500" size={28} />} colorClass="text-slate-900" explanationKey="co2" />
           <InteractiveMetricCard title="Sobrecapacidad" value={result.overshootDate} subtext="Límite anual" icon={<Leaf className={result.totalGha > 1.6 ? "text-red-500" : "text-green-500"} size={28} />} colorClass={result.totalGha > 1.6 ? "text-red-600" : "text-emerald-600"} explanationKey="overshoot" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 font-tech flex items-center gap-2"><span className="w-2 h-6 bg-violet-600 rounded-full"></span> Comparativa</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" width={60} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} />
                     <Tooltip cursor={{fill: '#f1f5f9'}} content={<CustomTooltip />} />
                     <Bar dataKey="value" barSize={32} radius={[0, 10, 10, 0]} animationDuration={1500}>
                        {barData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800 mb-6 font-tech flex items-center gap-2"><span className="w-2 h-6 bg-cyan-500 rounded-full"></span> Desglose</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" onMouseEnter={(_, index) => setActiveChartCategory(pieData[index].name)} onMouseLeave={() => setActiveChartCategory(null)}>
                          {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} className="cursor-pointer" />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="w-full md:w-48 flex flex-col justify-center text-sm border-l border-slate-100 pl-4">
               {activeChartCategory ? (
                 <div className="animate-fadeIn">
                    <span className="text-xs font-bold uppercase text-slate-400">Detalle</span>
                    <p className="font-bold text-slate-800 text-lg mb-1">{activeChartCategory}</p>
                    <p className="text-xs text-slate-500">{CATEGORY_DESCRIPTIONS[activeChartCategory as Category]}</p>
                 </div>
               ) : (
                 <div className="text-xs text-slate-400 italic">Pasa el mouse sobre el gráfico para ver detalles de impacto.</div>
               )}
            </div>
         </div>
      </div>

      {result && <MatrixTable data={result} />}

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden">
         <div className="relative z-10">
            <h3 className="text-2xl font-tech font-bold mb-6 flex items-center gap-3">
               <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg"><Zap size={24} className="text-white" /></div>
               Análisis del Docente (IA)
            </h3>
            {loadingAi ? (
               <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                  <p className="text-cyan-300 font-medium animate-pulse">Consultando a Gemini AI...</p>
               </div>
            ) : (
               <FormattedText text={aiAdvice || "No se pudo generar el análisis."} />
            )}
         </div>
      </div>
      
      {/* Reflective Questionnaire Section */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
         <h3 className="text-2xl font-tech font-bold text-slate-900 mb-6 flex items-center gap-3">
           <div className="p-2 bg-violet-100 text-violet-600 rounded-lg"><Edit3 size={24} /></div>
           IV. Cuestionario Reflexivo
         </h3>
         <p className="text-slate-500 mb-8 italic">Responde las siguientes preguntas para completar tu informe antes de descargarlo.</p>
         
         <div className="space-y-8">
           {REFLECTIVE_QUESTIONS.map((q, i) => (
             <div key={i} className="space-y-3">
               <label className="block text-slate-800 font-bold text-sm md:text-base">
                 {i+1}. {q}
               </label>
               <textarea
                 className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-slate-700 min-h-[100px] shadow-inner"
                 placeholder="Escribe tu análisis aquí..."
                 value={reflectiveAnswers[i] || ''}
                 onChange={(e) => handleReflectiveAnswerChange(i, e.target.value)}
               />
             </div>
           ))}
         </div>

         {/* ADDED BOTTOM DOWNLOAD BUTTON */}
         <div className="mt-10 pt-8 border-t border-slate-100">
            <button 
              onClick={() => setViewState('PDF_PREVIEW')} 
              className="w-full md:w-auto mx-auto bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 hover:scale-[1.01] transition-transform text-lg"
            >
              <Printer size={24} className="text-cyan-400" /> 
              <span>Vista Previa y Descargar Informe</span>
            </button>
         </div>
      </div>
    </div>
  );

  // --- PDF EXCLUSIVE VIEW ---
  // Renders strictly for the browser Print function
  const renderPdfView = () => (
    <div className="pdf-preview-mode">
      <div id="printable-report-content" className="pdf-page font-academic text-black">
         {/* HEADER */}
         <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
            <div>
               <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">UNSAAC</h1>
               <h2 className="text-xl font-semibold">{COURSE_NAME}</h2>
               <p className="text-sm italic mt-1">Informe de Práctica: Huella de Carbono</p>
            </div>
            <div className="text-right">
               <p className="font-bold">{new Date().toLocaleDateString()}</p>
               <p className="text-sm">Docente: {PROFESSOR_NAME}</p>
            </div>
         </div>

         {/* STUDENT INFO */}
         <div className="border border-black p-4 mb-6">
            <h3 className="text-lg font-bold border-b border-gray-300 pb-2 mb-3 uppercase">I. Datos del Estudiante</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
               <p><span className="font-bold">Nombre:</span> {studentProfile.name}</p>
               <p><span className="font-bold">Código:</span> {studentProfile.studentCode}</p>
               <p><span className="font-bold">Escuela:</span> {studentProfile.professionalSchool}</p>
               <p><span className="font-bold">Ciclo:</span> {studentProfile.courseCycle}</p>
            </div>
         </div>

         {/* RESULTS TABLE */}
         <div className="mb-6 break-inside-avoid">
            <h3 className="text-lg font-bold border-b border-black pb-2 mb-3 uppercase">II. Resultados Cuantitativos</h3>
            <table className="w-full text-sm border-collapse border border-black mb-4">
               <thead>
                  <tr className="bg-gray-100">
                     <th className="border border-black p-2 text-left">Indicador</th>
                     <th className="border border-black p-2 text-center">Valor</th>
                     <th className="border border-black p-2 text-center">Referencia</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td className="border border-black p-2">Huella Ecológica</td>
                     <td className="border border-black p-2 text-center font-bold">{result?.totalGha} gha</td>
                     <td className="border border-black p-2 text-center">2.7 gha</td>
                  </tr>
                  <tr>
                     <td className="border border-black p-2">Planetas Necesarios</td>
                     <td className="border border-black p-2 text-center font-bold">{result?.numberEarths}</td>
                     <td className="border border-black p-2 text-center">1.0</td>
                  </tr>
                  <tr>
                     <td className="border border-black p-2">Emisiones CO2</td>
                     <td className="border border-black p-2 text-center font-bold">{result?.carbonFootprint} t</td>
                     <td className="border border-black p-2 text-center">-</td>
                  </tr>
               </tbody>
            </table>
            
            <h4 className="font-bold text-sm mb-2 mt-4">Desglose por Categoría (gha):</h4>
            <table className="w-full text-sm border-collapse border border-black">
               <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2">Categoría</th>
                    <th className="border border-black p-2 text-center">Valor</th>
                  </tr>
               </thead>
               <tbody>
                  {result && Object.entries(result.breakdown).map(([k, v]) => (
                     <tr key={k}>
                        <td className="border border-black p-2">{k}</td>
                        <td className="border border-black p-2 text-center">{v}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* AI ANALYSIS */}
         <div className="mb-6 break-inside-avoid">
            <h3 className="text-lg font-bold border-b border-black pb-2 mb-3 uppercase">III. Análisis y Recomendaciones</h3>
            <div className="text-sm text-justify leading-relaxed whitespace-pre-wrap">
               {cleanMarkdownForPdf(aiAdvice || "Análisis no disponible.")}
            </div>
         </div>

         {/* REFLECTIVE QUESTIONS */}
         <div className="mt-8">
            <h3 className="text-lg font-bold border-b border-black pb-2 mb-6 uppercase">IV. Cuestionario Reflexivo</h3>
            {REFLECTIVE_QUESTIONS.map((q, i) => (
               <div key={i} className="mb-6 break-inside-avoid">
                  <p className="font-bold text-sm mb-2">{i+1}. {q}</p>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded text-sm text-justify whitespace-pre-wrap min-h-[40px]">
                    {reflectiveAnswers[i] ? reflectiveAnswers[i] : <span className="text-gray-400 italic">Sin respuesta...</span>}
                  </div>
               </div>
            ))}
         </div>
      </div>
      
      {/* Controls Overlay */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 no-print">
         <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-xl mb-4 max-w-sm animate-fadeIn border border-slate-700">
            <p className="font-bold text-base flex items-center gap-2 mb-2"><Printer size={20} className="text-cyan-400"/> Instrucciones</p>
            <p className="text-sm text-slate-300 leading-relaxed">
               1. Haz clic en el botón <strong>"IMPRIMIR / GUARDAR"</strong>.<br/>
               2. Se abrirá una ventana. Cambia el "Destino" a <strong>"Guardar como PDF"</strong>.<br/>
               3. <strong>SI NO SE ABRE LA VENTANA:</strong> Presiona <strong>Ctrl + P</strong> (Windows) o <strong>Cmd + P</strong> (Mac).
            </p>
            <button 
              type="button" 
              onClick={handlePrint} 
              className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 border border-cyan-400 hover:scale-[1.02]"
            >
               <Printer size={22} /> IMPRIMIR / GUARDAR
            </button>
         </div>
         <button onClick={() => setViewState('RESULTS')} className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
            <X size={18} /> Cerrar Vista Previa
         </button>
      </div>
    </div>
  );

  return (
    <>
      {viewState === 'PDF_PREVIEW' ? renderPdfView() : (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
          <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-white"><Leaf size={20} /></div>
                 <div><span className="block font-bold text-slate-800 font-tech tracking-tight leading-none">UNSAAC</span><span className="text-xs text-slate-500 font-semibold">{COURSE_NAME}</span></div>
              </div>
              <div className="text-xs font-semibold text-slate-500 hidden md:block bg-slate-100 px-3 py-1 rounded-full">{PROFESSOR_NAME}</div>
            </div>
          </header>
          <main className="flex-grow container mx-auto px-4 py-6 flex flex-col items-center">
            {viewState === 'WELCOME' && renderWelcome()}
            {viewState === 'FORM' && renderStudentForm()}
            {viewState === 'QUIZ' && renderQuiz()}
            {viewState === 'RESULTS' && renderDashboard()}
          </main>
          <footer className="bg-slate-900 border-t border-slate-800 py-10 mt-auto">
            <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
              <p className="font-tech tracking-widest uppercase text-xs mb-2 text-slate-500">EcoHuella Académica - UNSAAC</p>
              <p>&copy; {new Date().getFullYear()} - Laboratorio de Ecología y Medio Ambiente</p>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}

export default App;