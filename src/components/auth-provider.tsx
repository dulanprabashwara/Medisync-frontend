"use client";

import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, getMyProfile } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { MediSyncProfile } from "@/types/user";

interface AuthContextValue {
  session: Session | null;
  profile: MediSyncProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<MediSyncProfile | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(session: Session): Promise<MediSyncProfile | null> {
  try {
    return await getMyProfile(session.access_token);
  } catch (error) {
    if (error instanceof ApiError && error.code === "ONBOARDING_REQUIRED") {
      return null;
    }
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<MediSyncProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const applySession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    setError(null);
    if (!nextSession) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setProfile(await fetchProfile(nextSession));
    } catch (profileError) {
      setProfile(null);
      setError(
        profileError instanceof Error
          ? profileError.message
          : "Your MediSync profile could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let client: ReturnType<typeof getSupabaseBrowserClient>;
    try {
      client = getSupabaseBrowserClient();
    } catch (configurationError) {
      const timer = window.setTimeout(() => {
        setError(
          configurationError instanceof Error
            ? configurationError.message
            : "Supabase authentication is not configured.",
        );
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    void client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
        return;
      }
      void applySession(data.session);
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setLoading(true);
      window.setTimeout(() => void applySession(nextSession), 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [applySession]);

  const refreshProfile = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    const { data, error: sessionError } = await client.auth.getSession();
    if (sessionError || !data.session) {
      setSession(null);
      setProfile(null);
      if (sessionError) setError(sessionError.message);
      return null;
    }

    setLoading(true);
    try {
      const nextProfile = await fetchProfile(data.session);
      setSession(data.session);
      setProfile(nextProfile);
      setError(null);
      return nextProfile;
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : "Your MediSync profile could not be loaded.",
      );
      throw profileError;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    await client.auth.signOut();
    setSession(null);
    setProfile(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ session, profile, loading, error, refreshProfile, signOut }),
    [session, profile, loading, error, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
