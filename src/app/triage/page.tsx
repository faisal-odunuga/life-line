"use client";

import React, { useState } from 'react';
import { 
  Activity, 
  RotateCw
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { analyzeSymptomsWithGemini } from '@/services/geminiService';
import { useCreateTriageEntry } from '@/hooks/useTriageHistory';
import { useAuth } from '@/hooks/useAuthContext';
import { LastSyncedIndicator } from '@/components/LastSyncedIndicator';

type TriageResult = {
  detectedArea: string;
  confidence: 'low' | 'medium' | 'high';
  keywordsMatched: string[];
  explanation: string;
  recommendation: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
};

export default function TriagePage() {
  const { profile } = useAuth();
  const [symptoms, setSymptoms] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);
  const [sosStatus, setSosStatus] = useState<string | null>(null);
  const [isCallingSos, setIsCallingSos] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const createTriageEntry = useCreateTriageEntry();

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const analysis = await analyzeSymptomsWithGemini(symptoms);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setResult(null);
      setAnalysisError(err instanceof Error ? err.message : 'Unable to complete AI analysis at the moment.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToRecords = async () => {
    if (!result || !profile?.id) return;
    
    setIsSaving(true);
    setQueueMessage(null);
    try {
      const saved = await createTriageEntry.mutateAsync({
        patient_id: profile.id,
        symptoms,
        detected_area: result.detectedArea,
        confidence: result.confidence as 'low' | 'medium' | 'high',
        keywords_matched: result.keywordsMatched || [],
        ai_explanation: result.explanation,
        recommendation: result.recommendation,
        urgency: result.urgency,
        status: 'completed'
      });

      if (saved.id.startsWith('offline-')) {
        setQueueMessage('Saved offline. This triage entry will sync automatically once internet is restored.');
      }
      
      // Reset form after saving
      setSymptoms("");
      setResult(null);
    } catch (err) {
      console.error("Error saving triage entry:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmergencySos = async () => {
    if (!result) return;

    if (!('geolocation' in navigator)) {
      setSosStatus('Geolocation is not supported on this device. Please call local emergency services directly.');
      return;
    }

    setIsCallingSos(true);
    setSosStatus('Requesting location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          setSosStatus('Finding nearest hospital and dispatching SOS...');
          const response = await fetch('/api/emergency/sos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              urgency: result.urgency,
              symptoms,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Emergency SOS request failed');
          }

          if (data.dispatch?.dispatched) {
            setSosStatus(`SOS sent. Nearest hospital: ${data.nearestHospital?.name || 'Found nearby hospital'}.`);
          } else {
            setSosStatus(`Nearest hospital found: ${data.nearestHospital?.name || 'N/A'}. Dispatch pending: ${data.dispatch?.reason || 'No dispatch endpoint configured.'}`);
          }
        } catch (error) {
          setSosStatus(error instanceof Error ? error.message : 'Unable to process SOS at this moment.');
        } finally {
          setIsCallingSos(false);
        }
      },
      (error) => {
        setSosStatus(`Location access failed: ${error.message}. Please call emergency services directly.`);
        setIsCallingSos(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto">
      <section>
        <h1 className="font-serif text-5xl text-on-surface tracking-tight mb-4">Symptom Triage</h1>
        <p className="font-serif text-xl text-on-surface-variant italic max-w-2xl">
          Our AI-assisted triage system helps prioritize your care based on real-time symptom analysis and clinical history.
        </p>
        <div className="mt-3">
          <LastSyncedIndicator pageKey="triage" shouldMarkSynced={!!profile?.id} />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-xl border border-outline-variant/10 shadow-sm">
            <h3 className="font-serif text-2xl mb-6">Describe Your Symptoms</h3>
            <div className="space-y-6">
              <textarea 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full p-6 rounded-xl border border-outline-variant/20 bg-surface-container-low focus:border-primary focus:ring-0 transition-all min-h-[180px] font-sans text-lg"
                placeholder="e.g., 'I have been feeling a sharp pain in my chest for the last hour, and it's making it hard to breathe...'"
              ></textarea>
              
              <div className="flex flex-wrap gap-3">
                {['Chest Pain', 'Headache', 'Dizziness', 'Nausea', 'Fatigue'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setSymptoms(prev => prev ? `${prev}, ${s}` : s)}
                    className="px-4 py-2 rounded-full border border-outline-variant/30 text-xs font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
                  >
                    + {s}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-primary text-white py-5 rounded-xl font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin" />
                    Analyzing with Clinical AI...
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    Start Clinical Analysis
                  </>
                )}
              </button>

              {analysisError && (
                <div className="p-4 rounded-lg border border-error/30 bg-error/10">
                  <p className="text-sm font-semibold text-error">AI analysis error</p>
                  <p className="text-xs text-error mt-1">{analysisError}</p>
                </div>
              )}

              {queueMessage && (
                <div className="p-4 rounded-lg border border-warning/30 bg-warning/10">
                  <p className="text-sm font-semibold text-warning">Offline queue</p>
                  <p className="text-xs text-warning mt-1">{queueMessage}</p>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-xl border border-primary/20 shadow-xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">AI Diagnostic Insight</span>
                    <h3 className="font-serif text-3xl capitalize">{result.detectedArea} Analysis</h3>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    result.urgency === 'emergency' ? 'bg-error text-white' :
                    result.urgency === 'high' ? 'bg-error/10 text-error' :
                    'bg-success/10 text-success'
                  }`}>
                    Urgency: {result.urgency}
                  </div>
                </div>
                
                <p className="text-on-surface-variant leading-relaxed mb-8 text-lg italic font-serif">
                  {result.explanation}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-4 bg-surface-container-low rounded-lg">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Recommendation</p>
                    <p className="text-sm font-medium">{result.recommendation}</p>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-lg">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Keywords Detected</p>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordsMatched.map((k: string) => (
                        <span key={k} className="px-2 py-1 bg-white border border-outline-variant/20 rounded text-[10px] font-bold text-primary">{k}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={handleSaveToRecords}
                    disabled={isSaving || !profile?.id}
                    className="flex-1 bg-surface-container-highest text-on-surface py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-surface-container-high transition-all disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save to Records'}
                  </button>
                  <button className="flex-1 bg-primary text-white py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all">
                    Consult Specialist
                  </button>
                </div>

                {(result.urgency === 'high' || result.urgency === 'emergency') && (
                  <div className="mt-4 space-y-3">
                    <button
                      onClick={handleEmergencySos}
                      disabled={isCallingSos}
                      className="w-full bg-error text-white py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                    >
                      {isCallingSos ? 'Triggering Emergency SOS...' : 'Trigger Emergency SOS'}
                    </button>
                    {sosStatus && (
                      <p className="text-xs text-on-surface-variant">{sosStatus}</p>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
            <h4 className="font-serif text-lg mb-4">Triage Protocol</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
              Your data is cross-referenced with your current clinical profile and historical biometric data using Gemini 3.0 Flash.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-medium">Biometric Sync Active</span>
              </div>
            </div>
          </div>
          
          <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Emergency</p>
            <p className="text-sm font-medium text-primary mb-4">If you are experiencing severe chest pain or difficulty breathing, call emergency services immediately.</p>
            <button className="w-full bg-white text-primary py-3 rounded-lg font-bold text-[10px] uppercase tracking-widest border border-primary/20">
              Contact Emergency Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
