
import React, { useState, useMemo, useEffect } from 'react';
import { PERFUME_DATABASE } from './constants';
import { Perfume, ViewMode, QuizAnswers, QuizQuestion } from './types';
import PerfumeCard from './components/PerfumeCard';
import AiAssistant from './components/AiAssistant';
import { generateDynamicQuiz, analyzeQuizProfile, SCENT_FAMILIES } from './services/geminiService';

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/babeoded",
  tiktok: "https://www.tiktok.com/@babeoded",
  youtube: "https://www.youtube.com/BABEODED"
};

// Logogram baru: Ikon botol parfum minimalis yang ikonik
const ParfumuLogo = () => (
  <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    {/* Tutup Botol */}
    <rect x="38" y="10" width="24" height="15" rx="4" fill="url(#logoGrad)" />
    {/* Leher Botol */}
    <rect x="44" y="25" width="12" height="8" fill="url(#logoGrad)" opacity="0.8" />
    {/* Badan Botol */}
    <rect x="25" y="33" width="50" height="55" rx="12" stroke="url(#logoGrad)" strokeWidth="6" />
    {/* Cairan Parfum Inside */}
    <path d="M31 65C31 65 35 60 50 60C65 60 69 65 69 65V76C69 82.6274 63.6274 88 57 88H43C36.3726 88 31 82.6274 31 76V65Z" fill="url(#logoGrad)" opacity="0.2" />
    {/* Sparkle Icon */}
    <circle cx="50" cy="53" r="4" fill="url(#logoGrad)" />
  </svg>
);

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('quiz');
  const [currentStep, setCurrentStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null);
  const [filterType, setFilterType] = useState('all');
  
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [psychologicalSummary, setPsychologicalSummary] = useState('');

  useEffect(() => {
    loadNewQuiz();
  }, []);

  const loadNewQuiz = async () => {
    setIsQuizLoading(true);
    try {
      const questions = await generateDynamicQuiz();
      setQuizQuestions(questions || []);
    } catch (e) {
      console.error("Gagal memuat kuis:", e);
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleQuizAnswer = async (tag: string) => {
    const newAnswers = { ...quizAnswers, [currentStep]: tag };
    setQuizAnswers(newAnswers);
    
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setViewMode('result');
      setIsQuizLoading(true);
      try {
        const summary = await analyzeQuizProfile(Object.values(newAnswers));
        setPsychologicalSummary(summary);
      } finally {
        setIsQuizLoading(false);
      }
    }
  };

  const resetQuiz = () => {
    setViewMode('quiz');
    setCurrentStep(0);
    setQuizAnswers({});
    setPsychologicalSummary('');
    loadNewQuiz();
  };

  const recommendations = useMemo(() => {
    if (viewMode !== 'result' || quizQuestions.length === 0) return [];
    const tags = Object.values(quizAnswers) as string[];
    const preferenceTags = tags.filter(t => !t.includes(':'));
    const budgetTag = tags.find(t => t.startsWith('budget:'))?.replace('budget:', '');

    return PERFUME_DATABASE.filter(perfume => {
      if (budgetTag && budgetTag !== 'any' && perfume.price !== budgetTag) return false;
      return perfume.scent_family.some(f => preferenceTags.includes(f));
    }).sort((a, b) => {
      const matchA = a.scent_family.filter(f => preferenceTags.includes(f)).length;
      const matchB = b.scent_family.filter(f => preferenceTags.includes(f)).length;
      return matchB - matchA;
    }).slice(0, 4);
  }, [quizAnswers, viewMode, quizQuestions]);

  const filteredKoleksi = useMemo(() => {
    return PERFUME_DATABASE.filter(perfume => {
      const nameMatch = perfume.name.toLowerCase().includes(searchQuery.toLowerCase());
      const familyMatch = filterType === 'all' || perfume.scent_family.includes(filterType);
      return nameMatch && familyMatch;
    });
  }, [searchQuery, filterType]);

  const getPersuasivePitch = (perfume: Perfume) => {
    const family = perfume.scent_family[0];
    const stories: Record<string, string> = {
      'Floral': `Keanggunan batin Anda bukan untuk disembunyikan. Aroma ini adalah manifestasi dari sisi lembut nan misterius yang membuat setiap orang yang Anda temui terpikat dalam kerinduan.`,
      'Gourmand': `Dunia membutuhkan kehangatan Anda. Manisnya aroma ini bukan sekadar wangi, melainkan pelukan batin yang memicu rasa candu bagi siapa pun di dekat Anda.`,
      'Fresh': `Anda adalah energi murni fajar baru. Aroma ini memberikan kejernihan pikiran yang membuat Anda selangkah lebih maju dalam setiap tantangan hidup.`,
      'Woody': `Wibawa sejati tidak perlu berteriak. Kekokohan aroma ini adalah akar yang menjaga Anda tetap dominan namun tenang.`,
    };
    return stories[family] || `Mahakarya aroma ini adalah potongan puzzle terakhir dari jati diri Anda yang istimewa. Sempurnakan kehadiran Anda sekarang.`;
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col relative text-zinc-800">
      <nav className="flex justify-between items-center px-6 md:px-12 py-5 sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => resetQuiz()}>
          <ParfumuLogo />
          <div>
            <h1 className="font-sans text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-pink-500">PARFUMU</h1>
            <p className="text-[7px] uppercase tracking-[0.2em] font-bold text-zinc-400">Seni menemukan jati diri</p>
          </div>
        </div>
        <div className="flex gap-6">
          <button onClick={() => setViewMode('quiz')} className={`text-[9px] font-black uppercase tracking-widest transition-colors ${viewMode === 'quiz' ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}>Kuis</button>
          <button onClick={() => setViewMode('collection')} className={`text-[9px] font-black uppercase tracking-widest transition-colors ${viewMode === 'collection' ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}>Koleksi</button>
          <button onClick={() => setViewMode('about')} className={`text-[9px] font-black uppercase tracking-widest transition-colors ${viewMode === 'about' ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}`}>Tentang</button>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-8">
        {viewMode === 'quiz' && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10">
               <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-2">Temukan Identitas Aromamu</h2>
               <p className="text-zinc-400 text-sm font-medium">Bantu kami membaca karakter batin Anda melalui 10 pertanyaan psikologis.</p>
            </div>

            {isQuizLoading && !quizQuestions.length ? (
              <div className="text-center py-12 bg-white/40 rounded-3xl border border-white">
                <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 animate-pulse">MEMPERSIAPKAN KUIS...</p>
              </div>
            ) : quizQuestions.length > 0 ? (
              <div className="card-glass rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Langkah {currentStep + 1} / 10</span>
                  <div className="flex gap-1">
                    {Array.from({length: 10}).map((_, i) => (
                      <div key={i} className={`h-1 w-3 rounded-full transition-all duration-300 ${i <= currentStep ? 'bg-indigo-600' : 'bg-zinc-100'}`}></div>
                    ))}
                  </div>
                </div>
                <h3 className="text-xl md:text-2xl text-zinc-900 font-bold mb-8 leading-snug">{quizQuestions[currentStep].text}</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {quizQuestions[currentStep].options.map((opt, i) => (
                    <button key={i} onClick={() => handleQuizAnswer(opt.tag)} className="text-left p-5 rounded-2xl bg-white border border-zinc-100 hover:border-indigo-500 hover:shadow-lg transition-all text-xs md:text-sm font-medium text-zinc-600 hover:text-indigo-700 group flex justify-between items-center">
                      <span>{opt.text}</span>
                      <i className="fa-solid fa-chevron-right text-[10px] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0"></i>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                Oracle sedang sulit dihubungi. Periksa koneksi internet Anda.
              </div>
            )}
          </div>
        )}

        {viewMode === 'result' && (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 mb-2 block">Profil Psikologis Selesai</span>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-4">Eskalasi Aura Anda</h2>
              {isQuizLoading ? (
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-6 h-6 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">MENGANALISIS JIWA...</p>
                 </div>
              ) : (
                <div className="max-w-2xl mx-auto p-6 bg-white/50 border border-white rounded-3xl shadow-sm">
                   <p className="text-indigo-700 font-bold italic text-lg leading-relaxed">"{psychologicalSummary}"</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-4">
              {recommendations.map(p => (
                <PerfumeCard key={p.id} perfume={p} onClick={setSelectedPerfume} />
              ))}
            </div>
            <div className="text-center">
              <button onClick={resetQuiz} className="px-8 py-3 rounded-full border border-zinc-200 text-zinc-400 hover:text-indigo-600 hover:border-indigo-600 transition-all font-black text-[9px] uppercase tracking-widest">Temukan Kembali Diri Anda</button>
            </div>
          </div>
        )}

        {viewMode === 'collection' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-zinc-50 pb-8">
              <div>
                 <h2 className="text-3xl font-bold text-zinc-900">Perpustakaan Aroma</h2>
                 <p className="text-zinc-400 text-xs mt-1">Eksplorasi mahakarya wangi yang telah dikurasi.</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-grow">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 text-xs"></i>
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari Masterpiece..." className="w-full md:w-56 bg-zinc-50 border border-zinc-100 rounded-xl py-2.5 pl-10 pr-4 text-[10px] focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"/>
                </div>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-zinc-50 border border-zinc-100 rounded-xl py-2.5 px-4 text-[10px] font-bold text-zinc-600 cursor-pointer hover:border-indigo-500 transition-colors">
                  <option value="all">Keluarga Aroma</option>
                  {SCENT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 px-2">
              {filteredKoleksi.map(p => (
                <PerfumeCard key={p.id} perfume={p} onClick={setSelectedPerfume} />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'about' && (
          <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-zinc-900">Tentang Parfumu</h2>
              <p className="text-zinc-500 text-sm leading-relaxed px-6">Lahir dari keyakinan bahwa aroma adalah cara jiwa berbicara tanpa suara. Kami membantu Anda menerjemahkan identitas menjadi udara.</p>
            </div>
            <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-zinc-50 text-center space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 octarine-gradient opacity-5 blur-3xl"></div>
              <div className="space-y-2">
                <p className="font-black text-2xl text-zinc-900 uppercase tracking-widest">BABE ODED</p>
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-[0.4em]">Scent Explorer</p>
              </div>
              <p className="text-zinc-500 italic text-lg leading-relaxed">"Melukis emosi melalui wangi, merangkai ingatan di udara."</p>
              <div className="flex justify-center gap-8 text-2xl pt-4">
                <a href={SOCIAL_LINKS.instagram} target="_blank" className="text-pink-600 hover:scale-125 transition-transform"><i className="fa-brands fa-instagram"></i></a>
                <a href={SOCIAL_LINKS.tiktok} target="_blank" className="text-zinc-900 hover:scale-125 transition-transform"><i className="fa-brands fa-tiktok"></i></a>
                <a href={SOCIAL_LINKS.youtube} target="_blank" className="text-red-600 hover:scale-125 transition-transform"><i className="fa-brands fa-youtube"></i></a>
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedPerfume && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={() => setSelectedPerfume(null)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 h-[85vh] md:h-auto overflow-y-auto md:overflow-hidden">
            <button onClick={() => setSelectedPerfume(null)} className="absolute top-6 right-6 z-50 w-10 h-10 bg-white/80 hover:bg-zinc-900 hover:text-white rounded-full flex items-center justify-center text-zinc-400 transition-all shadow-sm"><i className="fa-solid fa-xmark"></i></button>
            <div className="md:w-1/3 bg-zinc-50 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden min-h-[250px] md:min-h-0">
               <div className="octarine-gradient w-48 h-48 rounded-full mb-6 opacity-10 blur-3xl absolute"></div>
               <p className="text-zinc-600 text-sm italic relative z-10 leading-relaxed font-cinzel">"{getPersuasivePitch(selectedPerfume)}"</p>
            </div>
            <div className="md:w-2/3 p-8 md:p-12 space-y-8 overflow-y-auto">
              <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">{selectedPerfume.name}</h2>
              <div className="space-y-6">
                <div>
                  <h4 className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-3 border-l-2 border-indigo-500 pl-3">Scent Families</h4>
                  <div className="flex flex-wrap gap-2">{selectedPerfume.scent_family.map(f => <span key={f} className="text-[10px] bg-zinc-100 px-3 py-1.5 rounded-lg text-zinc-600 font-medium">{f}</span>)}</div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                   <div>
                     <p className="text-[7px] font-black uppercase tracking-widest text-zinc-400 mb-2">Top Notes</p>
                     <p className="text-[10px] font-semibold text-zinc-700 leading-snug">{selectedPerfume.top_notes.join(', ')}</p>
                   </div>
                   <div>
                     <p className="text-[7px] font-black uppercase tracking-widest text-zinc-400 mb-2">Heart Notes</p>
                     <p className="text-[10px] font-semibold text-zinc-700 leading-snug">{selectedPerfume.middle_notes.join(', ')}</p>
                   </div>
                   <div>
                     <p className="text-[7px] font-black uppercase tracking-widest text-zinc-400 mb-2">Base Notes</p>
                     <p className="text-[10px] font-semibold text-zinc-700 leading-snug">{selectedPerfume.base_notes.join(', ')}</p>
                   </div>
                </div>
              </div>
              <div className="pt-8 border-t border-zinc-100">
                <div className="p-4 bg-pink-50/50 border border-pink-100 rounded-2xl mb-8 text-center">
                   <p className="text-pink-600 font-black text-[10px] uppercase tracking-widest animate-pulse">Temukan Promo Eksklusif di Marketplace melalui link di bawah ini</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <a href={selectedPerfume.shopee_url} target="_blank" className="bg-[#EE4D2D] hover:bg-[#d13b1f] text-white font-black py-4 rounded-2xl text-center text-[10px] tracking-widest shadow-xl shadow-orange-500/10 transition-all flex items-center justify-center gap-2">
                    <i className="fa-solid fa-cart-shopping text-xs"></i> SHOPEE
                  </a>
                  <a href={selectedPerfume.tokopedia_url} target="_blank" className="bg-[#03AC0E] hover:bg-[#028b0b] text-white font-black py-4 rounded-2xl text-center text-[10px] tracking-widest shadow-xl shadow-green-500/10 transition-all flex items-center justify-center gap-2">
                    <i className="fa-solid fa-bag-shopping text-xs"></i> TOKOPEDIA
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AiAssistant />
      <footer className="mt-20 border-t border-zinc-100 py-16 px-6 text-center">
        <div className="flex flex-col items-center gap-4 mb-8">
           <ParfumuLogo />
           <p className="font-cinzel text-xs text-zinc-400 font-bold uppercase tracking-[0.5em]">Parfumu Sanctuary</p>
        </div>
        <p className="text-zinc-300 text-[8px] font-black uppercase tracking-[0.4em]">Curated by BABE ODED & Gemini Oracle</p>
      </footer>
    </div>
  );
};

export default App;
