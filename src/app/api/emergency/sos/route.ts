import { NextResponse } from 'next/server';

interface SOSRequestBody {
  latitude: number;
  longitude: number;
  symptoms?: string;
  urgency?: 'low' | 'medium' | 'high' | 'emergency';
}

type OverpassElement = {
  lat?: number;
  lon?: number;
  center?: {
    lat?: number;
    lon?: number;
  };
  tags?: Record<string, string | undefined>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

async function findNearestHospitals(latitude: number, longitude: number) {
  const radius = 8000;
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${latitude},${longitude});
      way["amenity"="hospital"](around:${radius},${latitude},${longitude});
      relation["amenity"="hospital"](around:${radius},${latitude},${longitude});
    );
    out center tags 10;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: query,
  });

  if (!response.ok) {
    throw new Error('Failed to search nearby hospitals');
  }

  const data = (await response.json()) as OverpassResponse;
  const elements = Array.isArray(data?.elements) ? data.elements : [];

  return elements.slice(0, 5).map((item) => {
    const lat = item.lat ?? item.center?.lat;
    const lon = item.lon ?? item.center?.lon;
    return {
      name: item.tags?.name || 'Nearby Hospital',
      latitude: lat,
      longitude: lon,
      address: [item.tags?.['addr:street'], item.tags?.['addr:city']].filter(Boolean).join(', ') || 'Address unavailable',
    };
  }).filter((item) => typeof item.latitude === 'number' && typeof item.longitude === 'number');
}

async function dispatchEmergency(payload: Record<string, unknown>) {
  const dispatchUrl = process.env.HEALTH_EMERGENCY_API_URL;
  const dispatchToken = process.env.HEALTH_EMERGENCY_API_TOKEN;

  if (!dispatchUrl) {
    return {
      dispatched: false,
      reason: 'HEALTH_EMERGENCY_API_URL not configured',
    };
  }

  const response = await fetch(dispatchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(dispatchToken ? { Authorization: `Bearer ${dispatchToken}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return {
      dispatched: false,
      reason: `Dispatch API returned ${response.status}`,
    };
  }

  return {
    dispatched: true,
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SOSRequestBody;

    if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
      return NextResponse.json({ error: 'latitude and longitude are required' }, { status: 400 });
    }

    const hospitals = await findNearestHospitals(body.latitude, body.longitude);
    const nearestHospital = hospitals[0] || null;

    const dispatchPayload = {
      eventType: 'clinical_emergency_sos',
      createdAt: new Date().toISOString(),
      location: {
        latitude: body.latitude,
        longitude: body.longitude,
      },
      urgency: body.urgency || 'high',
      symptoms: body.symptoms || 'Not provided',
      nearestHospital,
    };

    const dispatchResult = await dispatchEmergency(dispatchPayload);

    return NextResponse.json({
      nearestHospital,
      nearbyHospitals: hospitals,
      dispatch: dispatchResult,
    });
  } catch (error) {
    console.error('Emergency SOS Error:', error);
    return NextResponse.json({ error: 'Failed to process emergency SOS request' }, { status: 500 });
  }
}
