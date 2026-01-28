
import React from 'react';
import { GeneralData } from '../types';

interface Props {
  generalData: GeneralData;
}

const GeneralInfoCard: React.FC<Props> = ({ generalData }) => {
  const fields = [
    { label: 'WO No', value: generalData.woNo },
    { label: 'Part Description', value: generalData.partDesc },
    { label: 'PN', value: generalData.pn },
    { label: 'SN', value: generalData.sn },
    { label: 'A/C Reg', value: generalData.acReg },
    { label: 'Customer', value: generalData.customer },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">General Description</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fields.map((field) => (
            <div key={field.label} className="space-y-1">
              <label className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
                {field.label}
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 shadow-inner">
                {field.value || '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoCard;
