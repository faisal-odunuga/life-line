export interface TriageResult {
  detectedArea: 'head' | 'chest' | 'heart' | 'lungs' | 'abdomen' | 'arm' | 'leg' | 'general';
  confidence: 'low' | 'medium' | 'high';
  keywordsMatched: string[];
  explanation: string;
  recommendation: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
}

function getOfflineFallback(symptoms: string): TriageResult {
  const text = symptoms.toLowerCase();
  const keywordsMatched: string[] = [];

  const hasChest = /chest|pressure|tightness/.test(text);
  const hasBreath = /breath|shortness|can't breathe|cant breathe/.test(text);
  const hasHead = /head|migraine|dizzy|dizziness/.test(text);
  const hasAbdomen = /stomach|abdomen|nausea|vomit|gut/.test(text);

  if (hasChest) keywordsMatched.push('chest');
  if (hasBreath) keywordsMatched.push('breathing');
  if (hasHead) keywordsMatched.push('headache/dizziness');
  if (hasAbdomen) keywordsMatched.push('abdominal symptoms');

  if (hasChest && hasBreath) {
    return {
      detectedArea: 'chest',
      confidence: 'medium',
      keywordsMatched,
      explanation: 'Offline triage detected chest and breathing-related symptoms. Online AI review is recommended as soon as connectivity is restored.',
      recommendation: 'Seek urgent clinical evaluation, especially if symptoms are severe or worsening.',
      urgency: 'high',
    };
  }

  if (hasHead) {
    return {
      detectedArea: 'head',
      confidence: 'medium',
      keywordsMatched,
      explanation: 'Offline triage suggests neurological/head-related symptoms based on your description.',
      recommendation: 'Hydrate, rest, and monitor symptoms. Seek care if persistent or severe.',
      urgency: 'medium',
    };
  }

  if (hasAbdomen) {
    return {
      detectedArea: 'abdomen',
      confidence: 'medium',
      keywordsMatched,
      explanation: 'Offline triage suggests abdominal/gastrointestinal symptoms.',
      recommendation: 'Monitor hydration and symptom progression. Seek care if pain intensifies.',
      urgency: 'medium',
    };
  }

  return {
    detectedArea: 'general',
    confidence: 'low',
    keywordsMatched,
    explanation: 'Offline triage could not confidently classify symptoms without full AI analysis.',
    recommendation: 'Reconnect and rerun AI triage for a more complete assessment.',
    urgency: 'low',
  };
}

export async function analyzeSymptomsWithGemini(symptoms: string): Promise<TriageResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return getOfflineFallback(symptoms);
  }

  try {
    const response = await fetch('/api/triage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symptoms }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze symptoms');
    }

    return await response.json();
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return getOfflineFallback(symptoms);
  }
}
