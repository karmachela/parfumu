
import React from 'react';
import { Perfume } from '../types';

interface PerfumeCardProps {
  perfume: Perfume;
  onClick: (perfume: Perfume) => void;
}

const familyIcons: Record<string, { icon: string; color: string }> = {
  'Floral': { icon: 'fa-solid fa-fan', color: 'from-pink-400 to-rose-600' },
  'Fruity': { icon: 'fa-solid fa-apple-whole', color: 'from-orange-400 to-red-500' },
  'Fresh': { icon: 'fa-solid fa-wind', color: 'from-cyan-400 to-blue-500' },
  'Aquatic': { icon: 'fa-solid fa-droplet', color: 'from-blue-400 to-indigo-600' },
  'Woody': { icon: 'fa-solid fa-tree', color: 'from-emerald-500 to-teal-700' },
  'Spicy': { icon: 'fa-solid fa-pepper-hot', color: 'from-red-500 to-orange-700' },
  'Gourmand': { icon: 'fa-solid fa-cookie', color: 'from-amber-400 to-orange-600' },
  'Amber': { icon: 'fa-solid fa-gem', color: 'from-yellow-400 to-amber-600' },
  'Green': { icon: 'fa-solid fa-seedling', color: 'from-green-400 to-emerald-600' },
  'Tea': { icon: 'fa-solid fa-leaf', color: 'from-lime-400 to-green-600' },
  'Musk': { icon: 'fa-solid fa-cloud', color: 'from-slate-300 to-zinc-500' },
  'Powdery': { icon: 'fa-solid fa-feather', color: 'from-violet-300 to-purple-500' },
  'Tropical': { icon: 'fa-solid fa-sun', color: 'from-yellow-400 to-orange-500' },
  'Earth': { icon: 'fa-solid fa-mountain', color: 'from-stone-500 to-neutral-700' }
};

const PerfumeCard: React.FC<PerfumeCardProps> = ({ perfume, onClick }) => {
  const primaryFamily = perfume.scent_family?.[0] || 'Essence';
  const iconData = familyIcons[primaryFamily] || { icon: 'fa-solid fa-bottle-droplet', color: 'from-indigo-400 to-purple-600' };

  return (
    <div 
      onClick={() => onClick(perfume)}
      className="card-glass rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer group flex flex-col aspect-square border-zinc-100/50 shadow-sm hover:shadow-xl relative"
    >
      <div className="flex-grow flex items-center justify-center p-6 relative overflow-hidden bg-zinc-50/20">
        <div className={`absolute inset-0 bg-gradient-to-br ${iconData.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
        
        <div className="relative z-10 text-center transition-all duration-700 group-hover:scale-110">
          <i className={`${iconData.icon} text-6xl md:text-7xl bg-gradient-to-br ${iconData.color} bg-clip-text text-transparent drop-shadow-sm`}></i>
        </div>
      </div>

      <div className="p-3 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center border-t border-zinc-50">
        <h3 className="text-zinc-800 text-[10px] md:text-[11px] font-black uppercase tracking-tighter truncate w-full text-center">
          {perfume.name}
        </h3>
        <span className="text-indigo-600 text-[8px] md:text-[9px] font-bold uppercase tracking-widest mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
          Lihat Detail Parfum
        </span>
      </div>
    </div>
  );
};

export default PerfumeCard;
