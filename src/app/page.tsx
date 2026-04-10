"use client";

import React from 'react';
import { Activity, CalendarDays, ChevronRight, Heart, Stethoscope, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuthContext';
import { useRecords } from '@/hooks/useRecords';
import { useTriageHistory } from '@/hooks/useTriageHistory';
import { useAppointments } from '@/hooks/useAppointments';
import { LastSyncedIndicator } from '@/components/LastSyncedIndicator';

export default function DashboardPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const patientId = profile?.id || null;

  const { data: records = [], isLoading: recordsLoading } = useRecords(patientId);
  const { data: triageHistory = [], isLoading: triageLoading } = useTriageHistory(patientId);
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments(patientId);

  const latestRecord = records[0];
  const latestTriage = triageHistory[0];
  const nextAppointment = appointments.find((appointment) => {
    return new Date(appointment.appointment_date).getTime() >= Date.now();
  });

  const vitalSigns = (latestRecord?.vital_signs || {}) as Record<string, string | number>;
  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : 'Patient';

  const reminders = [
    nextAppointment
      ? {
          id: 'appointment',
          title: `Upcoming ${nextAppointment.appointment_type}`,
          detail: `With ${nextAppointment.provider_name || 'specialist'} on ${new Date(nextAppointment.appointment_date).toLocaleString()}`,
          priority: 'high',
        }
      : null,
    latestTriage && latestTriage.urgency !== 'low'
      ? {
          id: 'triage-followup',
          title: 'Triage Follow-up Needed',
          detail: `Last triage urgency: ${latestTriage.urgency}. Review recommendation and book follow-up if needed.`,
          priority: latestTriage.urgency === 'emergency' ? 'high' : 'medium',
        }
      : null,
    records.length === 0
      ? {
          id: 'first-record',
          title: 'Add Your First Clinical Record',
          detail: 'Start your digital health timeline by adding your first record.',
          priority: 'medium',
        }
      : null,
  ].filter(Boolean) as Array<{ id: string; title: string; detail: string; priority: 'medium' | 'high' }>;

  return (
    <div className="flex flex-col gap-12 px-2 md:px-6 lg:px-8 pb-8">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7">
          <div className="max-w-4xl">
            <h1 className="font-serif text-6xl text-on-surface mb-4 font-light tracking-tight">Welcome back, {fullName}.</h1>
            <p className="font-serif text-xl text-on-surface-variant max-w-2xl italic">
              {latestRecord
                ? `Your latest ${latestRecord.record_type} report was recorded on ${new Date(latestRecord.date_of_visit).toLocaleDateString()}.`
                : 'Your profile is ready. Start by adding your first clinical record or running a symptom triage.'}
            </p>
          </div>
          <div className="mt-4">
            <LastSyncedIndicator
              pageKey="dashboard"
              shouldMarkSynced={!recordsLoading && !triageLoading && !appointmentsLoading}
            />
          </div>
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => router.push('/triage')}
              className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-3 rounded-md font-medium text-sm flex items-center gap-2 hover:shadow-lg transition-all active:scale-95 duration-200"
            >
              <Stethoscope className="w-5 h-5" />
              Start Symptom Triage
            </button>
            <button 
              onClick={() => router.push('/records')}
              className="px-8 py-3 rounded-md font-medium text-sm text-on-surface bg-surface-container-lowest hover:bg-surface-container-low transition-colors"
            >
              View Health Records
            </button>
          </div>
        </div>
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[0px_32px_64px_rgba(0,71,141,0.04)] border border-outline-variant/10 p-8 flex flex-col justify-between min-h-[450px]">
          <div>
            <h3 className="font-serif text-2xl font-bold mb-4 text-on-surface">User Card</h3>
            <p className="text-on-surface-variant mb-6">Synced from your authenticated profile</p>
          </div>
          <div className="space-y-4">
            <div className="bg-surface-container-low p-4 rounded-lg">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-1">Patient Name</p>
              <p className="font-serif text-lg">{fullName}</p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-lg">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-1">Email</p>
              <p className="font-serif text-lg break-all">{profile?.email || 'N/A'}</p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-lg">
              <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mb-1">Blood Type</p>
              <p className="font-serif text-lg">{profile?.blood_type || 'Not set'}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-8 rounded-none flex flex-col justify-between min-h-[220px] shadow-[0px_12px_32px_rgba(0,71,141,0.04)]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Blood Pressure</span>
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-normal">{String(vitalSigns.blood_pressure || '--')}</span>
              </div>
              <p className="text-[10px] font-bold mt-2 text-on-surface-variant/60">LATEST RECORD</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-none flex flex-col justify-between min-h-[220px] shadow-[0px_12px_32px_rgba(0,71,141,0.04)]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Heart Rate</span>
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-normal">{String(vitalSigns.heart_rate || '--')}</span>
                <span className="font-serif text-xl text-on-surface-variant italic">BPM</span>
              </div>
              <p className="text-[10px] font-bold mt-2 text-on-surface-variant/60">LATEST RECORD</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-8 rounded-none flex flex-col justify-between min-h-[220px] shadow-[0px_12px_32px_rgba(0,71,141,0.04)]">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Temperature</span>
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-normal">{String(vitalSigns.temperature || '--')}</span>
              </div>
              <p className="text-[10px] font-bold mt-2 text-on-surface-variant/60">LATEST RECORD</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-surface-container-low p-8 rounded-none">
          <h3 className="font-serif text-lg font-bold mb-8">Recent Symptom Checks</h3>
          <div className="space-y-6">
            {triageHistory.length === 0 ? (
              <p className="text-xs text-on-surface-variant">No triage history found yet.</p>
            ) : (
              triageHistory.slice(0, 3).map((check) => (
                <div key={check.id} className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2"></div>
                <div>
                    <p className="text-sm font-bold text-on-surface capitalize">{check.detected_area || 'General'} symptoms</p>
                    <p className="text-[10px] text-on-surface-variant">
                      {new Date(check.created_at).toLocaleDateString()} • {check.urgency}
                    </p>
                </div>
              </div>
              ))
            )}
          </div>
          <button
            onClick={() => router.push('/records')}
            className="mt-8 text-primary font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
          >
            View History <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </section>

      <section className="bg-surface-container-lowest p-12 shadow-[0px_32px_64px_rgba(0,71,141,0.03)] overflow-hidden relative rounded-xl">
        <h2 className="font-serif text-4xl font-bold text-primary mb-6 leading-tight">Clinical Snapshot</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-surface-container-low border-l-4 border-primary">
            <h4 className="font-serif italic text-xl mb-2">Latest Diagnosis</h4>
            <p className="text-xs text-on-surface-variant">{latestRecord?.diagnosis || 'No diagnosis recorded yet.'}</p>
          </div>
          <div className="p-6 bg-surface-container-low border-l-4 border-secondary">
            <h4 className="font-serif italic text-xl mb-2">Last Recommendation</h4>
            <p className="text-xs text-on-surface-variant">{latestTriage?.recommendation || 'No triage recommendation available yet.'}</p>
          </div>
          <div className="p-6 bg-primary text-white rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-70">Next Appointment</p>
              <CalendarDays className="w-4 h-4" />
            </div>
            <p className="font-serif text-lg italic">
              {nextAppointment
                ? `${nextAppointment.appointment_type} on ${new Date(nextAppointment.appointment_date).toLocaleString()}`
                : 'No upcoming appointment scheduled.'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-serif text-2xl font-bold mb-6">Upcoming Appointments</h3>
          {appointments.length === 0 ? (
            <div className="bg-surface-container-lowest p-6 shadow-sm rounded-lg">
              <p className="text-sm text-on-surface-variant">No upcoming appointments in the database.</p>
            </div>
          ) : (
            appointments.slice(0, 3).map((apt) => (
              <div key={apt.id} className="bg-surface-container-lowest p-6 flex items-center justify-between shadow-sm rounded-lg hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-6">
                <div className="text-center bg-surface-container-low px-4 py-2 rounded">
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant">{new Date(apt.appointment_date).toLocaleString('en-US', { month: 'short' })}</p>
                    <p className="font-serif text-2xl">{new Date(apt.appointment_date).getDate()}</p>
                </div>
                <div>
                    <p className="font-bold text-on-surface">{apt.appointment_type}</p>
                    <p className="text-[10px] text-on-surface-variant italic">
                      {apt.provider_name || 'Specialist'} • {new Date(apt.appointment_date).toLocaleTimeString()}
                    </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-outline-variant" />
            </div>
            ))
          )}
        </div>
        <div className="bg-surface-container-low p-8 flex flex-col justify-between rounded-xl">
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">Record Summary</h3>
            <div className="space-y-6">
              <div className="group">
                <p className="text-[10px] font-bold text-primary uppercase mb-1">Total Medical Records</p>
                <p className="font-serif text-lg leading-snug">{records.length}</p>
              </div>
              <div className="group">
                <p className="text-[10px] font-bold text-primary uppercase mb-1">Total Triage Entries</p>
                <p className="font-serif text-lg leading-snug">{triageHistory.length}</p>
              </div>
            </div>
          </div>
          <div className="mt-8 h-40 w-full rounded-lg bg-surface-container-low flex items-center justify-center">
            <p className="text-sm text-on-surface-variant">All values on this page are loaded from your database profile.</p>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-serif text-2xl text-on-surface">Reminders</h3>
          </div>
          <button
            onClick={() => router.push('/notifications')}
            className="text-primary font-bold text-[10px] uppercase tracking-widest hover:underline"
          >
            View All Notifications
          </button>
        </div>

        <div className="space-y-4">
          {reminders.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No urgent reminders right now. You are all caught up.</p>
          ) : (
            reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="p-4 rounded-lg bg-white border border-outline-variant/10 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-bold text-on-surface">{reminder.title}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{reminder.detail}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                    reminder.priority === 'high' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'
                  }`}
                >
                  {reminder.priority}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
