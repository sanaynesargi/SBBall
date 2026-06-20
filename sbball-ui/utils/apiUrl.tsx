// The API now lives in this same Next.js app under /api/*, so calls are
// same-origin and apiUrl is an empty string by default. An optional
// NEXT_PUBLIC_API_URL override remains for pointing at an external host.
export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
