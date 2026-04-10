"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  ChevronRight, 
  Calendar, 
  User, 
  Activity,
  Download,
  MoreVertical,
  Loader
} from 'lucide-react';
import { useRecords } from '@/hooks/useRecords';
import { useAuth } from '@/hooks/useAuthContext';
import { LastSyncedIndicator } from '@/components/LastSyncedIndicator';

export const PatientRecords: React.FC = () => {
  const { profile } = useAuth();
  const { data: records = [], isLoading } = useRecords(profile?.id || null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      (r.provider_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      r.record_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [records, searchTerm]);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-serif text-5xl text-on-surface tracking-tight mb-2">Clinical Records</h1>
          <p className="font-serif text-xl text-on-surface-variant italic">Comprehensive history and diagnostic archive.</p>
          <div className="mt-3">
            <LastSyncedIndicator pageKey="records" shouldMarkSynced={!isLoading} />
          </div>
        </div>
        <button className="bg-primary text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" />
          New Entry
        </button>
      </header>

      <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant/10 flex gap-4 items-center bg-surface-container-low">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search records by type or summary..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant/20 bg-white focus:border-primary focus:ring-0 transition-all text-sm"
            />
          </div>
          <button className="p-3 border border-outline-variant/20 rounded-xl hover:bg-white transition-all">
            <Filter className="w-4 h-4 text-on-surface-variant" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/10">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Date</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Patient</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Specialty</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Summary</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Urgency</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode='popLayout'>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader className="w-6 h-6 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <FileText className="w-12 h-12 text-outline-variant mx-auto mb-4 opacity-20" />
                      <p className="font-serif text-xl text-on-surface-variant italic">No records found matching your search.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={record.id} 
                      className="border-b border-outline-variant/5 hover:bg-surface-container-lowest transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-on-surface-variant" />
                          <span className="text-sm font-medium">{new Date(record.date_of_visit).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{profile ? `${profile.first_name} ${profile.last_name}` : 'Patient'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-surface-container rounded text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                          {record.record_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-xs text-on-surface-variant line-clamp-1">{record.summary}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            record.urgency === 'emergency' ? 'bg-error' :
                            record.urgency === 'high' ? 'bg-error/60' :
                            record.urgency === 'medium' ? 'bg-warning' :
                            'bg-success'
                          }`} />
                          <span className="text-[10px] font-bold tracking-widest">{record.urgency}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                            <Download className="w-4 h-4 text-on-surface-variant" />
                          </button>
                          <button className="p-2 hover:bg-surface-container rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-on-surface-variant" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
