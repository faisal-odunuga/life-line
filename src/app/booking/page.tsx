"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuthContext';
import { useAppointments } from '@/hooks/useAppointments';
import { LastSyncedIndicator } from '@/components/LastSyncedIndicator';

export default function BookingPage() {
  const { profile } = useAuth();
  const { data: appointments = [], isLoading } = useAppointments(profile?.id || null);

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto">
      <section>
        <h1 className="font-serif text-5xl text-on-surface tracking-tight mb-4">Specialist Booking</h1>
        <p className="font-serif text-xl text-on-surface-variant italic max-w-2xl">
          Schedule a consultation with our world-class clinical specialists.
        </p>
        <div className="mt-3">
          <LastSyncedIndicator pageKey="booking" shouldMarkSynced={!isLoading} />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-xl border border-outline-variant/10 shadow-sm">
            <h3 className="font-serif text-2xl mb-6">Upcoming Appointments</h3>
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="p-6 rounded-lg border border-outline-variant/20">
                  <p className="text-sm text-on-surface-variant">No appointments found in your schedule.</p>
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-6 rounded-lg border border-outline-variant/20 hover:border-primary transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-xs font-bold text-on-surface-variant">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{appointment.provider_name || 'Specialist'}</p>
                        <p className="text-xs text-on-surface-variant">{appointment.appointment_type}</p>
                        <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-widest">
                          {new Date(appointment.appointment_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-opacity">
                      {appointment.status}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
            <h4 className="font-serif text-lg mb-4">Your Schedule</h4>
            <p className="text-xs text-on-surface-variant italic mb-4">
              {appointments.length === 0 ? 'No upcoming bookings this week.' : `${appointments.length} upcoming booking(s).`}
            </p>
            <button className="w-full text-primary font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
              View Full Calendar <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
