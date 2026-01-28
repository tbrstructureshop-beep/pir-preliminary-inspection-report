
import React, { useState, useEffect } from 'react';
import { Finding } from '../types';
import { Loader2 } from 'lucide-react';

interface Props {
  findings: Finding[];
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
}

const FindingSection: React.FC<Props> = ({ findings, selectedIndex, onSelect }) => {
  const [imageLoading, setImageLoading] = useState(false);
  const currentFinding = selectedIndex !== null ? findings[selectedIndex] : null;

  // Reset image loading state when a new finding is selected
  useEffect(() => {
    if (currentFinding) {
      setImageLoading(true);
    }
  }, [selectedIndex, currentFinding]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">Selected Finding</h3>
      </div>
      <div className="p-6 space-y-6">
        <div className="max-w-md">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Select Inspection Point</label>
          <select 
            className="w-full bg-white border border-slate-300 text-slate-900 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 shadow-sm transition-all outline-none"
            value={selectedIndex ?? ''}
            onChange={(e) => onSelect(e.target.value === '' ? null : parseInt(e.target.value))}
          >
            <option value="">-- Choose Finding --</option>
            {findings.map((f, i) => (
              <option key={i} value={i}>{f.finding}</option>
            ))}
          </select>
        </div>

        {currentFinding ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start animate-in fade-in duration-500">
            <div className="md:col-span-1">
              <div className="relative aspect-video bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-sm group">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 z-10">
                    <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                  </div>
                )}
                <img 
                  src={currentFinding.image || `https://picsum.photos/400/300?random=${selectedIndex}`} 
                  alt="Finding Visual"
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setImageLoading(false)}
                />
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-teal-700 uppercase tracking-widest">Observation Description</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 min-h-[80px] leading-relaxed shadow-inner">
                  {currentFinding.description}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-teal-700 uppercase tracking-widest">Required Action</label>
                <div className="bg-teal-50/30 border border-teal-100 rounded-xl p-4 text-sm text-teal-900 font-medium min-h-[60px] leading-relaxed">
                  {currentFinding.action}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-xl p-12 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">Please select a finding from the dropdown to view details and materials.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindingSection;
