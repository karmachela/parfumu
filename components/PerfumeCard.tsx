
import React from 'react';
import { Perfume } from '../types';

interface PerfumeCardProps {
  perfume: Perfume;
  onClick: (perfume: Perfume) => void;
}

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

  return (
    <div 
      onClick={() => onClick(perfume)}
      className="card-glass rounded-[2rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer group flex flex-col h-full border-zinc-100/50"
    >
      <div className="relative aspect-square overflow-hidden bg-zinc-50/30 flex items-center justify-center p-8">
        <div className="w-full h-full octarine-gradient opacity-[0.05] blur-[50px] absolute inset-0"></div>
        
        <div className="relative z-10 text-center transition-transform duration-700 group-hover:scale-110">
          <i className={`${iconClass} text-7xl text-zinc-300 group-hover:text-indigo-600 transition-colors duration-500`}></i>
          <p className="mt-4 text-[9px] text-zinc-400 uppercase tracking-[0.4em] font-black">
            {primaryFamily}
          </p>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-zinc-800 text-[15px] font-bold group-hover:text-indigo-600 transition-colors leading-tight mb-4">
          {perfume.name}
        </h3>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {perfume.scent_family.map((fam, i) => (
            <span key={i} className="text-[8px] bg-zinc-100 px-2 py-0.5 rounded-full text-zinc-400 font-bold uppercase tracking-tighter">
              {fam}
            </span>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-50 flex items-center justify-end">
           <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PerfumeCard;
