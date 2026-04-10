"use client";

import React from 'react';
import { Bell, CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { useAppointments } from '@/hooks/useAppointments';
import { useTriageHistory } from '@/hooks/useTriageHistory';
import { useRecords } from '@/hooks/useRecords';
import { LastSyncedIndicator } from '@/components/LastSyncedIndicator';

export default function NotificationsPage() {
  const { profile } = useAuth();
  const patientId = profile?.id || null;

  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments(patientId);
  const { data: triageHistory = [], isLoading: triageLoading } = useTriageHistory(patientId);
  const { data: records = [], isLoading: recordsLoading } = useRecords(patientId);

  const upcomingAppointments = appointments
    .filter((item) => new Date(item.appointment_date).getTime() >= Date.now())
    .slice(0, 5)
    .map((item) => ({
      id: `apt-${item.id}`,
      title: `Upcoming appointment: ${item.appointment_type}`,
      detail: `${item.provider_name || 'Specialist'} on ${new Date(item.appointment_date).toLocaleString()}`,
      severity: 'info' as const,
      icon: CalendarDays,
    }));

  const urgentTriage = triageHistory
    .filter((item) => item.urgency === 'high' || item.urgency === 'emergency')
    .slice(0, 5)
    .map((item) => ({
      id: `triage-${item.id}`,
      title: `Triage follow-up required (${item.urgency})`,
      detail: item.recommendation || 'Review your latest triage result and follow the recommendation.',
      severity: 'warning' as const,
      icon: AlertTriangle,
    }));

  const recordStatus = records.length === 0
    ? [
        {
          id: 'record-empty',
          title: 'No clinical records yet',
          detail: 'Add your first medical record to unlock trend-based reminders.',
          severity: 'info' as const,
          icon: Bell,
        },
      ]
    : [
        {
          id: 'record-ok',
          title: 'Clinical record sync active',
          detail: `${records.length} records synced to your profile.`,
          severity: 'success' as const,
          icon: CheckCircle2,
        },
      ];

  const notifications = [...urgentTriage, ...upcomingAppointments, ...recordStatus];

  const warningCount = notifications.filter((item) => item.severity === 'warning').length;
  const infoCount = notifications.filter((item) => item.severity === 'info').length;
  const successCount = notifications.filter((item) => item.severity === 'success').length;

  return (
    <div className="max-w-6xl mx-auto px-2 md:px-6 lg:px-8 py-4 flex flex-col gap-8">
      <header>
        <h1 className="font-serif text-5xl text-on-surface tracking-tight mb-2">Notifications</h1>
        <p className="font-serif text-xl text-on-surface-variant italic">
          AI and care reminders generated from your live profile data.
        </p>
        <div className="mt-3">
          <LastSyncedIndicator
            pageKey="notifications"
            shouldMarkSynced={!appointmentsLoading && !triageLoading && !recordsLoading}
          />
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-error/20 bg-error/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-error">High Priority</p>
          <p className="font-serif text-3xl text-error mt-1">{warningCount}</p>
          <p className="text-xs text-on-surface-variant mt-1">Urgent follow-ups and clinical risk alerts.</p>
        </div>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">General Alerts</p>
          <p className="font-serif text-3xl text-primary mt-1">{infoCount}</p>
          <p className="text-xs text-on-surface-variant mt-1">Appointments, reminders, and important updates.</p>
        </div>
        <div className="rounded-xl border border-success/20 bg-success/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-success">Resolved</p>
          <p className="font-serif text-3xl text-success mt-1">{successCount}</p>
          <p className="text-xs text-on-surface-variant mt-1">Synced status and completed health actions.</p>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-outline-variant/10 bg-surface-container-low">
          <h2 className="font-serif text-2xl text-on-surface">Recent Alerts</h2>
        </div>

        <div className="p-5 space-y-4">
          {notifications.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No notifications at this time.</p>
          ) : (
            notifications.map((item) => (
              <div key={item.id} className="p-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest flex items-start gap-4">
                <div className={`p-2 rounded-lg ${
                  item.severity === 'warning' ? 'bg-error/10 text-error' :
                  item.severity === 'success' ? 'bg-success/10 text-success' :
                  'bg-primary/10 text-primary'
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-on-surface">{item.title}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{item.detail}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
