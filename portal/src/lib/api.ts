import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * For client-side requests, we use a wrapper that attaches the user token.
 * Import `useSession` from next-auth/react in your component, then call:
 *   const { data: session } = useSession();
 *   const userId = (session?.user as { id?: string })?.id;
 *   apiWithToken(userId).post("/verify", data);
 */
export function apiWithToken(token: string | null) {
  const instance = axios.create({
    baseURL: "/api/proxy",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return instance;
}

export default api;
