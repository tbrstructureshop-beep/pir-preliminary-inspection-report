
import React, { useState, useEffect, useCallback } from 'react';
import { GeneralData, Finding, Material, DashboardData } from './types';
import { fetchDashboardData } from './services/api';
import GeneralInfoCard from './components/GeneralInfoCard';
import FindingSection from './components/FindingSection';
import MaterialSection from './components/MaterialSection';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [transitionLoading, setTransitionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFindingIndex, setSelectedFindingIndex] = useState<number | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentMaterials, setCurrentMaterials] = useState<Material[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDashboardData();
      setData(result);
      setSelectedFindingIndex(null);
      setCurrentMaterials([]);
      setIsEditMode(false);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data. Please check your connection.");
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFindingChange = (index: number | null) => {
    if (index === selectedFindingIndex) return;
    
    setTransitionLoading(true);
    setSelectedFindingIndex(index);
    setIsEditMode(false);
    
    if (index !== null && data) {
      const findingName = data.findings[index].finding;
      const materials = data.materialsByFinding[findingName] || [];
      setCurrentMaterials(materials.length > 0 ? [...materials] : [createEmptyMaterial()]);
    } else {
      setCurrentMaterials([]);
    }

    setTimeout(() => {
      setTransitionLoading(false);
    }, 400);
  };

  const createEmptyMaterial = (): Material => ({
    partNo: '',
    description: '',
    qty: '',
    uom: '',
    availability: '',
    pr: '',
    po: '',
    note: '',
    dateChange: new Date().toISOString().split('T')[0]
  });

  const handleUpdateMaterial = (index: number, updated: Material) => {
    const next = [...currentMaterials];
    next[index] = updated;
    setCurrentMaterials(next);
  };

  const handleAddRow = () => {
    setCurrentMaterials([...currentMaterials, createEmptyMaterial()]);
  };

  const handleDeleteRows = (indices: number[]) => {
    if (indices.length === 0) return;
    
    // Check if any of the rows being deleted have significant data
    const hasData = indices.some(idx => {
      const m = currentMaterials[idx];
      return m && (m.partNo || m.description || m.qty);
    });

    if (hasData) {
      const msg = indices.length === 1 
        ? "This row contains data. Are you sure you want to delete it?" 
        : `Are you sure you want to delete ${indices.length} selected items? Some contain data.`;
      if (!window.confirm(msg)) return;
    }

    const next = currentMaterials.filter((_, idx) => !indices.includes(idx));
    setCurrentMaterials(next.length > 0 ? next : [createEmptyMaterial()]);
  };

  const handleRemoveLastRow = () => {
    if (currentMaterials.length === 0) return;
    handleDeleteRows([currentMaterials.length - 1]);
  };

  const handleResetMaterials = () => {
    if (window.confirm("Reset all materials for this finding? This will revert to a single empty row.")) {
      setCurrentMaterials([createEmptyMaterial()]);
    }
  };

  const handleSave = () => {
    console.log("Saving data for finding:", data?.findings[selectedFindingIndex!]?.finding);
    console.log("Materials:", currentMaterials);
    alert("Data saved successfully! (Check console for details)");
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-6">
        <div className="relative">
          <div className="absolute inset-0 blur-xl bg-teal-400/30 rounded-full animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-teal-600 animate-spin relative" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">PIR DASHBOARD <span className="text-teal-600">PRO</span></h2>
          <p className="text-slate-500 font-medium animate-pulse">Syncing material records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Oops! Load Failed</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={loadData}
            className="flex items-center justify-center space-x-2 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-teal-200"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-600 p-2 rounded-lg">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">PIR DASHBOARD <span className="text-teal-600">PRO</span></h1>
          </div>
          <div className="text-xs text-slate-400 font-medium">Last Sync: {new Date().toLocaleTimeString()}</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {data && (
          <>
            <section>
              <GeneralInfoCard generalData={data.generalData} />
            </section>

            <section>
              <FindingSection 
                findings={data.findings}
                selectedIndex={selectedFindingIndex}
                onSelect={handleFindingChange}
              />
            </section>

            {selectedFindingIndex !== null && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <MaterialSection 
                  materials={currentMaterials}
                  isEditMode={isEditMode}
                  onToggleEdit={() => setIsEditMode(!isEditMode)}
                  onUpdateMaterial={handleUpdateMaterial}
                  onAddRow={handleAddRow}
                  onRemoveRows={handleDeleteRows}
                  onRemoveLastRow={handleRemoveLastRow}
                  onReset={handleResetMaterials}
                  onSave={handleSave}
                  isLoading={transitionLoading}
                />
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
