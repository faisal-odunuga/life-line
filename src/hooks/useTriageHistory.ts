import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { enqueueOfflineMutation } from '@/lib/offlineQueue';

export interface TriageHistory {
  id: string;
  patient_id: string;
  symptoms: string;
  detected_area: string | null;
  confidence: 'low' | 'medium' | 'high' | null;
  keywords_matched: string[];
  ai_explanation: string | null;
  recommendation: string | null;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'completed' | 'escalated';
  created_at: string;
  updated_at: string;
}

export const useTriageHistory = (patientId: string | null = null) => {
  return useQuery({
    queryKey: ['triage-history', patientId],
    queryFn: async () => {
      let query = supabase
        .from('triage_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as TriageHistory[];
    },
    enabled: !!patientId,
  });
};

export const useAllTriageHistory = () => {
  return useQuery({
    queryKey: ['all-triage-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('triage_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TriageHistory[];
    },
  });
};

export const useCreateTriageEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTriage: Omit<TriageHistory, 'id' | 'created_at' | 'updated_at'>) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const queued = enqueueOfflineMutation('create-triage', newTriage as Record<string, unknown>);
        return {
          ...(newTriage as TriageHistory),
          id: `offline-${queued.id}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as TriageHistory;
      }

      const { data, error } = await supabase
        .from('triage_history')
        .insert([newTriage])
        .select()
        .single();

      if (error) throw error;
      return data as TriageHistory;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['triage-history', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['all-triage-history'] });
    },
  });
};

export const useUpdateTriageEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patient_id, ...updates }: Partial<TriageHistory> & { id: string; patient_id?: string }) => {
      const { data, error } = await supabase
        .from('triage_history')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TriageHistory;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['triage-history', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['all-triage-history'] });
    },
  });
};
