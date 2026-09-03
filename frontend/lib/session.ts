const SESSION_KEY = "grill_session";
const ROLE_KEY = "grill_role";

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(SESSION_KEY));
}

export function login(email: string, role: string = "Student"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, email.trim());
  localStorage.setItem(ROLE_KEY, role);
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function currentUser(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function currentRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_KEY) || "Student";
}
