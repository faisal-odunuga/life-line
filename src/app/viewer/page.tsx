"use client";

import React from 'react';
import { User, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { useRecords } from '@/hooks/useRecords';
import { useTriageHistory } from '@/hooks/useTriageHistory';

export default function ViewerPage() {
  const { profile } = useAuth();
  const patientId = profile?.id || null;
  const { data: records = [] } = useRecords(patientId);
  const { data: triageHistory = [] } = useTriageHistory(patientId);

  return (
    <div className="flex-1 flex flex-col gap-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end px-4 gap-4">
        <div>
          <h1 className="font-serif text-5xl text-on-surface tracking-tight mb-2">Condition Analysis</h1>
          <p className="font-sans text-on-surface-variant flex items-center gap-2">
            <User className="w-4 h-4" />
            Patient: {profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown'} • Case ID: {patientId ? patientId.slice(0, 8) : 'N/A'}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2.5 font-sans text-sm font-semibold border border-outline-variant/20 bg-white hover:bg-surface-container-low transition-colors rounded-md">
            Export Analysis
          </button>
          <button className="px-6 py-2.5 font-sans text-sm font-semibold text-white bg-gradient-to-br from-primary to-primary-container rounded-lg shadow-[0px_12px_32px_rgba(0,71,141,0.06)] hover:opacity-90 transition-opacity">
            Book Specialist
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] bg-surface-container-lowest rounded-2xl overflow-hidden shadow-xl border border-outline-variant/10 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-outline-variant/30 mx-auto mb-4" />
          <h3 className="font-serif text-2xl text-on-surface mb-2">Analysis Dashboard</h3>
          <p className="text-on-surface-variant max-w-md">Medical records: {records.length} • Symptom analyses: {triageHistory.length}</p>
        </div>
      </div>
    </div>
  );
}
