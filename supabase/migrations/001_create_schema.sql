-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE record_type AS ENUM ('Cardiology', 'Neurology', 'General', 'Surgery', 'Dermatology', 'Orthopedics', 'Emergency');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'emergency');
CREATE TYPE triage_status AS ENUM ('pending', 'completed', 'escalated');

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  blood_type VARCHAR(10),
  allergies TEXT,
  medical_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  record_type record_type NOT NULL,
  date_of_visit DATE NOT NULL,
  summary TEXT NOT NULL,
  diagnosis TEXT,
  treatment_plan TEXT,
  prescribed_medications TEXT,
  vital_signs JSONB, -- { blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation }
  notes TEXT,
  provider_name VARCHAR(255),
  provider_specialty VARCHAR(255),
  urgency urgency_level DEFAULT 'low',
  attachment_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create triage_history table
CREATE TABLE IF NOT EXISTS triage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  symptoms TEXT NOT NULL,
  detected_area VARCHAR(255),
  confidence VARCHAR(10), -- 'low', 'medium', 'high'
  keywords_matched TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_explanation TEXT,
  recommendation TEXT,
  urgency urgency_level DEFAULT 'low',
  status triage_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  appointment_type VARCHAR(255) NOT NULL,
  provider_name VARCHAR(255),
  location VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_date ON medical_records(date_of_visit);
CREATE INDEX idx_triage_history_patient_id ON triage_history(patient_id);
CREATE INDEX idx_triage_history_created_at ON triage_history(created_at);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE triage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for patients table
CREATE POLICY "Users can view their own patient profile"
  ON patients FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own patient profile"
  ON patients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patient profile"
  ON patients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create RLS Policies for medical_records table
CREATE POLICY "Users can view their own medical records"
  ON medical_records FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert medical records for their patient profile"
  ON medical_records FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own medical records"
  ON medical_records FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Create RLS Policies for triage_history table
CREATE POLICY "Users can view their own triage history"
  ON triage_history FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert triage history for their patient profile"
  ON triage_history FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own triage history"
  ON triage_history FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Create RLS Policies for appointments table
CREATE POLICY "Users can view their own appointments"
  ON appointments FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert appointments for their patient profile"
  ON appointments FOR INSERT
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own appointments"
  ON appointments FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_triage_history_updated_at BEFORE UPDATE ON triage_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create patient profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.patients (
    user_id,
    first_name,
    last_name,
    email,
    date_of_birth
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'First'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'date_of_birth')::DATE, '1990-01-01'::DATE)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function on auth.users table
-- Note: You may need to enable this trigger in Supabase dashboard
-- Settings > Database > Webhooks or through the Realtime interface
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
