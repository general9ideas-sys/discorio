export function isDemoMode() {
  return process.env.DEMO_MODE === "true" || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function adminPin() {
  return process.env.ADMIN_PIN || "discorio2026";
}
