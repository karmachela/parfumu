
import React, { useState, useRef, useEffect } from 'react';
import { getPerfumeRecommendation } from '../services/geminiService';
import { ChatMessage } from '../types';

const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Halo! Saya adalah Oracle Aroma Parfumu. Ceritakan wangi apa yang Anda suka atau suasana hati Anda saat ini, dan saya akan mencarikan jodoh parfum Anda.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await getPerfumeRecommendation(userMsg);
    
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${isOpen ? 'w-full max-w-md' : 'w-20'}`}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-20 h-20 rounded-full octarine-gradient shadow-2xl flex items-center justify-center text-white text-2xl animate-bounce hover:scale-110 transition-transform"
        >
          <i className="fa-solid fa-wand-magic-sparkles"></i>
        </button>
      ) : (
        <div className="bg-white border border-zinc-100 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col h-[600px] overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="octarine-gradient p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-wand-magic-sparkles text-white"></i>
              <h3 className="font-bold text-white text-sm uppercase tracking-widest">Aroma Oracle</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-colors">
              <i className="fa-solid fa-xmark text-xs"></i>
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex-grow p-6 overflow-y-auto space-y-6 bg-zinc-50/30"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-zinc-700 rounded-bl-none border border-zinc-100'
                }`}>
                  {msg.text.split('\n').map((line, idx) => (
                    <p key={idx} className={idx > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-[1.5rem] rounded-bl-none border border-zinc-100 flex gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-zinc-100 bg-white">
            <div className="flex gap-3">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tanyakan rekomendasi..."
                className="flex-grow bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center"
              >
                <i className="fa-solid fa-paper-plane text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAssistant;
