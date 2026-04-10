import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_type: string;
  provider_name: string | null;
  location: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useAppointments = (patientId: string | null = null) => {
  return useQuery({
    queryKey: ['appointments', patientId],
    queryFn: async () => {
      if (!patientId) return [] as Appointment[];

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!patientId,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAppointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert([newAppointment])
        .select()
        .single();

      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', data.patient_id] });
    },
  });
};
