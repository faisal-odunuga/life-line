# Life Line

Life Line is a clinical patient care dashboard built with Next.js, React, TypeScript, Supabase, and TanStack Query.

## Features

- Authenticated clinician / patient workflow
- AI-powered triage analysis with emergency SOS support
- Offline-first data sync and queueing
- Personalized patient records, appointments, and notifications
- Supabase-backed profile, records, triage history, and bookings

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add environment variables for Supabase and Gemini:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - Optional: `HEALTH_EMERGENCY_API_URL`, `HEALTH_EMERGENCY_API_TOKEN`
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the app at `http://localhost:3000`.

## Notes

- The app supports offline mode and will queue mutations when network connectivity is unavailable.
- Emergency SOS uses location and nearest-hospital lookup; configure `HEALTH_EMERGENCY_API_URL` to enable dispatch integration.

## License

This project is provided as-is.
