import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Patient {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string | null;
  blood_type: string | null;
  allergies: string | null;
  medical_conditions: string[];
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export const usePatient = (patientId: string | null = null) => {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      if (!patientId) return null;

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();

      if (error) throw error;
      return data as Patient;
    },
    enabled: !!patientId,
  });
};

export const usePatients = () => {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Patient[];
    },
  });
};

/**
 * Get the current authenticated user's patient profile
 * Use this when you already have the user from AuthContext
 */
export const useCurrentUserPatient = (userId: string | null = null) => {
  return useQuery({
    queryKey: ['current-patient', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Patient might not exist yet if just created
        console.error('Error fetching patient:', error);
        return null;
      }
      return data as Patient;
    },
    enabled: !!userId,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPatient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('patients')
        .insert([newPatient])
        .select()
        .single();

      if (error) throw error;
      return data as Patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['current-patient'] });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Patient> & { id: string }) => {
      const { data, error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Patient;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', data.id] });
      queryClient.invalidateQueries({ queryKey: ['current-patient'] });
    },
  });
};
