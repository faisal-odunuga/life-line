"use client";

import React from 'react';
import { PatientRecords } from '@/components/PatientRecords';

export default function RecordsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="px-4">
        <h1 className="font-serif text-5xl text-on-surface tracking-tight mb-2">Patient Records</h1>
        <p className="font-serif text-xl text-on-surface-variant italic">Comprehensive clinical history and diagnostic reports.</p>
      </header>
      <PatientRecords />
    </div>
  );
}
