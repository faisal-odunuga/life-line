"use client";

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getOfflineQueue, incrementOfflineRetry, removeOfflineMutation } from '@/lib/offlineQueue';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineSyncManager() {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!isOnline || syncing) return;

    const syncQueue = async () => {
      setSyncing(true);
      const queue = getOfflineQueue();

      for (const item of queue) {
        try {
          if (item.type === 'create-triage') {
            const { patient_id, symptoms, detected_area, confidence, keywords_matched, ai_explanation, recommendation, urgency, status } = item.payload;
            const { error } = await supabase.from('triage_history').insert([
              {
                patient_id,
                symptoms,
                detected_area,
                confidence,
                keywords_matched,
                ai_explanation,
                recommendation,
                urgency,
                status,
              },
            ]);
            if (error) throw error;
          }

          if (item.type === 'create-record') {
            const {
              patient_id,
              record_type,
              date_of_visit,
              summary,
              diagnosis,
              treatment_plan,
              prescribed_medications,
              vital_signs,
              notes,
              provider_name,
              provider_specialty,
              urgency,
              attachment_url,
            } = item.payload;

            const { error } = await supabase.from('medical_records').insert([
              {
                patient_id,
                record_type,
                date_of_visit,
                summary,
                diagnosis,
                treatment_plan,
                prescribed_medications,
                vital_signs,
                notes,
                provider_name,
                provider_specialty,
                urgency,
                attachment_url,
              },
            ]);
            if (error) throw error;
          }

          removeOfflineMutation(item.id);
        } catch (error) {
          incrementOfflineRetry(item.id);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['triage-history'] });
      setSyncing(false);
    };

    syncQueue();
  }, [isOnline, queryClient, syncing]);

  return null;
}
