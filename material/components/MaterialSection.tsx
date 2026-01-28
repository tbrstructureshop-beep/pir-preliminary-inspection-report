
import React, { useState, useEffect } from 'react';
import { Material } from '../types';
import { Plus, Trash2, RotateCcw, Save, Edit2, X, Loader2, CheckSquare, Square } from 'lucide-react';

interface Props {
  materials: Material[];
  isEditMode: boolean;
  onToggleEdit: () => void;
  onUpdateMaterial: (index: number, updated: Material) => void;
  onAddRow: () => void;
  onRemoveRows: (indices: number[]) => void;
  onRemoveLastRow: () => void;
  onReset: () => void;
  onSave: () => void;
  isLoading?: boolean;
}

const MaterialSection: React.FC<Props> = ({
  materials,
  isEditMode,
  onToggleEdit,
  onUpdateMaterial,
  onAddRow,
  onRemoveRows,
  onRemoveLastRow,
  onReset,
  onSave,
  isLoading = false
}) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // Reset selection when exiting edit mode
  useEffect(() => {
    if (!isEditMode) {
      setSelectedIndices(new Set());
    }
  }, [isEditMode]);

  // Cleanup stale selections if materials are removed
  useEffect(() => {
    setSelectedIndices(prev => {
      const next = new Set<number>();
      prev.forEach(idx => {
        if (idx < materials.length) next.add(idx);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [materials.length]);

  const handleInputChange = (index: number, field: keyof Material, value: string) => {
    onUpdateMaterial(index, { ...materials[index], [field]: value });
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === materials.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(materials.map((_, i) => i)));
    }
  };

  const toggleSelectRow = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedIndices(next);
  };

  const handleDeleteSelected = () => {
    // Adding explicit types (a: number, b: number) to fix arithmetic operation error
    // which occurs when types are not correctly inferred for numeric sorting.
    const indices = Array.from(selectedIndices).sort((a: number, b: number) => b - a);
    onRemoveRows(indices);
    setSelectedIndices(new Set());
  };

  const handleIndividualDelete = (idx: number) => {
    onRemoveRows([idx]);
  };

  const isAllSelected = materials.length > 0 && selectedIndices.size === materials.length;
  const isSomeSelected = selectedIndices.size > 0 && selectedIndices.size < materials.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[300px] relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-20">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
            <span className="text-sm font-semibold text-slate-600 uppercase tracking-widest">Updating Records...</span>
          </div>
        </div>
      )}

      {/* Header Container */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-800">Required Materials</h3>
            {isEditMode && selectedIndices.size > 0 && (
              <span className="text-xs font-semibold text-teal-600">{selectedIndices.size} items selected</span>
            )}
          </div>
          <button 
            onClick={onToggleEdit}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isEditMode 
                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-100'
            }`}
          >
            {isEditMode ? (
              <><X className="w-4 h-4" /> <span>Cancel Edit</span></>
            ) : (
              <><Edit2 className="w-4 h-4" /> <span>Edit Materials</span></>
            )}
          </button>
        </div>

        {/* MOBILE SELECT ALL BAR (Conditional) */}
        {isEditMode && (
          <div className="lg:hidden flex items-center justify-between p-3 bg-teal-50 border border-teal-100 rounded-xl animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={toggleSelectAll}>
              <div className="text-teal-600">
                {isAllSelected ? <CheckSquare className="w-5 h-5 fill-current" /> : isSomeSelected ? <CheckSquare className="w-5 h-5 opacity-50" /> : <Square className="w-5 h-5" />}
              </div>
              <label className="text-sm font-bold text-teal-800 uppercase tracking-tight cursor-pointer">
                Select All ({materials.length})
              </label>
            </div>
            {selectedIndices.size > 0 && (
              <button 
                onClick={handleDeleteSelected}
                className="flex items-center space-x-1.5 text-[10px] font-black text-rose-600 bg-white px-3 py-1.5 rounded-full border border-rose-200 shadow-sm hover:bg-rose-50 active:scale-95 transition-all"
              >
                <Trash2 className="w-3 h-3" />
                <span>DELETE {selectedIndices.size}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Desktop Table View - Center Aligned */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-teal-600 text-white">
              {isEditMode && (
                <th className="px-4 py-3 border-r border-teal-500 w-12">
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-teal-400 text-teal-600 focus:ring-teal-500 cursor-pointer accent-white"
                      checked={isAllSelected}
                      ref={(el) => { if (el) el.indeterminate = isSomeSelected; }}
                      onChange={toggleSelectAll}
                    />
                  </div>
                </th>
              )}
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-teal-500 w-12">No</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-teal-500 min-w-[140px]">Part No.</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-teal-500 min-w-[200px]">Description</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-teal-500 w-24">Qty</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-teal-500 w-24">UoM</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-teal-500 min-w-[140px]">Avail.</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-teal-500 min-w-[100px]">PR</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-teal-500 min-w-[100px]">PO</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-teal-500 min-w-[200px]">Note</th>
              <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-teal-500 min-w-[140px]">Date</th>
              {isEditMode && <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider w-12">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {materials.map((mat, idx) => (
              <tr 
                key={idx} 
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-teal-50/40 transition-colors ${selectedIndices.has(idx) ? 'bg-teal-50' : ''}`}
              >
                {isEditMode && (
                  <td className="px-4 py-2 border-r border-slate-100">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      checked={selectedIndices.has(idx)}
                      onChange={() => toggleSelectRow(idx)}
                    />
                  </td>
                )}
                <td className="px-4 py-3 text-sm font-medium text-slate-500 border-r border-slate-100">{idx + 1}</td>
                <td className="px-4 py-2 border-r border-slate-100">
                  <input 
                    readOnly={!isEditMode}
                    value={mat.partNo}
                    onChange={(e) => handleInputChange(idx, 'partNo', e.target.value)}
                    className={`w-full bg-transparent text-sm border-none focus:ring-0 px-0 text-center placeholder:text-slate-300 ${!isEditMode ? 'cursor-default' : ''}`}
                    placeholder="PN-..."
                  />
                </td>
                <td className="px-4 py-2 border-r border-slate-100">
                  <input 
                    readOnly={!isEditMode}
                    value={mat.description}
                    onChange={(e) => handleInputChange(idx, 'description', e.target.value)}
                    className={`w-full bg-transparent text-sm border-none focus:ring-0 px-0 text-center placeholder:text-slate-300 ${!isEditMode ? 'cursor-default' : ''}`}
                    placeholder="Describe..."
                  />
                </td>
                <td className="px-4 py-2 border-r border-slate-100">
                  <input 
                    readOnly={!isEditMode}
                    type="number"
                    value={mat.qty}
                    onChange={(e) => handleInputChange(idx, 'qty', e.target.value)}
                    className={`w-full bg-transparent text-sm border-none focus:ring-0 px-0 text-center placeholder:text-slate-300 ${!isEditMode ? 'cursor-default' : ''}`}
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-2 border-r border-slate-100">
                  <input 
                    readOnly={!isEditMode}
                    value={mat.uom}
                    onChange={(e) => handleInputChange(idx, 'uom', e.target.value)}
                    className={`w-full bg-transparent text-sm border-none focus:ring-0 px-0 text-center placeholder:text-slate-300 ${!isEditMode ? 'cursor-default' : ''}`}
                    placeholder="EA"
                  />
                </td>
                <td className="px-4 py-2 border-r border-slate-100">
                  <input 
                    readOnly={!isEditMode}
                    value={mat.availability}
                    onChange={(e) => handleInputChange(idx, 'availability', e.target.value)}
                    className={`w-full bg-transparent text-sm border-none focus:ring-0 px-0 text-center placeholder:text-slate-300 ${!isEditMode ? 'cursor-default' : ''}`}
                    placeholder="Stock?"
                  />
                </td>
                <td className="px-4 py-2 border-r border-slate-100">
                  <input 
                    readOnly={!isEditMode}
                    value={mat.pr}
                    onChange={(e) => handleInputChange(idx, 'pr', e.target.value)}
                    className={`w-full bg-transparent text-sm border-none focus:ring-0 px-0 text-center placeholder:text-slate-300 ${!isEditMode ? 'cursor-default' : ''}`}
                    placeholder="PR"
                  />
                </td>
                <td className="px-4 py-2 border-r border-slate-100">
                  <input 
                    readOnly={!isEditMode}
                    value={mat.po}
                    onChange={(e) => handleInputChange(idx, 'po', e.target.value)}
                    className={`w-full bg-transparent text-sm border-none focus:ring-0 px-0 text-center placeholder:text-slate-300 ${!isEditMode ? 'cursor-default' : ''}`}
                    placeholder="PO"
                  />
                </td>
                <td className="px-4 py-2 border-r border-slate-100">
                  <input 
                    readOnly={!isEditMode}
                    value={mat.note}
                    onChange={(e) => handleInputChange(idx, 'note', e.target.value)}
                    className={`w-full bg-transparent text-sm border-none focus:ring-0 px-0 text-center placeholder:text-slate-300 ${!isEditMode ? 'cursor-default' : ''}`}
                    placeholder="..."
                  />
                </td>
                <td className="px-4 py-2 border-r border-slate-100">
                  <input 
                    readOnly={!isEditMode}
                    type="date"
                    value={mat.dateChange}
                    onChange={(e) => handleInputChange(idx, 'dateChange', e.target.value)}
                    className={`w-full bg-transparent text-xs border-none focus:ring-0 px-0 text-center ${!isEditMode ? 'cursor-default' : ''}`}
                  />
                </td>
                {isEditMode && (
                  <td className="px-4 py-2">
                    <button 
                      onClick={() => handleIndividualDelete(idx)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                      title="Delete Row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Grid View - Editable Cards */}
      <div className="lg:hidden p-4 space-y-4 bg-slate-50/30">
        {materials.map((mat, idx) => (
          <div 
            key={idx} 
            className={`bg-white rounded-xl border transition-all duration-200 shadow-sm overflow-hidden flex flex-col relative ${selectedIndices.has(idx) ? 'border-teal-500 ring-2 ring-teal-500/10' : 'border-slate-200'}`}
          >
            {/* Card Header */}
            <div className={`px-4 py-3 border-b flex justify-between items-center transition-colors ${selectedIndices.has(idx) ? 'bg-teal-50 border-teal-100' : 'bg-slate-50 border-slate-100'}`}>
              <div 
                className="flex items-center space-x-3 flex-grow cursor-pointer"
                onClick={() => isEditMode && toggleSelectRow(idx)}
              >
                {isEditMode && (
                  <div className="text-teal-600">
                    {selectedIndices.has(idx) ? <CheckSquare className="w-5 h-5 fill-current" /> : <Square className="w-5 h-5" />}
                  </div>
                )}
                <span className={`text-xs font-black uppercase tracking-widest ${selectedIndices.has(idx) ? 'text-teal-700' : 'text-slate-500'}`}>
                  Record {idx + 1}
                </span>
              </div>
              
              {isEditMode && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIndividualDelete(idx);
                  }}
                  className="p-2 text-rose-400 hover:text-rose-600 active:scale-90 transition-all bg-white rounded-lg border border-rose-100 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Editable Card Body */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Part No */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Part No</label>
                  {isEditMode ? (
                    <input 
                      value={mat.partNo}
                      onChange={(e) => handleInputChange(idx, 'partNo', e.target.value)}
                      className="w-full text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-teal-500 outline-none"
                    />
                  ) : (
                    <div className="text-sm font-semibold text-slate-700 truncate">{mat.partNo || '—'}</div>
                  )}
                </div>

                {/* Qty & UoM */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Quantity</label>
                  {isEditMode ? (
                    <div className="flex gap-1">
                      <input 
                        type="number"
                        value={mat.qty}
                        onChange={(e) => handleInputChange(idx, 'qty', e.target.value)}
                        className="w-full text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                      <input 
                        value={mat.uom}
                        onChange={(e) => handleInputChange(idx, 'uom', e.target.value)}
                        className="w-16 text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-1 py-1 focus:ring-1 focus:ring-teal-500 outline-none uppercase text-center"
                        placeholder="UoM"
                      />
                    </div>
                  ) : (
                    <div className="text-sm font-semibold text-slate-700">{mat.qty || '0'} {mat.uom || 'EA'}</div>
                  )}
                </div>

                {/* Description */}
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Description</label>
                  {isEditMode ? (
                    <textarea 
                      value={mat.description}
                      onChange={(e) => handleInputChange(idx, 'description', e.target.value)}
                      rows={2}
                      className="w-full text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-teal-500 outline-none resize-none"
                    />
                  ) : (
                    <div className="text-sm font-medium text-slate-600 line-clamp-2 leading-relaxed">
                      {mat.description || 'No description provided'}
                    </div>
                  )}
                </div>

                {/* Advanced Fields - Only visible or grouped on mobile */}
                <div className="col-span-2 grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Availability</label>
                    {isEditMode ? (
                      <input 
                        value={mat.availability}
                        onChange={(e) => handleInputChange(idx, 'availability', e.target.value)}
                        className="w-full text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none"
                      />
                    ) : (
                      <div className="text-xs font-bold text-slate-600">{mat.availability || '—'}</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">PR / PO</label>
                    {isEditMode ? (
                      <div className="flex gap-1">
                        <input value={mat.pr} onChange={(e) => handleInputChange(idx, 'pr', e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-1 py-1" placeholder="PR" />
                        <input value={mat.po} onChange={(e) => handleInputChange(idx, 'po', e.target.value)} className="w-full text-xs bg-slate-50 border border-slate-200 rounded px-1 py-1" placeholder="PO" />
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-slate-600">{mat.pr || mat.po ? `${mat.pr || '-'}/${mat.po || '-'}` : '—'}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-3">
        {isEditMode ? (
          <>
            <button 
              onClick={onAddRow}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> <span>Add New</span>
            </button>
            
            {selectedIndices.size > 0 ? (
              <button 
                onClick={handleDeleteSelected}
                className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all animate-in zoom-in-95 duration-200 shadow-lg shadow-rose-100"
              >
                <Trash2 className="w-4 h-4" /> <span>Delete Selected ({selectedIndices.size})</span>
              </button>
            ) : (
              <button 
                onClick={onRemoveLastRow}
                className="flex items-center space-x-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              >
                <Trash2 className="w-4 h-4" /> <span>Remove Last</span>
              </button>
            )}

            <button 
              onClick={onReset}
              className="flex items-center space-x-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            >
              <RotateCcw className="w-4 h-4" /> <span>Reset All</span>
            </button>
            
            <div className="flex-grow" />
            
            <button 
              onClick={onSave}
              className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-teal-100 transition-all w-full sm:w-auto justify-center"
            >
              <Save className="w-4 h-4" /> <span>Save Changes</span>
            </button>
          </>
        ) : (
          <div className="text-sm text-slate-500 font-medium py-1">
            Displaying {materials.length} material records. Use 'Edit' to modify or delete.
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialSection;
