
import React from 'react';
import { Perfume } from '../types';

interface PerfumeCardProps {
  perfume: Perfume;
  onClick: (perfume: Perfume) => void;
}

const familyColors: Record<string, string> = {
  'Floral': 'text-pink-500',
  'Fruity': 'text-orange-500',
  'Fresh': 'text-emerald-400',
  'Aquatic': 'text-blue-500',
  'Woody': 'text-amber-800',
  'Spicy': 'text-red-600',
  'Gourmand': 'text-yellow-700',
  'Amber': 'text-indigo-600',
  'Green': 'text-green-500',
  'Tea': 'text-teal-600',
  'Musk': 'text-slate-400',
  'Powdery': 'text-purple-300',
  'Tropical': 'text-yellow-400',
  'Earth': 'text-stone-600'
};

const familyIcons: Record<string, string> = {
  'Floral': 'fa-solid fa-fan',
  'Fruity': 'fa-solid fa-apple-whole',
  'Fresh': 'fa-solid fa-wind',
  'Aquatic': 'fa-solid fa-droplet',
  'Woody': 'fa-solid fa-tree',
  'Spicy': 'fa-solid fa-pepper-hot',
  'Gourmand': 'fa-solid fa-cookie',
  'Amber': 'fa-solid fa-gem',
  'Green': 'fa-solid fa-seedling',
  'Tea': 'fa-solid fa-leaf',
  'Musk': 'fa-solid fa-cloud',
  'Powdery': 'fa-solid fa-feather',
  'Tropical': 'fa-solid fa-sun',
  'Earth': 'fa-solid fa-mountain'
};

const PerfumeCard: React.FC<PerfumeCardProps> = ({ perfume, onClick }) => {
  const primaryFamily = perfume.scent_family?.[0] || 'Essence';
  const iconClass = familyIcons[primaryFamily] || 'fa-solid fa-bottle-droplet';
  const colorClass = familyColors[primaryFamily] || 'text-zinc-400';

  return (
    <div 
      onClick={() => onClick(perfume)}
      className="card-glass rounded-[1.2rem] overflow-hidden transition-all duration-500 hover:-translate-y-1.5 cursor-pointer group flex flex-col h-full border-zinc-100/50 max-w-[240px] mx-auto w-full"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-50/30 flex items-center justify-center p-4">
        <div className="w-full h-full octarine-gradient opacity-[0.05] blur-[40px] absolute inset-0"></div>
        
        <div className="relative z-10 text-center transition-transform duration-700 group-hover:scale-110">
          <i className={`${iconClass} ${colorClass} text-7xl opacity-90 group-hover:opacity-100 transition-all duration-500 filter drop-shadow-xl`}></i>
          <p className={`mt-4 text-[7px] ${colorClass} uppercase tracking-[0.4em] font-black`}>
            {primaryFamily}
          </p>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-zinc-800 text-[13px] font-bold group-hover:text-indigo-600 transition-colors leading-tight mb-2 min-h-[2.5em] line-clamp-2">
          {perfume.name}
        </h3>

        <div className="flex flex-wrap gap-1 mt-auto">
          {perfume.scent_family.slice(0, 1).map((fam, i) => (
            <span key={i} className="text-[6px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-400 font-black uppercase tracking-tighter">
              {fam}
            </span>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center justify-between">
           <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 opacity-100">
             Lihat Detail Parfum
           </span>
           <div className="w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              <i className="fa-solid fa-arrow-right text-[7px]"></i>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PerfumeCard;
