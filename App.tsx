
import React, { useState, useMemo, useEffect } from 'react';
import { PERFUME_DATABASE } from './constants';
import { Perfume, ViewMode, QuizAnswers, QuizQuestion } from './types';
import PerfumeCard from './components/PerfumeCard';
import AiAssistant from './components/AiAssistant';
import { generateDynamicQuiz, getPersonalityInsight } from './services/geminiService';

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
  const [personalityInsight, setPersonalityInsight] = useState('');

  useEffect(() => {
    loadNewQuiz();
  }, []);

  const loadNewQuiz = async () => {
    setIsQuizLoading(true);
    setPersonalityInsight('');
    const questions = await generateDynamicQuiz();
    if (questions.length > 0) {
      setQuizQuestions(questions);
    }
    setIsQuizLoading(false);
  };

  const handleQuizAnswer = async (tag: string) => {
    const newAnswers = { ...quizAnswers, [currentStep]: tag };
    setQuizAnswers(newAnswers);
    
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setViewMode('result');
      setIsQuizLoading(true);
      const insight = await getPersonalityInsight(Object.values(newAnswers));
      setPersonalityInsight(insight);
      setIsQuizLoading(false);
    }
  };

  const resetQuiz = () => {
    setViewMode('quiz');
    setCurrentStep(0);
    setQuizAnswers({});
    loadNewQuiz();
  };

  const recommendations = useMemo(() => {
    if (viewMode !== 'result' || quizQuestions.length === 0) return [];
    const tags = Object.values(quizAnswers) as string[];
    const excludeTags = tags.filter(t => t.startsWith('exclude:')).map(t => t.replace('exclude:', ''));
    const preferenceTags = tags.filter(t => !t.includes(':'));

    return PERFUME_DATABASE.filter(perfume => {
      const hasExcluded = perfume.scent_family.some(f => excludeTags.includes(f));
      if (hasExcluded) return false;
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

  const getPsychologicalPitch = (perfume: Perfume) => {
    const family = perfume.scent_family[0];
    const stories: Record<string, string> = {
      'Floral': `Keanggunan yang tidak perlu suara keras. Aroma ini adalah pelukan batin yang menenangkan jiwa yang lembut.`,
      'Gourmand': `Manis yang memberdayakan. Kehadiran Anda akan menjadi memori lezat yang tak terlupakan oleh siapapun.`,
      'Fresh': `Energi murni dari fajar baru. Sangat cocok untuk Anda yang menghargai kebebasan dan kejernihan pikiran.`,
      'Woody': `Ketegasan yang membumi. Aroma ini adalah akar yang kuat di tengah badai dunia, menunjukkan kewibawaan sejati.`,
      'Aquatic': `Ketenangan samudera dalam genggaman. Pilihan tepat untuk jiwa yang haus akan kedamaian dan kedalaman.`,
    };
    return stories[family] || `Sebuah mahakarya aroma yang diciptakan khusus untuk melengkapi potongan puzzle kepribadian Anda yang hilang.`;
  };

  return (
    <div className="min-h-screen pb-12 flex flex-col relative text-zinc-800">
      <nav className="flex justify-between items-center px-8 py-6 sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-100">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => resetQuiz()}>
          <ParfumuLogo />
          <div>
            <h1 className="font-sans text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 transition-all">PARFUMU</h1>
            <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-zinc-400">Seni menemukan jati diri</p>
          </div>
        </div>
        <div className="flex gap-8">
          <button onClick={() => resetQuiz()} className={`text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'quiz' ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-900'}`}>Beranda</button>
          <button onClick={() => setViewMode('collection')} className={`text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'collection' ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-900'}`}>Koleksi</button>
          <button onClick={() => setViewMode('about')} className={`text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'about' ? 'text-indigo-600' : 'text-zinc-400 hover:text-zinc-900'}`}>Tentang</button>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        {isQuizLoading && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-pastel-mesh">
            <div className="relative">
              <div className="w-24 h-24 border-8 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-4 h-4 bg-indigo-600 rounded-full animate-ping"></div>
              </div>
            </div>
            <h2 className="mt-10 text-4xl font-black text-indigo-700 tracking-[0.5em] animate-pulse-soft">LOADING</h2>
            <p className="mt-4 text-zinc-500 font-bold uppercase tracking-widest text-xs">Mencari frekuensi aroma Anda...</p>
          </div>
        )}

        {viewMode === 'quiz' && !isQuizLoading && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-16">
              <span className="text-[10px] text-indigo-500 font-black tracking-[0.5em] uppercase mb-4 block">The Psychological Quest</span>
              <h2 className="text-5xl md:text-6xl font-bold text-zinc-900 mb-6 leading-tight">Jiwa Anda adalah Aroma.</h2>
              <p className="text-zinc-500 max-w-lg mx-auto text-lg leading-relaxed">Pintu menuju jati diri Anda terbuka lebar. Temukan wangi yang menjadi saksi bisu perjalanan hidup Anda.</p>
              <div className="w-12 h-1 bg-zinc-200 mx-auto mt-12 rounded-full"></div>
            </div>

            {quizQuestions.length > 0 && (
              <div className="card-glass rounded-[3rem] p-8 md:p-16 border-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 octarine-gradient opacity-5 blur-3xl"></div>
                
                <div className="flex justify-between items-center mb-12">
                  <div className="flex flex-col">
                    <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">Soul Mapping</span>
                    <span className="text-zinc-900 font-bold">Progress {currentStep + 1} <span className="text-zinc-300">/ 10</span></span>
                  </div>
                  <div className="flex gap-1.5">
                    {quizQuestions.map((_, i) => (
                      <div key={i} className={`h-1.5 w-4 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-indigo-600 w-8' : 'bg-zinc-100'}`}></div>
                    ))}
                  </div>
                </div>

                <h3 className="text-2xl md:text-3xl text-zinc-900 font-bold mb-12 leading-snug">{quizQuestions[currentStep].text}</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {quizQuestions[currentStep].options.map((opt, i) => (
                    <button key={i} onClick={() => handleQuizAnswer(opt.tag)} className="w-full text-left p-6 rounded-[1.5rem] bg-white border border-zinc-100 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group flex justify-between items-center">
                      <span className="text-zinc-600 group-hover:text-indigo-700 font-medium">{opt.text}</span>
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
            <div className="text-center">
              <span className="text-pink-500 text-[10px] font-black tracking-[0.4em] uppercase mb-4 block">Discovery Completed</span>
              <h2 className="text-4xl md:text-5xl font-bold text-zinc-900">Eskalasi Aura Anda</h2>
              <div className="mt-8 px-6 py-4 bg-white/50 border border-white rounded-[2rem] inline-block shadow-sm">
                 <p className="text-indigo-700 font-bold text-xl italic leading-relaxed">"{personalityInsight}"</p>
              </div>
              <p className="text-zinc-400 mt-6 max-w-lg mx-auto text-sm font-medium">Kurasi eksklusif ini adalah jawaban atas setiap keinginan batin Anda.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
              {recommendations.map(p => (
                <PerfumeCard key={p.id} perfume={p} onClick={setSelectedPerfume} />
              ))}
            </div>

            <div className="text-center pt-8">
              <button onClick={resetQuiz} className="px-10 py-4 rounded-full border border-zinc-200 text-zinc-400 hover:text-indigo-600 hover:border-indigo-600 transition-all font-black text-[10px] uppercase tracking-[0.2em]">Ulangi Perjalanan Aroma (Kuis Baru)</button>
            </div>
          </div>
        )}

        {viewMode === 'collection' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-zinc-100 pb-12">
              <div className="max-w-xl">
                <h2 className="text-4xl font-bold text-zinc-900 mb-4">Perpustakaan Aroma</h2>
                <p className="text-zinc-400">Jelajahi setiap spektrum wangi dari koleksi terkurasi kami.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative group">
                  <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-indigo-500 transition-colors"></i>
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari masterpiece..." className="w-full sm:w-72 bg-zinc-50 border border-zinc-100 rounded-2xl py-3 pl-12 pr-6 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm"/>
                </div>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-zinc-50 border border-zinc-100 rounded-2xl py-3 px-6 focus:outline-none focus:border-indigo-500 focus:bg-white text-sm text-zinc-600 font-medium cursor-pointer">
                  <option value="all">Semua Keluarga Aroma</option>
                  <option value="Floral">Floral</option>
                  <option value="Gourmand">Gourmand</option>
                  <option value="Fresh">Fresh</option>
                  <option value="Woody">Woody</option>
                  <option value="Aquatic">Aquatic</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 px-2">
              {filteredKoleksi.map(p => (
                <PerfumeCard key={p.id} perfume={p} onClick={setSelectedPerfume} />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'about' && (
          <div className="max-w-4xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <div className="space-y-8 max-w-2xl">
                <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">Tentang Parfumu</div>
                <h2 className="text-5xl font-bold text-zinc-900 leading-tight">Menerjemahkan Jiwa Menjadi Udara.</h2>
                <p className="text-zinc-500 text-lg leading-relaxed">Parfumu lahir dari keyakinan bahwa setiap individu memiliki lanskap emosional yang unik. Kami membantu Anda menemukan aroma yang tidak hanya wangi, tapi mampu menjadi ekstensi dari jiwa Anda.</p>
             </div>

             <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-xl border border-zinc-50 relative overflow-hidden text-center">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-pink-50 rounded-full blur-3xl"></div>
                <div className="relative z-10 max-w-2xl mx-auto space-y-12">
                   <div className="space-y-4">
                      <p className="font-bold text-zinc-900 text-4xl">BABE ODED</p>
                      <p className="text-[11px] text-zinc-400 font-black uppercase tracking-[0.4em]">Scent Explorer</p>
                      <div className="w-12 h-1 bg-indigo-500 mx-auto rounded-full"></div>
                   </div>
                   <div className="space-y-8">
                      <h3 className="text-3xl font-bold italic text-zinc-800 leading-snug">"Art Teacher turned Scent Explorer"</h3>
                      <p className="text-zinc-500 text-xl leading-relaxed italic">
                        Lahir dari kanvas, jatuh cinta pada aroma.<br/>
                        Melukis emosi lewat wangi, Merangkai ingatan di udara.<br/><br/>
                        Aroma bukan hiasan — ia adalah identitas.
                      </p>
                      <div className="pt-12 border-t border-zinc-100">
                         <p className="text-[11px] font-black uppercase tracking-widest text-indigo-500 mb-8">Kenalan Yuk dengan BABE ODED</p>
                         <div className="flex flex-wrap justify-center gap-6 text-2xl">
                            <a href={SOCIAL_LINKS.instagram} target="_blank" className="text-pink-600 hover:scale-110 transition-transform"><i className="fa-brands fa-instagram"></i></a>
                            <a href={SOCIAL_LINKS.tiktok} target="_blank" className="text-zinc-900 hover:scale-110 transition-transform"><i className="fa-brands fa-tiktok"></i></a>
                            <a href={SOCIAL_LINKS.youtube} target="_blank" className="text-red-600 hover:scale-110 transition-transform"><i className="fa-brands fa-youtube"></i></a>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {selectedPerfume && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-md" onClick={() => setSelectedPerfume(null)}></div>
          <div className="relative bg-white border border-white w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
             <button onClick={() => setSelectedPerfume(null)} className="absolute top-8 right-8 z-10 w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"><i className="fa-solid fa-xmark text-lg"></i></button>
            <div className="md:w-1/2 bg-zinc-50 flex flex-col items-center justify-center p-12 md:p-20 relative overflow-hidden">
               <div className="octarine-gradient opacity-10 blur-[100px] absolute inset-0"></div>
               <div className="relative z-10 text-center">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-white text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-8 border border-zinc-100 shadow-sm">Psychological Profile</div>
                  <p className="text-zinc-600 text-2xl font-cinzel leading-relaxed italic">"{getPsychologicalPitch(selectedPerfume)}"</p>
               </div>
            </div>
            <div className="md:w-1/2 p-12 md:p-20 overflow-y-auto max-h-[80vh] md:max-h-full">
              <h2 className="text-4xl font-bold text-zinc-900 mb-2">{selectedPerfume.name}</h2>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em] mb-10">{selectedPerfume.scent_family.join(' • ')}</p>
              
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

              <div className="mt-16 pt-10 border-t border-zinc-100">
                <p className="text-[11px] font-black uppercase tracking-widest text-center text-pink-600 mb-6 bg-pink-50 py-2 rounded-lg animate-pulse">Temukan Promo Menarik di Marketplace melalui link di bawah ini</p>
                <div className="grid grid-cols-2 gap-4">
                  <a href={selectedPerfume.shopee_url} target="_blank" className="bg-[#EE4D2D] hover:scale-105 text-white font-black py-4 rounded-2xl text-center text-[10px] tracking-[0.2em] transition-all shadow-xl shadow-orange-500/10 flex items-center justify-center gap-2"><i className="fa-solid fa-cart-shopping"></i> SHOPEE</a>
                  <a href={selectedPerfume.tokopedia_url} target="_blank" className="bg-[#03AC0E] hover:scale-105 text-white font-black py-4 rounded-2xl text-center text-[10px] tracking-[0.2em] transition-all shadow-xl shadow-green-500/10 flex items-center justify-center gap-2"><i className="fa-solid fa-cart-shopping"></i> TOKOPEDIA</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AiAssistant />

      <footer className="mt-32 border-t border-zinc-100 py-16 px-6 text-center">
        <div className="flex flex-col items-center gap-4 mb-12">
           <ParfumuLogo />
           <h2 className="font-sans text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">PARFUMU</h2>
        </div>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em]">Design by BABE ODED x Gemini</p>
        <div className="mt-12 flex justify-center gap-8 text-zinc-300 text-xl">
           <a href={SOCIAL_LINKS.instagram} target="_blank" className="hover:text-pink-600 transition-colors"><i className="fa-brands fa-instagram"></i></a>
           <a href={SOCIAL_LINKS.tiktok} target="_blank" className="hover:text-zinc-900 transition-colors"><i className="fa-brands fa-tiktok"></i></a>
           <a href={SOCIAL_LINKS.youtube} target="_blank" className="hover:text-red-600 transition-colors"><i className="fa-brands fa-youtube"></i></a>
        </div>
      </footer>
    </div>
  );
};

export default App;
