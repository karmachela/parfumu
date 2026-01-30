
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

const ParfumuLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <rect x="25" y="40" width="50" height="50" rx="8" stroke="url(#logoGrad)" strokeWidth="8" />
    <path d="M40 40V30C40 24.4772 44.4772 20 50 20C55.5228 20 60 24.4772 60 30V40" stroke="url(#logoGrad)" strokeWidth="8" />
    <circle cx="50" cy="65" r="15" fill="white" stroke="url(#logoGrad)" strokeWidth="4" />
    <line x1="60" y1="75" x2="78" y2="93" stroke="url(#logoGrad)" strokeWidth="8" strokeLinecap="round" />
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
      if (questions && questions.length > 0) {
        setQuizQuestions(questions);
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
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
      } catch (error) {
        setPsychologicalSummary("Analisis profil batin Anda menunjukkan aura yang unik.");
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
    const excludeTags = tags.filter(t => t.startsWith('exclude:')).map(t => t.replace('exclude:', ''));
    const budgetTag = tags.find(t => t.startsWith('budget:'))?.replace('budget:', '');
    const preferenceTags = tags.filter(t => !t.includes(':'));

    return PERFUME_DATABASE.filter(perfume => {
      const hasExcluded = perfume.scent_family.some(f => excludeTags.includes(f));
      if (hasExcluded) return false;
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
      'Floral': `Keanggunan batin Anda bukan untuk disembunyikan. Aroma ini adalah manifestasi dari sisi lembut nan misterius yang membuat setiap orang yang Anda temui terpikat dalam kerinduan. Anda tidak hanya memakai parfum, Anda sedang mengenakan identitas yang tak terlupakan.`,
      'Gourmand': `Dunia membutuhkan kehangatan Anda. Manisnya aroma ini bukan sekadar wangi, melainkan pelukan batin yang memicu rasa candu dan kenyamanan bagi siapa pun di dekat Anda. Jadilah pusat perhatian yang paling diinginkan.`,
      'Fresh': `Anda adalah energi murni fajar baru. Aroma ini adalah deklarasi kebebasan bagi jiwa yang tidak mau terikat, memberikan kejernihan pikiran yang membuat Anda selangkah lebih maju dalam setiap tantangan hidup.`,
      'Woody': `Wibawa sejati tidak perlu berteriak. Kekokohan aroma ini adalah akar yang menjaga Anda tetap dominan namun tenang. Tunjukkan pada dunia bahwa setiap langkah Anda adalah pernyataan kuasa yang tak terbantahkan.`,
      'Aquatic': `Ketenangan Anda adalah kedalaman yang menghanyutkan. Aroma ini melengkapi jiwa yang luas seperti samudera, memberikan aura misterius yang membuat orang lain haus akan kedekatan dengan Anda.`,
    };
    return stories[family] || `Mahakarya aroma ini adalah potongan puzzle terakhir dari jati diri Anda yang istimewa. Sempurnakan kehadiran Anda dan biarkan dunia mengenal siapa Anda sebenarnya melalui hembusan wangi ini.`;
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col relative text-zinc-800">
      <nav className="flex justify-between items-center px-4 md:px-8 py-6 sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-100">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => resetQuiz()}>
          <ParfumuLogo />
          <div>
            <h1 className="font-sans text-xl md:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 transition-all">PARFUMU</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400">Seni menemukan jati diri</p>
          </div>
        </div>
        <div className="flex gap-4 md:gap-8">
          <button onClick={() => resetQuiz()} className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'quiz' ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-900'}`}>Beranda</button>
          <button onClick={() => setViewMode('collection')} className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'collection' ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-900'}`}>Koleksi</button>
          <button onClick={() => setViewMode('about')} className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'about' ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-900'}`}>Tentang</button>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 md:px-6 py-12">
        {isQuizLoading && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-pastel-mesh">
            <div className="relative">
              <div className="w-20 h-20 border-8 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-4 h-4 bg-indigo-600 rounded-full animate-ping"></div>
              </div>
            </div>
            <h2 className="mt-10 text-2xl md:text-4xl font-black text-indigo-700 tracking-[0.5em] animate-pulse-soft">LOADING</h2>
            <p className="mt-4 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Membaca resonansi jiwa Anda...</p>
          </div>
        )}

        {viewMode === 'quiz' && !isQuizLoading && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12 md:mb-16">
              <span className="text-[10px] text-indigo-500 font-black tracking-[0.5em] uppercase mb-4 block">The Psychological Quest</span>
              <h2 className="text-3xl md:text-6xl font-bold text-zinc-900 mb-6 leading-tight">Jiwa Anda adalah Aroma.</h2>
              <p className="text-zinc-500 max-w-lg mx-auto text-base md:text-lg leading-relaxed px-4">Selesaikan langkah penemuan jati diri ini. Biarkan kami merangkai aroma yang paling jujur tentang siapa Anda sebenarnya.</p>
              <div className="w-12 h-1 bg-zinc-200 mx-auto mt-12 rounded-full"></div>
            </div>

            {quizQuestions.length > 0 && (
              <div className="card-glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 border-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 octarine-gradient opacity-5 blur-3xl"></div>
                
                <div className="flex justify-between items-center mb-8 md:mb-12">
                  <div className="flex flex-col">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Soul Mapping</span>
                    <span className="text-zinc-900 font-bold">Langkah {currentStep + 1} <span className="text-zinc-300">/ {quizQuestions.length}</span></span>
                  </div>
                  <div className="flex gap-1 md:gap-1.5">
                    {quizQuestions.map((_, i) => (
                      <div key={i} className={`h-1 md:h-1.5 w-3 md:w-5 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-indigo-600 w-6' : 'bg-zinc-100'}`}></div>
                    ))}
                  </div>
                </div>

                <h3 className="text-xl md:text-3xl text-zinc-900 font-bold mb-8 md:mb-12 leading-snug">{quizQuestions[currentStep].text}</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {quizQuestions[currentStep].options.map((opt, i) => (
                    <button key={i} onClick={() => handleQuizAnswer(opt.tag)} className="w-full text-left p-5 md:p-6 rounded-[1.2rem] md:rounded-[1.5rem] bg-white border border-zinc-100 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex justify-between items-center">
                      <span className="text-zinc-600 group-hover:text-indigo-700 font-medium text-sm md:text-base">{opt.text}</span>
                      <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                         <i className="fa-solid fa-arrow-right text-[10px] text-zinc-300 group-hover:text-indigo-500"></i>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {viewMode === 'result' && !isQuizLoading && (
          <div className="space-y-16 animate-in fade-in zoom-in-95 duration-700">
            <div className="text-center px-4">
              <span className="text-pink-500 text-[10px] font-black tracking-[0.4em] uppercase mb-4 block">Profile Discovery</span>
              <h2 className="text-3xl md:text-5xl font-bold text-zinc-900">Eskalasi Aura Anda</h2>
              <div className="mt-8 px-8 py-6 bg-white/50 border border-white rounded-[2rem] inline-block shadow-sm max-w-2xl">
                 <p className="text-indigo-700 font-bold text-lg md:text-xl italic leading-relaxed">"{psychologicalSummary}"</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
              {recommendations.map(p => (
                <PerfumeCard key={p.id} perfume={p} onClick={setSelectedPerfume} />
              ))}
            </div>

            <div className="text-center pt-8">
              <button onClick={resetQuiz} className="px-10 py-4 rounded-full border border-zinc-200 text-zinc-400 hover:text-indigo-600 hover:border-indigo-600 transition-all font-black text-[10px] uppercase tracking-[0.2em]">Coba Lagi</button>
            </div>
          </div>
        )}

        {viewMode === 'collection' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-zinc-100 pb-12">
              <div className="max-w-xl px-4">
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4">Perpustakaan Aroma</h2>
                <p className="text-zinc-400 text-sm md:text-base">Setiap botol adalah cerita yang menunggu untuk Anda ceritakan.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto px-4">
                <div className="relative group flex-grow">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors"></i>
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari masterpiece..." className="w-full sm:w-64 bg-zinc-50 border border-zinc-100 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm"/>
                </div>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-zinc-50 border border-zinc-100 rounded-2xl py-3 px-6 focus:outline-none focus:border-indigo-500 focus:bg-white text-sm text-zinc-600 font-medium cursor-pointer">
                  <option value="all">Keluarga Aroma</option>
                  {SCENT_FAMILIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
              {filteredKoleksi.map(p => (
                <PerfumeCard key={p.id} perfume={p} onClick={setSelectedPerfume} />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'about' && (
          <div className="max-w-4xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <div className="space-y-8 max-w-2xl px-6">
                <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">Tentang Parfumu</div>
                <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 leading-tight">Menerjemahkan Jiwa Menjadi Udara.</h2>
                <p className="text-zinc-500 text-base md:text-lg leading-relaxed">Parfumu membantu Anda menemukan aroma yang tidak hanya wangi, tapi mampu menjadi ekstensi dari jiwa Anda.</p>
             </div>

             <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-10 md:p-20 shadow-xl border border-zinc-50 relative overflow-hidden text-center mx-4">
                <div className="relative z-10 max-w-2xl mx-auto space-y-12">
                   <div className="space-y-4">
                      <p className="font-bold text-zinc-900 text-3xl md:text-4xl">BABE ODED</p>
                      <p className="text-[11px] text-zinc-400 font-black uppercase tracking-[0.4em]">Scent Explorer</p>
                      <div className="w-12 h-1 bg-indigo-500 mx-auto rounded-full"></div>
                   </div>
                   <p className="text-zinc-500 text-lg md:text-xl leading-relaxed italic">"Aroma adalah cara jiwa berbicara tanpa suara."</p>
                </div>
             </div>
          </div>
        )}
      </main>

      {selectedPerfume && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4">
          <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-md" onClick={() => setSelectedPerfume(null)}></div>
          <div className="relative bg-white border border-white w-full max-w-5xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] md:max-h-full overflow-y-auto md:overflow-visible">
             <button onClick={() => setSelectedPerfume(null)} className="absolute top-4 right-4 md:top-8 md:right-8 z-50 w-10 h-10 md:w-12 md:h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all shadow-lg"><i className="fa-solid fa-xmark text-lg"></i></button>
            <div className="md:w-1/2 bg-zinc-50 flex flex-col items-center justify-center p-10 md:p-20 relative overflow-hidden min-h-[300px] md:min-h-0">
               <div className="octarine-gradient opacity-10 blur-[100px] absolute inset-0"></div>
               <div className="relative z-10 text-center">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-white text-indigo-500 text-[9px] font-black uppercase tracking-widest mb-8 border border-zinc-100 shadow-sm">Psychological Profile</div>
                  <p className="text-zinc-600 text-xl md:text-2xl font-cinzel leading-relaxed italic">"{getPersuasivePitch(selectedPerfume)}"</p>
               </div>
            </div>
            <div className="md:w-1/2 p-8 md:p-16 overflow-y-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-2 leading-tight">{selectedPerfume.name}</h2>
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-10">{selectedPerfume.scent_family.join(' • ')}</p>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 font-black mb-4 flex items-center gap-4"><span className="w-8 h-0.5 bg-indigo-500/20 rounded-full"></span> TOP NOTES</h4>
                  <p className="text-zinc-600 text-sm font-medium">{selectedPerfume.top_notes.join(', ')}</p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 font-black mb-4 flex items-center gap-4"><span className="w-8 h-0.5 bg-pink-500/20 rounded-full"></span> HEART NOTES</h4>
                  <p className="text-zinc-600 text-sm font-medium">{selectedPerfume.middle_notes.join(', ')}</p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-zinc-400 font-black mb-4 flex items-center gap-4"><span className="w-8 h-0.5 bg-purple-500/20 rounded-full"></span> BASE NOTES</h4>
                  <p className="text-zinc-600 text-sm font-medium">{selectedPerfume.base_notes.join(', ')}</p>
                </div>
              </div>

              <div className="mt-12 md:mt-20 pt-10 border-t border-zinc-100">
                <div className="mb-8 p-4 bg-pink-50 border border-pink-100 rounded-2xl shadow-sm text-center">
                   <p className="text-pink-600 font-black text-[10px] md:text-xs uppercase tracking-widest animate-pulse">Temukan Promo Menarik di Marketplace melalui link di bawah ini</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <a href={selectedPerfume.shopee_url} target="_blank" className="bg-[#EE4D2D] hover:scale-105 text-white font-black py-4 md:py-5 rounded-2xl text-center text-[10px] tracking-[0.2em] transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2">SHOPEE</a>
                  <a href={selectedPerfume.tokopedia_url} target="_blank" className="bg-[#03AC0E] hover:scale-105 text-white font-black py-4 md:py-5 rounded-2xl text-center text-[10px] tracking-[0.2em] transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-2">TOKOPEDIA</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AiAssistant />

      <footer className="mt-20 md:mt-32 border-t border-zinc-100 py-16 px-6 text-center">
        <div className="flex flex-col items-center gap-4 mb-12">
           <ParfumuLogo />
           <h2 className="font-sans text-3xl md:text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">PARFUMU</h2>
        </div>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em]">Design by BABE ODED x Gemini</p>
      </footer>
    </div>
  );
};

export default App;
