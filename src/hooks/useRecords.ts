import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { enqueueOfflineMutation } from '@/lib/offlineQueue';

export interface MedicalRecord {
  id: string;
  patient_id: string;
  record_type: 'Cardiology' | 'Neurology' | 'General' | 'Surgery' | 'Dermatology' | 'Orthopedics' | 'Emergency';
  date_of_visit: string;
  summary: string;
  diagnosis: string | null;
  treatment_plan: string | null;
  prescribed_medications: string | null;
  vital_signs: Record<string, unknown> | null;
  notes: string | null;
  provider_name: string | null;
  provider_specialty: string | null;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useRecords = (patientId: string | null = null) => {
  return useQuery({
    queryKey: ['records', patientId],
    queryFn: async () => {
      let query = supabase
        .from('medical_records')
        .select('*')
        .order('date_of_visit', { ascending: false });

      if (patientId) {
        query = query.eq('patient_id', patientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as MedicalRecord[];
    },
    enabled: !!patientId,
  });
};

export const useAllRecords = () => {
  return useQuery({
    queryKey: ['all-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .order('date_of_visit', { ascending: false });

      if (error) throw error;
      return data as MedicalRecord[];
    },
  });
};

export const useCreateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newRecord: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>) => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const queued = enqueueOfflineMutation('create-record', newRecord as Record<string, unknown>);
        return {
          ...(newRecord as MedicalRecord),
          id: `offline-${queued.id}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as MedicalRecord;
      }

      const { data, error } = await supabase
        .from('medical_records')
        .insert([newRecord])
        .select()
        .single();

      if (error) throw error;
      return data as MedicalRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['records', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['all-records'] });
    },
  });
};

export const useUpdateRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MedicalRecord> & { id: string; patient_id?: string }) => {
      const { data, error } = await supabase
        .from('medical_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MedicalRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['records', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['all-records'] });
    },
  });
};

export const useDeleteRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['all-records'] });
    },
  });
};
